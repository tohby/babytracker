import './intl-polyfills';

import { getCalendars, getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { initReactI18next } from 'react-i18next';

import {
  defaultNS,
  fallbackLanguage,
  resources,
  supportedLanguages,
  type SupportedLanguage,
} from './resources';

/** The device's preferred locale details, refreshed when the app returns to the foreground. */
type DeviceLocale = {
  /** The UI language we will show (always one we have resources for). */
  language: SupportedLanguage;
  /** BCP 47 tag for `Intl` formatting, e.g. `en-GB`. Keeps the device region even when we fall back to English. */
  formatLocale: string;
  uses24hourClock: boolean | null;
  measurementSystem: 'metric' | 'us' | 'uk' | null;
  timeZone: string | null;
};

function isSupported(code: string | null | undefined): code is SupportedLanguage {
  return !!code && (supportedLanguages as string[]).includes(code);
}

function readDeviceLocale(): DeviceLocale {
  const locales = getLocales();
  const [calendar] = getCalendars();
  // First of the user's preferred languages that we support; otherwise English.
  const match = locales.find((l) => isSupported(l.languageCode));
  const primary = locales[0];
  const language = match?.languageCode && isSupported(match.languageCode) ? match.languageCode : fallbackLanguage;
  const formatLocale = match
    ? match.languageTag
    : primary.regionCode
      ? `${fallbackLanguage}-${primary.regionCode}`
      : fallbackLanguage;

  return {
    language,
    formatLocale,
    uses24hourClock: calendar?.uses24hourClock ?? null,
    measurementSystem: primary.measurementSystem ?? null,
    timeZone: calendar?.timeZone ?? null,
  };
}

let deviceLocale = readDeviceLocale();

/** Current device locale info. Used by `lib/format.ts`. */
export function getDeviceLocale(): DeviceLocale {
  return deviceLocale;
}

/** The app's i18next instance. `initReactI18next` makes it the one `useTranslation` reads. */
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLocale.language,
  fallbackLng: fallbackLanguage,
  supportedLngs: supportedLanguages,
  defaultNS,
  ns: Object.keys(resources[fallbackLanguage]),
  // Resources are bundled, so initialise synchronously and render the right text on the first frame.
  initAsync: false,
  interpolation: { escapeValue: false }, // React already escapes.
  returnNull: false,
  react: { useSuspense: false },
});

/**
 * Re-reads the device language and region when the app comes back to the foreground.
 * iOS restarts the app on a language change; Android does not, so without this
 * the app would keep the old language until it is killed.
 */
export function useDeviceLocaleSync() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const next = readDeviceLocale();
      const languageChanged = next.language !== i18n.language;
      deviceLocale = next;
      if (languageChanged) void i18n.changeLanguage(next.language);
    });
    return () => sub.remove();
  }, []);
}

export default i18n;
