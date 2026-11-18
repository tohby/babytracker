/**
 * Shape of the data the Home screen needs. Raw values only (ISO timestamps, ms, ml, enums); the UI
 * formats them at render time through `lib/format.ts` and `t()`.
 *
 * Until logging exists (M2), everything that comes from logs is null and the screen shows the
 * Figma "first launch" state (M1-20): the next nap comes from the baby's age and usual wake time.
 */

import type { ImageSource } from 'expo-image';

import { dailyRhythm } from '@/lib/onboarding/age';

export type FeedKind = 'bottle' | 'breastLeft' | 'breastRight' | 'solids';
export type NappyKind = 'wet' | 'dirty' | 'mixed';

export type HomeData = {
  babyName: string;
  /** The signed-in caregiver; `photo` is the profile photo, otherwise the avatar shows an initial. */
  user: { name: string; photo?: ImageSource };
  hasUnreadNotifications: boolean;
  nextNap: {
    /** Predicted start of the nap window (ISO). */
    windowStart: string;
    /** Latest good time to start the nap (ISO). */
    windowEnd: string;
    /** `age`: from the starter rhythm (no logs yet). `logs`: from the family's own logs. */
    basis: 'age' | 'logs';
  } | null;
  feedDue: {
    at: string;
    /** Typical gap between feeds, e.g. 3 hours. */
    usualIntervalMs: number;
    /** What the next feed is expected to be. */
    kind: FeedKind;
    amountMl?: number;
  } | null;
  /** Name of another caregiver whose logs are synced; null when it's just this user. */
  syncedWith: string | null;
  lastFeed: { at: string; kind: FeedKind; amountMl?: number } | null;
  /** When the baby last woke up (ISO). */
  awakeSince: string | null;
  lastNappy: { at: string; kind: NappyKind } | null;
  sleepToday: { totalMs: number; napCount: number } | null;
};

/** How long a nap window stays open after it starts. */
const WINDOW_MS = 30 * 60_000;

/**
 * The next nap from the starter rhythm (age + usual wake time). After today's last nap, tomorrow's
 * first. Null without a birthday.
 */
export function nextNapFromRhythm(
  birthDate: string | null,
  usualWakeTime: string | null,
  now: Date = new Date(),
): HomeData['nextNap'] {
  if (!birthDate) return null;
  const naps = dailyRhythm(usualWakeTime ?? '07:00', birthDate, now).filter((item) => item.kind === 'nap');
  if (naps.length === 0) return null;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  // Still counts as "next" while its window is open.
  const today = naps.find((nap) => nap.at + WINDOW_MS / 60_000 > minutesNow);
  const at = new Date(now);
  at.setSeconds(0, 0);
  if (today) {
    at.setHours(0, today.at, 0, 0);
  } else {
    at.setDate(at.getDate() + 1);
    at.setHours(0, naps[0].at, 0, 0);
  }
  return {
    windowStart: at.toISOString(),
    windowEnd: new Date(at.getTime() + WINDOW_MS).toISOString(),
    basis: 'age',
  };
}
