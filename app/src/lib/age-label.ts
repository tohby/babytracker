import i18n from '@/i18n';
import { ageParts } from '@/lib/onboarding/age';

/** "6 weeks", "7 months", "1 year" (localised, plural-aware). */
export function ageLabel(birthDate: string, now = new Date()): string {
  const { months, weeks } = ageParts(birthDate, now);
  if (months < 2) return i18n.t('age.weeks', { count: Math.max(0, weeks) });
  if (months < 24) return i18n.t('age.months', { count: months });
  return i18n.t('age.years', { count: Math.floor(months / 12) });
}
