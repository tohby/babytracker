import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enLog from './locales/en/log.json';
import enOnboarding from './locales/en/onboarding.json';
import enPrediction from './locales/en/prediction.json';
import enSettings from './locales/en/settings.json';
import enSplash from './locales/en/splash.json';
import enTimeline from './locales/en/timeline.json';

/**
 * All translation resources. `en` is the source of truth and the fallback.
 * A new language adds `locales/<lang>/` with the same file names and an entry here.
 */
export const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
    log: enLog,
    onboarding: enOnboarding,
    prediction: enPrediction,
    settings: enSettings,
    splash: enSplash,
    timeline: enTimeline,
  },
} as const;

export type SupportedLanguage = keyof typeof resources;
export const supportedLanguages = Object.keys(resources) as SupportedLanguage[];
export const fallbackLanguage: SupportedLanguage = 'en';
export const defaultNS = 'common';
