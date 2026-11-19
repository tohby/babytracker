import { AppState } from 'react-native';

import { acknowledge, getCursor, knownBabies, loadLocal, mergePage, pendingMutations } from '@/data/log-database';
import type { EventSnapshot } from '@/data/log-sync';
import { ApiError } from '@/lib/api';
import { authedRequest } from '@/lib/auth/tokens';

const inFlight = new Map<string, Promise<boolean>>();

export function syncLogs(account: string, onChange: (state: Awaited<ReturnType<typeof loadLocal>>) => void): Promise<boolean> {
  const current = inFlight.get(account);
  if (current) return current.then(() => syncLogs(account, onChange));
  const task = performSync(account, onChange).finally(() => { if (inFlight.get(account) === task) inFlight.delete(account); });
  inFlight.set(account, task);
  return task;
}

async function performSync(account: string, onChange: (state: Awaited<ReturnType<typeof loadLocal>>) => void) {
  for (const mutation of await pendingMutations(account)) {
    try {
      const { data: snapshot } = await authedRequest<{ data: EventSnapshot }>(`/v1/babies/${encodeURIComponent(mutation.baby_id)}/events/${encodeURIComponent(mutation.event_id)}`, { method: 'PUT', body: JSON.parse(mutation.body) });
      await acknowledge(account, mutation.mutation_id, snapshot);
      onChange(await loadLocal(account));
    } catch (error) {
      if (error instanceof ApiError && [401, 403, 422].includes(error.status)) return false;
      return false;
    }
  }
  let babies: string[];
  try {
    const response = await authedRequest<{ data: { id: string }[] }>('/v1/babies');
    babies = [...new Set([...response.data.map((baby) => baby.id), ...await knownBabies(account)])];
  } catch { return false; }
  for (const babyId of babies) {
    let cursor = await getCursor(account, babyId);
    for (;;) {
      try {
        const page = await authedRequest<{ data: EventSnapshot[]; next_cursor: number; has_more: boolean }>(`/v1/babies/${encodeURIComponent(babyId)}/events?after=${cursor}&limit=100`);
        await mergePage(account, babyId, page.data, page.next_cursor);
        onChange(await loadLocal(account));
        if (!page.has_more || page.next_cursor <= cursor) break;
        cursor = page.next_cursor;
      } catch { return false; }
    }
  }
  return true;
}

export function onSyncForeground(callback: () => void) {
  const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') callback(); });
  return () => subscription.remove();
}
