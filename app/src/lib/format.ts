/**
 * Every date, time, duration, number, volume and weight shown in the app goes
 * through here. Data stays raw (ISO timestamps, ms, ml, g); formatting happens
 * at render time with `Intl`, using the device locale and the user's settings.
 *
 * Units ("h", "min", "ml") come from the `common:units` strings, not from
 * `Intl.NumberFormat`'s `style: 'unit'`: on iOS, Hermes formats units with the
 * system measurement formatter, which converts them to its "preferred" unit
 * (2 hours became "7,200 sec", 120 ml became "0.032 gal"). Digits still go
 * through `Intl` so each locale gets its own digits and separators.
 *
 * Do not call `toFixed`, `toLocaleString` or hand-build these strings in components.
 */
import i18n, { getDeviceLocale } from '@/i18n';

export type VolumeUnit = 'ml' | 'oz';
export type WeightUnit = 'kg' | 'lb';

/**
 * User display preferences. Defaults come from the device region; the Settings
 * screen (M1) will let parents override them. Kept separate from language:
 * a French parent may want oz, a UK English parent may want a 24h clock.
 */
export type FormatPrefs = {
  volumeUnit: VolumeUnit;
  weightUnit: WeightUnit;
  /** `null` follows the device. */
  hour12: boolean | null;
};

const ML_PER_FL_OZ = 29.5735;
const G_PER_LB = 453.592;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

let prefsOverride: Partial<FormatPrefs> = {};

/** Settings will call this once the user's preferences are loaded. */
export function setFormatPrefs(prefs: Partial<FormatPrefs>) {
  prefsOverride = prefs;
}

export function getFormatPrefs(): FormatPrefs {
  const { measurementSystem, uses24hourClock } = getDeviceLocale();
  return {
    volumeUnit: measurementSystem === 'us' ? 'oz' : 'ml',
    weightUnit: measurementSystem === 'us' ? 'lb' : 'kg',
    hour12: uses24hourClock === null ? null : !uses24hourClock,
    ...prefsOverride,
  };
}

const locale = () => getDeviceLocale().formatLocale;

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/** "1:40 pm" / "13:40", following the clock preference. */
export function formatTime(value: Date | string | number): string {
  const { hour12 } = getFormatPrefs();
  return new Intl.DateTimeFormat(locale(), {
    hour: 'numeric',
    minute: '2-digit',
    ...(hour12 === null ? {} : { hour12 }),
  }).format(toDate(value));
}

/** "7 PM" / "19", or "7:30 PM" when the minutes aren't zero. For short labels like "7 PM – 6 AM". */
export function formatTimeCompact(value: Date | string | number): string {
  const date = toDate(value);
  const { hour12 } = getFormatPrefs();
  return new Intl.DateTimeFormat(locale(), {
    hour: 'numeric',
    ...(date.getMinutes() === 0 ? {} : { minute: '2-digit' }),
    ...(hour12 === null ? {} : { hour12 }),
  }).format(date);
}

/** "Sat 15 Nov" style short date, ordered per locale. */
export function formatDate(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale(), options ?? { weekday: 'short', day: 'numeric', month: 'short' }).format(
    toDate(value),
  );
}

type DurationStyle = 'narrow' | 'short' | 'long';

/**
 * A length of time in hours and minutes: "2h 10m" (narrow), "2 hr 10 min" (short),
 * "2 hours 10 minutes" (long). Rounds to the nearest minute; under a minute shows "0m".
 */
