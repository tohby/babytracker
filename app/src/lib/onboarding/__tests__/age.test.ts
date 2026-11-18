import { ageInDays, ageParts, dailyRhythm, sleepNeed, wakeWindow } from '@/lib/onboarding/age';

const now = new Date(2026, 10, 17, 12, 0); // 17 Nov 2026, local

describe('age', () => {
  it('counts whole days and never goes negative for due dates', () => {
    expect(ageInDays('2026-11-17', now)).toBe(0);
    expect(ageInDays('2026-11-10', now)).toBe(7);
    expect(ageInDays('2026-12-01', now)).toBe(0);
  });

  it('splits age into months, weeks and days like the Figma birthday screen', () => {
    expect(ageParts('2026-07-16', now)).toEqual({ months: 4, weeks: 0, days: 1 });
    expect(ageParts('2026-07-20', now)).toEqual({ months: 3, weeks: 4, days: 0 });
    expect(ageParts('2026-11-01', now)).toEqual({ months: 0, weeks: 2, days: 2 });
  });
});

describe('guidance by age', () => {
  it('gives the Figma example: about 1.5–2 hours awake at 3 months 4 weeks', () => {
    expect(wakeWindow('2026-07-20', now)).toEqual({ min: 90, max: 120 });
  });

  it('uses the AASM infant range from 4 months and NSF before that', () => {
    expect(sleepNeed('2026-07-01', now)).toEqual({ min: 12, max: 16, source: 'aasmInfant' });
    expect(sleepNeed('2026-10-01', now)).toEqual({ min: 14, max: 17, source: 'nsf' });
    expect(sleepNeed('2025-06-01', now)).toEqual({ min: 11, max: 14, source: 'aasmToddler' });
  });
});

describe('dailyRhythm', () => {
  it('builds wake, naps, bath and bedtime in order for a 4-month-old waking at 7:30', () => {
    const items = dailyRhythm('07:30', '2026-07-20', now);
    expect(items.map((i) => i.kind)).toEqual(['wake', 'nap', 'nap', 'nap', 'bathFeed', 'bedtime']);
    const times = items.map((i) => i.at);
    expect([...times].sort((a, b) => a - b)).toEqual(times.slice(0, -2).concat([times[4], times[5]]));
    const last = items[3];
    expect(last.kind === 'nap' && last.catnap && last.minutes === 30).toBe(true);
    const bedtime = items[5].at;
    expect(bedtime).toBeGreaterThan(17 * 60);
    expect(bedtime).toBeLessThan(21 * 60);
  });

  it('gives an older toddler one nap', () => {
    const items = dailyRhythm('07:00', '2025-05-01', now);
    expect(items.filter((i) => i.kind === 'nap')).toHaveLength(1);
  });
});
