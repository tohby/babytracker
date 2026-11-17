/**
 * Shape of the data the Home screen needs, plus sample values.
 * Holds raw values only (ISO timestamps, ms, ml, enums); the UI formats them
 * at render time through `lib/format.ts` and `t()`. When the API exists,
 * fetch a `HomeData` and pass it to the screen.
 */

import type { ImageSource } from 'expo-image';

export type FeedKind = 'bottle' | 'breastLeft' | 'breastRight' | 'solids';
export type NappyKind = 'wet' | 'dirty' | 'mixed';

export type HomeData = {
  babyName: string;
  /** The signed-in caregiver. `photo` is an image source (remote `{ uri }` once the API exists). */
  user: { name: string; photo?: ImageSource | number };
  hasUnreadNotifications: boolean;
  nextNap: {
    /** Predicted start of the nap window (ISO). */
    windowStart: string;
    /** Latest good time to start the nap (ISO). */
    windowEnd: string;
  };
  feedDue: {
    at: string;
    /** Typical gap between feeds, e.g. 3 hours. */
    usualIntervalMs: number;
    /** What the next feed is expected to be. */
    kind: FeedKind;
    amountMl?: number;
  };
  /** Name of the other caregiver whose logs are synced. */
  syncedWith: string;
  lastFeed: { at: string; kind: FeedKind; amountMl?: number };
  /** When the baby last woke up (ISO). */
  awakeSince: string;
  lastNappy: { at: string; kind: NappyKind };
  sleepToday: { totalMs: number; napCount: number };
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Sample data relative to now, so the screen always looks plausible. */
export function getSampleHomeData(now: number = Date.now()): HomeData {
  const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();
  return {
    babyName: 'Ada',
    // Sample photo from the Figma `Avatar/Photo · Kemi` component; replace with the API's profile photo.
    user: { name: 'Kemi', photo: require('@/assets/images/sample/kemi.png') },
    hasUnreadNotifications: true,
    nextNap: {
      windowStart: at(35 * MINUTE),
      windowEnd: at(65 * MINUTE),
    },
    feedDue: { at: at(HOUR + 30 * MINUTE), usualIntervalMs: 3 * HOUR, kind: 'bottle', amountMl: 120 },
    syncedWith: 'Kemi',
    lastFeed: { at: at(-(2 * HOUR + 10 * MINUTE)), kind: 'bottle', amountMl: 120 },
    awakeSince: at(-(HOUR + 35 * MINUTE)),
    lastNappy: { at: at(-45 * MINUTE), kind: 'wet' },
    sleepToday: { totalMs: 4 * HOUR + 20 * MINUTE, napCount: 2 },
  };
}
