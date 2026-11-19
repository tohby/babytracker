/** Pure summaries over logged events (no formatting). */

import type { LogEvent } from '@/data/log-events';
import type { LogType } from '@/constants/log-types';

const DAY = 86_400_000;

export function startOfDay(t: number | Date): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Newest event of a type (events newest first). */
export function lastOf(events: LogEvent[], type: LogType | LogType[]): LogEvent | undefined {
  const types = Array.isArray(type) ? type : [type];
  return events.find((e) => types.includes(e.type));
}

/** Events that touch the local day starting at `dayStart` (sleep spanning midnight counts on both days). */
export function eventsOnDay(events: LogEvent[], dayStart: number): LogEvent[] {
  const end = dayStart + DAY;
  return events.filter((e) => {
    const s = Date.parse(e.startAt);
    const f = e.endAt ? Date.parse(e.endAt) : s;
    return s < end && f >= dayStart;
  });
}

function sleepMsOnDay(events: LogEvent[], dayStart: number, now: number): number {
  const end = Math.min(dayStart + DAY, now);
  return events
    .filter((e) => e.type === 'sleep' && e.endAt)
    .reduce((sum, e) => sum + Math.max(0, Math.min(Date.parse(e.endAt!), end) - Math.max(Date.parse(e.startAt), dayStart)), 0);
}

export type DayTotals = { sleepMs: number; feeds: number; nappies: number; naps: number };

export function dayTotals(events: LogEvent[], dayStart: number, now: number = Date.now()): DayTotals {
  const day = eventsOnDay(events, dayStart);
  const inDay = (e: LogEvent) => Date.parse(e.startAt) >= dayStart;
  return {
    sleepMs: sleepMsOnDay(events, dayStart, now),
    feeds: day.filter((e) => inDay(e) && (e.type === 'feed' || e.type === 'nursing')).length,
    nappies: day.filter((e) => inDay(e) && e.type === 'nappy').length,
    naps: day.filter((e) => inDay(e) && e.type === 'sleep' && new Date(e.startAt).getHours() >= 6 && new Date(e.startAt).getHours() < 19).length,
  };
}

/** Average totals for the 7 full days before `dayStart`, or null with fewer than 2 days of logs. */
export function sevenDayAverage(events: LogEvent[], dayStart: number): DayTotals | null {
  const days = Array.from({ length: 7 }, (_, i) => dayStart - (i + 1) * DAY).filter((d) => eventsOnDay(events, d).length > 0);
  if (days.length < 2) return null;
  const totals = days.map((d) => dayTotals(events, d, d + DAY));
  const avg = (k: keyof DayTotals) => totals.reduce((s, x) => s + x[k], 0) / totals.length;
  return { sleepMs: avg('sleepMs'), feeds: avg('feeds'), nappies: avg('nappies'), naps: avg('naps') };
}

/** Typical gap between feeds (median of the last 3 days) and when the next one is due. */
export function feedDue(events: LogEvent[], now: number = Date.now()): { lastAt: number; intervalMs: number; dueAt: number } | null {
  const feeds = events.filter((e) => e.type === 'feed' || e.type === 'nursing').map((e) => Date.parse(e.startAt)).sort((a, b) => a - b);
  const recent = feeds.filter((t) => t > now - 3 * DAY);
  const gaps = recent.slice(1).map((t, i) => t - recent[i]).filter((g) => g > 30 * 60_000 && g < 8 * 3_600_000);
  if (gaps.length < 2 || feeds.length === 0) return null;
  const sorted = [...gaps].sort((a, b) => a - b);
  const intervalMs = sorted[Math.floor(sorted.length / 2)];
  const lastAt = feeds[feeds.length - 1];
  return { lastAt, intervalMs, dueAt: lastAt + intervalMs };
}

/** Nap number within its day (1-based), counting daytime sleeps only. */
export function napNumber(events: LogEvent[], event: LogEvent): number {
  const day = startOfDay(Date.parse(event.startAt));
  const naps = events
    .filter((e) => e.type === 'sleep' && Date.parse(e.startAt) >= day && Date.parse(e.startAt) <= Date.parse(event.startAt))
    .filter((e) => new Date(e.startAt).getHours() >= 6 && new Date(e.startAt).getHours() < 19);
  return Math.max(1, naps.length);
}

/** The parent's last four bottle amounts (newest first, distinct), padded with common amounts. */
export function recentAmounts(amounts: number[]): number[] {
  const out: number[] = [];
  for (const a of amounts) if (!out.includes(a)) out.push(a);
  for (const a of [60, 90, 120, 150]) if (out.length < 4 && !out.includes(a)) out.push(a);
  return out.slice(0, 4).sort((a, b) => a - b);
}

/** ISO time for a picked moment, or now when nothing was picked (`null` = "Now" in a Time row). */
export function isoAt(value: number | null): string {
  return new Date(value ?? Date.now()).toISOString();
}
