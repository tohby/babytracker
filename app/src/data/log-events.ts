/**
 * Logged events. Raw values only (ISO timestamps, ms, ml, grams, mm, enums); the UI formats them at render
 * time. There is no events API yet (M2), so every event lives on this phone and carries `pendingSync: true`
 * until a server confirms it. Screens say so honestly ("saved on this phone").
 */

import type { LogType } from '@/constants/log-types';

export type Side = 'left' | 'right';
export type MilkKind = 'formula' | 'breast' | 'mixed';
export type NappyKind = 'wet' | 'dirty' | 'both';
export type PumpSide = Side | 'both';
export type SolidsAmount = 'taste' | 'some' | 'lots';
export type SolidsReaction = 'loved' | 'unsure' | 'disliked';
export type ActivityKind = 'bath' | 'tummy' | 'play' | 'outdoors' | 'reading';

export type LogEvent = {
  id: string;
  babyId: string;
  type: LogType;
  /** When it happened (sleep/nursing/pumping/activity: when it started). */
  startAt: string;
  /** Sleep, nursing, pumping and activities: when it ended. */
  endAt?: string;
  note?: string;
  bottle?: { amountMl: number; milk: MilkKind };
  nursing?: { leftMs: number; rightMs: number; lastSide: Side };
  pumping?: { side: PumpSide; amountMl: number };
  nappy?: { kind: NappyKind };
  solids?: { foods: string[]; amount: SolidsAmount; reaction: SolidsReaction };
  medicine?: { name: string; dose?: string };
  growth?: { weightG?: number; lengthMm?: number; headMm?: number };
  activity?: { kind: ActivityKind };
  /** Display name of whoever logged it. */
  loggedBy: string;
  pendingSync: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A live session (sleep, nursing or pumping). Only one runs at a time. */
export type RunningTimer = {
  kind: 'sleep' | 'nursing' | 'pumping';
  babyId: string;
  startedAt: string;
  /** Set while paused. */
  pausedAt?: string;
  /** Total time spent paused before `pausedAt`. */
  pausedMs: number;
  /** Nursing: the side running now and time banked per side. */
  side?: Side;
  sideStartedAt?: string;
  sideMs?: Record<Side, number>;
};

export function timerElapsedMs(timer: RunningTimer, now: number): number {
  const end = timer.pausedAt ? Date.parse(timer.pausedAt) : now;
  return Math.max(0, end - Date.parse(timer.startedAt) - timer.pausedMs);
}

/** Nursing time per side, including the side that is running now. */
export function timerSideMs(timer: RunningTimer, now: number): Record<Side, number> {
  const banked = timer.sideMs ?? { left: 0, right: 0 };
  if (!timer.side || !timer.sideStartedAt || timer.pausedAt) return banked;
  return { ...banked, [timer.side]: banked[timer.side] + Math.max(0, now - Date.parse(timer.sideStartedAt)) };
}

export function durationMs(event: LogEvent): number | null {
  return event.endAt ? Math.max(0, Date.parse(event.endAt) - Date.parse(event.startAt)) : null;
}
