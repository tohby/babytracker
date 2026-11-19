import type { LogEvent } from '@/data/log-events';
import type { LogType } from '@/constants/log-types';

const payloadKeys = ['bottle', 'nursing', 'pumping', 'nappy', 'solids', 'medicine', 'growth', 'activity'] as const;

export type EventSnapshot = {
  id: string; baby_id: string; type: LogType; occurred_at: string; ended_at: string | null;
  payload: Record<string, unknown>; note: string | null; deleted_at: string | null;
  change_number: number; logged_by: number | string; logged_by_name?: string | null; created_at: string; updated_at: string;
};

export function eventToMutation(event: LogEvent, mutationId: string) {
  const payload: Record<string, unknown> = {};
  for (const key of payloadKeys) if (event[key] !== undefined) payload[key] = event[key];
  return { mutation_id: mutationId, type: event.type, occurred_at: event.startAt, ended_at: event.endAt ?? null, payload, note: event.note ?? null, deleted: Boolean(event.deletedAt) };
}

export function snapshotToEvent(snapshot: EventSnapshot): LogEvent {
  return {
    id: snapshot.id, babyId: snapshot.baby_id, type: snapshot.type, startAt: snapshot.occurred_at,
    endAt: snapshot.ended_at ?? undefined, ...snapshot.payload, note: snapshot.note ?? undefined,
    deletedAt: snapshot.deleted_at ?? undefined, changeNumber: snapshot.change_number,
    loggedBy: snapshot.logged_by_name ?? '', pendingSync: false, createdAt: snapshot.created_at, updatedAt: snapshot.updated_at,
  } as LogEvent;
}

export function shouldApplySnapshot(local: LogEvent | undefined, incomingChange: number, pending: boolean): boolean {
  return !pending && (!local?.changeNumber || incomingChange >= local.changeNumber);
}
