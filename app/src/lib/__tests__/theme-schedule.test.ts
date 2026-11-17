/// <reference types="jest" />
/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { AUTO_DARK_SCHEDULE, isDarkAt, nextAutoSwitch, resolveTheme } from '@/lib/theme-schedule';

/**
 * Runs `body` against the schedule module in a fresh Node process whose clock is in
 * timezone `tz`, like a phone set to that timezone. (Jest copies process.env per test
 * file, so changing TZ inside a test would not reach the clock.)
 * `body` is the source of a function `(s) => result`, where `s` is the module.
 */
const MODULE = join(__dirname, '..', 'theme-schedule.ts');
function inTimeZone<T>(tz: string, body: string): T {
  const script = `import * as s from ${JSON.stringify(MODULE)}; console.log(JSON.stringify((${body})(s)));`;
  const out = execFileSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--input-type=module', '-e', script],
    { env: { ...process.env, TZ: tz }, encoding: 'utf8' },
  );
  return JSON.parse(out) as T;
}

/** A local wall-clock time on 17 Nov 2026 (an ordinary day, no DST change). */
const at = (hour: number, minute: number) => new Date(2026, 10, 17, hour, minute);

describe('schedule constant', () => {
  it('is dark from 7:00 PM to 6:00 AM', () => {
    expect(AUTO_DARK_SCHEDULE).toEqual({ darkFrom: { hour: 19, minute: 0 }, lightFrom: { hour: 6, minute: 0 } });
  });
});

describe('isDarkAt (device local time)', () => {
  it.each([
    ['5:59 AM', 5, 59, true],
    ['6:00 AM (morning switch)', 6, 0, false],
    ['6:59 AM', 6, 59, false],
    ['7:00 AM', 7, 0, false],
    ['noon', 12, 0, false],
    ['6:59 PM', 18, 59, false],
    ['7:00 PM (evening switch)', 19, 0, true],
    ['11:59 PM', 23, 59, true],
    ['midnight', 0, 0, true],
  ])('%s -> dark is %s', (_label, hour, minute, dark) => {
    expect(isDarkAt(at(hour, minute))).toBe(dark);
  });
});

describe('resolveTheme', () => {
  it('a manual choice beats the schedule', () => {
    expect(resolveTheme('light', at(23, 0))).toBe('light');
    expect(resolveTheme('dark', at(12, 0))).toBe('dark');
  });

  it('Auto follows the clock', () => {
    expect(resolveTheme('auto', at(23, 0))).toBe('dark');
    expect(resolveTheme('auto', at(12, 0))).toBe('light');
  });
});

describe('timezone change', () => {
  it('uses the local time of the current timezone, not UTC', () => {
    // One instant, 2026-11-17 17:30 UTC, seen from four timezones.
    const check = `(s) => s.resolveTheme('auto', new Date(Date.UTC(2026, 10, 17, 17, 30)))`;
    expect(inTimeZone('Europe/London', check)).toBe('light'); // 17:30
    expect(inTimeZone('Africa/Lagos', check)).toBe('light'); // 18:30
    expect(inTimeZone('Asia/Dubai', check)).toBe('dark'); // 21:30: flying east flips it to dark
    expect(inTimeZone('Asia/Tokyo', check)).toBe('dark'); // 02:30 next day
  });
});

describe('nextAutoSwitch', () => {
  it('afternoon -> 7:00 PM the same day', () => {
    expect(nextAutoSwitch(at(15, 0))).toEqual(at(19, 0));
  });

  it('evening -> 6:00 AM the next morning', () => {
    expect(nextAutoSwitch(at(21, 0))).toEqual(new Date(2026, 10, 18, 6, 0));
  });

  it('exactly on a boundary -> the following one', () => {
    expect(nextAutoSwitch(at(19, 0))).toEqual(new Date(2026, 10, 18, 6, 0));
  });

  it('midnight -> 6:00 AM the same day', () => {
    expect(nextAutoSwitch(at(0, 0))).toEqual(at(6, 0));
  });
});

describe('daylight saving change (America/New_York)', () => {
  const HOUR = 3_600_000;
  type Result = { wall: number[]; realHours: number; beforeSwitch: boolean; atSwitch: boolean; repeated?: boolean };

  it('spring forward: the night into 8 Mar 2026 is an hour shorter, switch still at 6:00 AM', () => {
    const r = inTimeZone<Result>(
      'America/New_York',
      `(s) => {
        const evening = new Date(2026, 2, 7, 21, 0);
        const next = s.nextAutoSwitch(evening);
        return {
          wall: [next.getDate(), next.getHours(), next.getMinutes()],
          realHours: (next.getTime() - evening.getTime()) / ${HOUR},
          beforeSwitch: s.isDarkAt(new Date(2026, 2, 8, 5, 59)),
          atSwitch: s.isDarkAt(new Date(2026, 2, 8, 6, 0)),
        };
      }`,
    );
    expect(r.wall).toEqual([8, 6, 0]);
    expect(r.realHours).toBe(8); // 9 hours on the wall clock, 8 real hours
    expect(r.beforeSwitch).toBe(true);
    expect(r.atSwitch).toBe(false);
  });

  it('fall back: the night into 1 Nov 2026 is an hour longer, switch still at 6:00 AM', () => {
    const r = inTimeZone<Result>(
      'America/New_York',
      `(s) => {
        const evening = new Date(2026, 9, 31, 21, 0);
        const next = s.nextAutoSwitch(evening);
        return {
          wall: [next.getDate(), next.getHours(), next.getMinutes()],
          realHours: (next.getTime() - evening.getTime()) / ${HOUR},
          beforeSwitch: s.isDarkAt(new Date(2026, 10, 1, 5, 59)),
          atSwitch: s.isDarkAt(new Date(2026, 10, 1, 6, 0)),
          repeated: s.isDarkAt(new Date(2026, 10, 1, 1, 30)),
        };
      }`,
    );
    expect(r.wall).toEqual([1, 6, 0]);
    expect(r.realHours).toBe(10); // 9 hours on the wall clock, 10 real hours
    expect(r.beforeSwitch).toBe(true);
    expect(r.atSwitch).toBe(false);
    expect(r.repeated).toBe(true); // the repeated 1:30 AM is still night
  });
});