export function formatDuration(ms: number, style: DurationStyle = 'narrow'): string {
  const totalMinutes = Math.max(0, Math.round(ms / MINUTE));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const showHours = hours > 0;
  const showMinutes = minutes > 0 || hours === 0;

  if (style === 'long') {
    const h = i18n.t('units.duration.long.hours', {
      count: hours,
      value: formatNumber(hours),
    });
    const m = i18n.t('units.duration.long.minutes', {
      count: minutes,
      value: formatNumber(minutes),
    });
    if (showHours && showMinutes)
      return i18n.t('units.duration.long.hoursMinutes', {
        hours: h,
        minutes: m,
      });
    return showHours ? h : m;
  }

  const values = { hours: formatNumber(hours), minutes: formatNumber(minutes) };
  if (style === 'short') {
    if (showHours && showMinutes) return i18n.t('units.duration.short.hoursMinutes', values);
    return showHours ? i18n.t('units.duration.short.hours', values) : i18n.t('units.duration.short.minutes', values);
  }
  if (showHours && showMinutes) return i18n.t('units.duration.narrow.hoursMinutes', values);
  return showHours ? i18n.t('units.duration.narrow.hours', values) : i18n.t('units.duration.narrow.minutes', values);
}

/** A countdown in minutes and seconds, e.g. "0:45" (sign-in pause, resend timers). */
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  return i18n.t('units.countdown', {
    minutes: formatNumber(Math.floor(seconds / 60)),
    seconds: formatNumber(seconds % 60, { minimumIntegerDigits: 2 }),
  });
}

/** Milliseconds between two moments (b defaults to now). Never negative. */
export function elapsedMs(from: Date | string | number, to: Date | string | number = Date.now()): number {
  return Math.max(0, toDate(to).getTime() - toDate(from).getTime());
}

/** "in 35 minutes" / "2 hours ago". Picks minutes under an hour, hours under a day, else days. */
export function formatRelative(value: Date | string | number, now: Date | number = Date.now()): string {
  const diff = toDate(value).getTime() - toDate(now).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
  if (abs < 24 * HOUR) return rtf.format(Math.round(diff / HOUR), 'hour');
  return rtf.format(Math.round(diff / (24 * HOUR)), 'day');
}

/** A plain number with locale digits and separators. */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale(), options).format(value);
}

/** Feed volume from raw ml: "120 ml" or "4.1 fl oz", per the volume preference. */
export function formatVolume(ml: number, unit: VolumeUnit = getFormatPrefs().volumeUnit): string {
  if (unit === 'oz') {
    return i18n.t('units.volume.flOz', {
      value: formatNumber(ml / ML_PER_FL_OZ, { maximumFractionDigits: 1 }),
    });
  }
  return i18n.t('units.volume.ml', {
    value: formatNumber(ml, { maximumFractionDigits: 0 }),
  });
}

/** Weight from raw grams: "4.2 kg" or "9.3 lb", per the weight preference. */
export function formatWeight(grams: number, unit: WeightUnit = getFormatPrefs().weightUnit): string {
  if (unit === 'lb') {
    return i18n.t('units.weight.lb', {
      value: formatNumber(grams / G_PER_LB, { maximumFractionDigits: 2 }),
    });
  }
  return i18n.t('units.weight.kg', {
    value: formatNumber(grams / 1000, { maximumFractionDigits: 2 }),
  });
}

/**
 * Dev-only: confirms the Intl APIs we rely on exist in this JS engine (Hermes).
 * Logs once at startup; run on a real iOS and Android device before relying on it.
 */
export function logIntlSupport() {
  if (!__DEV__) return;
  const support = {
    PluralRules: typeof Intl.PluralRules === 'function',
    DateTimeFormat: typeof Intl.DateTimeFormat === 'function',
    NumberFormat: typeof Intl.NumberFormat === 'function',
    RelativeTimeFormat: typeof Intl.RelativeTimeFormat === 'function',
    ListFormat: typeof Intl.ListFormat === 'function',
  };
  let samples: Record<string, string> = {};
  try {
    samples = {
      time: formatTime(new Date()),
      duration: formatDuration(2 * HOUR + 10 * MINUTE),
      relative: formatRelative(Date.now() + 35 * MINUTE),
      volume: formatVolume(120),
      plural: new Intl.PluralRules(locale()).select(2),
    };
  } catch (error) {
    samples = { error: String(error) };
  }
  console.log('[i18n] locale', getDeviceLocale(), 'Intl support', support, 'samples', samples);
}
