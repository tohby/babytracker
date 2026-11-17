/**
 * Light / Dark / Auto theme modes and the Auto schedule.
 *
 * Pure functions on `Date`, using the device's local time (`getHours()`, not UTC),
 * so timezone and daylight-saving changes are handled by the OS clock.
 * No React, no storage: unit-tested in `__tests__/theme-schedule.test.ts`.
 */

/** When Auto switches. Local wall-clock times; change these two to move the schedule. */
export const AUTO_DARK_SCHEDULE = {
  /** Dark from this time... */
  darkFrom: { hour: 19, minute: 0 },
  /** ...until this time the next morning. */
  lightFrom: { hour: 6, minute: 0 },
} as const;

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AppliedTheme = 'light' | 'dark';

/** New users start on Auto. */
export const DEFAULT_THEME_MODE: ThemeMode = 'auto';

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'auto'];

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}

type ClockTime = { hour: number; minute: number };
type Schedule = { darkFrom: ClockTime; lightFrom: ClockTime };

const minutesOfDay = ({ hour, minute }: ClockTime) => hour * 60 + minute;

/** True when Auto should be dark at `date` (device local time). */
export function isDarkAt(date: Date, schedule: Schedule = AUTO_DARK_SCHEDULE): boolean {
  const now = date.getHours() * 60 + date.getMinutes();
  const darkFrom = minutesOfDay(schedule.darkFrom);
  const lightFrom = minutesOfDay(schedule.lightFrom);
  // Overnight window (19:00 -> 06:00) wraps past midnight; a same-day window doesn't.
  return darkFrom > lightFrom ? now >= darkFrom || now < lightFrom : now >= darkFrom && now < lightFrom;
}

/** The theme to show. A manual Light or Dark always wins; only Auto reads the clock. */
export function resolveTheme(mode: ThemeMode, date: Date, schedule: Schedule = AUTO_DARK_SCHEDULE): AppliedTheme {
  if (mode !== 'auto') return mode;
  return isDarkAt(date, schedule) ? 'dark' : 'light';
}

/**
 * The next moment Auto flips, as a real instant. Built from local calendar fields
 * (`new Date(y, m, d, h, min)`), so a daylight-saving night is 1 hour shorter or longer
 * and the result is still exactly 06:00 / 19:00 on the wall clock.
 */
export function nextAutoSwitch(date: Date, schedule: Schedule = AUTO_DARK_SCHEDULE): Date {
  const candidates: Date[] = [];
  for (const dayOffset of [0, 1]) {
    for (const time of [schedule.darkFrom, schedule.lightFrom]) {
      candidates.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset, time.hour, time.minute));
    }
  }
  return candidates.filter((c) => c.getTime() > date.getTime()).sort((a, b) => a.getTime() - b.getTime())[0];
}
