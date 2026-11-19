/**
 * Next-nap prediction. Honest by design:
 * - under 8 weeks: no prediction (newborns nap on cues, not clocks);
 * - fewer than NAPS_NEEDED naps logged: "learning", with progress;
 * - otherwise: the last wake time plus this baby's typical wake window (median of recent ones), falling back to
 *   the age-based window when the logs don't give enough gaps yet.
 */

import type { LogEvent } from '@/data/log-events';
import { ageInDays, wakeWindow } from '@/lib/onboarding/age';

export const NAPS_NEEDED = 5;
const WINDOW_MS = 30 * 60_000;
const TOO_YOUNG_DAYS = 56;

export type Prediction =
  | { state: 'too-young' }
  | { state: 'learning'; napsLogged: number; napsNeeded: number }
  | {
      state: 'predicted';
      windowStart: number;
      windowEnd: number;
      /** Inputs shown on "Why this time". */
      awakeSince: number;
      wakeWindowMs: number;
      lastNapMs: number | null;
      basis: 'logs' | 'age';
      typicalWakeWindowMs: { min: number; max: number };
    };

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function predictNextNap(events: LogEvent[], birthDate: string | null, now: number = Date.now()): Prediction {
  if (birthDate && ageInDays(birthDate, new Date(now)) < TOO_YOUNG_DAYS) return { state: 'too-young' };
  const sleeps = events
    .filter((e) => e.type === 'sleep' && e.endAt)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  if (sleeps.length < NAPS_NEEDED) return { state: 'learning', napsLogged: sleeps.length, napsNeeded: NAPS_NEEDED };

  const ageWindow = birthDate ? wakeWindow(birthDate, new Date(now)) : { min: 90, max: 150 };
  const typical = { min: ageWindow.min * 60_000, max: ageWindow.max * 60_000 };
  // Gaps between the end of one sleep and the start of the next, in the last 7 days, ignoring overnight gaps.
  const weekAgo = now - 7 * 86_400_000;
  const gaps: number[] = [];
  for (let i = 1; i < sleeps.length; i++) {
    const end = Date.parse(sleeps[i - 1].endAt!);
    const start = Date.parse(sleeps[i].startAt);
    if (end > weekAgo && start > end && start - end < 6 * 3_600_000) gaps.push(start - end);
  }
  const basis = gaps.length >= 3 ? 'logs' : 'age';
  const wakeWindowMs = basis === 'logs' ? median(gaps) : (typical.min + typical.max) / 2;
  const last = sleeps[sleeps.length - 1];
  const awakeSince = Date.parse(last.endAt!);
  const windowStart = awakeSince + wakeWindowMs;
  return {
    state: 'predicted',
    windowStart,
    windowEnd: windowStart + WINDOW_MS,
    awakeSince,
    wakeWindowMs,
    lastNapMs: Date.parse(last.endAt!) - Date.parse(last.startAt),
    basis,
    typicalWakeWindowMs: typical,
  };
}
