/**
 * Age-based starting points for onboarding: the baby's age, awake windows, sleep need and a first
 * daily rhythm. These are general ranges, not medical advice, and only a starting point: the nap
 * predictions replace them as the family logs.
 *
 * Sources:
 * - Sleep need 4 months–5 years: American Academy of Sleep Medicine, Paruthi et al. (2016).
 * - Sleep need 0–3 months: National Sleep Foundation, Hirshkowitz et al. (2015).
 * - Awake windows and nap counts: common paediatric sleep guidance; they vary a lot between babies.
 */

const DAY_MS = 24 * 3600_000;

/** Whole days old (0 on the birthday). Future dates (due dates) give 0. */
export function ageInDays(birthDate: string, now: Date = new Date()): number {
  const [y, m, d] = birthDate.split('-').map(Number);
  const birth = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - birth) / DAY_MS));
}

/** Age as calendar months plus remaining weeks, e.g. 3 months 4 weeks; under a month, weeks and days. */
export function ageParts(birthDate: string, now: Date = new Date()): { months: number; weeks: number; days: number } {
  const [y, m, d] = birthDate.split('-').map(Number);
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() - (m - 1));
  if (now.getDate() < d) months -= 1;
  months = Math.max(0, months);
  const monthAnniversary = new Date(y, m - 1 + months, d);
  const rest = Math.max(0, Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
    Date.UTC(monthAnniversary.getFullYear(), monthAnniversary.getMonth(), monthAnniversary.getDate())) / DAY_MS));
  return { months, weeks: Math.floor(rest / 7), days: rest % 7 };
}

type Band = { upToDays: number };
function band<T extends Band>(bands: readonly T[], days: number): T {
  return bands.find((b) => days < b.upToDays) ?? bands[bands.length - 1];
}

const WAKE_WINDOWS = [
  { upToDays: 6 * 7, min: 45, max: 60 },
  { upToDays: 12 * 7, min: 60, max: 90 },
  { upToDays: 152, min: 90, max: 120 }, // to 5 months
  { upToDays: 213, min: 120, max: 180 }, // to 7 months
  { upToDays: 304, min: 150, max: 210 }, // to 10 months
  { upToDays: 426, min: 180, max: 240 }, // to 14 months
  { upToDays: 730, min: 240, max: 330 }, // to 2 years
  { upToDays: Infinity, min: 300, max: 360 },
] as const;

/** How long a baby this age is usually happy awake between sleeps, in minutes. */
export function wakeWindow(birthDate: string, now?: Date): { min: number; max: number } {
  const { min, max } = band(WAKE_WINDOWS, ageInDays(birthDate, now));
  return { min, max };
}

const SLEEP_NEED = [
  { upToDays: 122, min: 14, max: 17, source: 'nsf' }, // 0–3 months (NSF has no AASM range under 4 months)
  { upToDays: 365, min: 12, max: 16, source: 'aasmInfant' }, // 4–12 months
  { upToDays: 3 * 365, min: 11, max: 14, source: 'aasmToddler' }, // 1–2 years
  { upToDays: Infinity, min: 10, max: 13, source: 'aasmPreschool' }, // 3–5 years
] as const;

export type SleepSource = (typeof SLEEP_NEED)[number]['source'];

/** Recommended sleep in 24 hours (naps included), in hours, with which guideline it comes from. */
export function sleepNeed(birthDate: string, now?: Date): { min: number; max: number; source: SleepSource } {
  const { min, max, source } = band(SLEEP_NEED, ageInDays(birthDate, now));
  return { min, max, source };
}

const NAPS = [
  { upToDays: 91, naps: 4, daySleepMin: 300 },
  { upToDays: 183, naps: 3, daySleepMin: 210 },
  { upToDays: 426, naps: 2, daySleepMin: 180 },
  { upToDays: 1095, naps: 1, daySleepMin: 120 },
  { upToDays: Infinity, naps: 0, daySleepMin: 0 },
] as const;

export type RhythmItem =
  | { kind: 'wake'; at: number }
  | { kind: 'nap'; index: number; at: number; minutes: number; catnap: boolean }
  | { kind: 'bathFeed'; at: number }
  | { kind: 'bedtime'; at: number };

/**
 * A first daily rhythm from the wake time ("07:30") and age. Times are minutes after midnight.
 * Awake windows grow through the day (shortest in the morning, longest before bed); with three or
 * more naps the last one is a 30-minute catnap.
 */
export function dailyRhythm(wakeTime: string, birthDate: string, now?: Date): RhythmItem[] {
  const [h, m] = wakeTime.split(':').map(Number);
  const wake = h * 60 + m;
  const days = ageInDays(birthDate, now);
  const { min, max } = band(WAKE_WINDOWS, days);
  const { naps, daySleepMin } = band(NAPS, days);

  const windows = naps + 1;
  const windowAt = (i: number) => Math.round((min + ((max - min) * i) / Math.max(1, windows - 1)) / 15) * 15;
  const catnap = naps >= 3;
  const regularNaps = catnap ? naps - 1 : naps;
  const regularLength = Math.round((daySleepMin - (catnap ? 30 : 0)) / Math.max(1, regularNaps) / 15) * 15;

  const items: RhythmItem[] = [{ kind: 'wake', at: wake }];
  let clock = wake;
  for (let i = 0; i < naps; i++) {
    clock += windowAt(i);
    const isCatnap = catnap && i === naps - 1;
    const minutes = isCatnap ? 30 : regularLength;
    items.push({ kind: 'nap', index: i + 1, at: clock, minutes, catnap: isCatnap });
    clock += minutes;
  }
  const bedtime = clock + windowAt(naps);
  items.push({ kind: 'bathFeed', at: bedtime - 30 }, { kind: 'bedtime', at: bedtime });
  return items;
}
