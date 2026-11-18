import type { TFunction } from 'i18next';

import { ageParts } from '@/lib/onboarding/age';

/** "3 months, 4 weeks" / "2 weeks, 3 days" / "5 days", as whole translated phrases. */
export function ageLabel(t: TFunction<'onboarding'>, birthDate: string, now?: Date): string {
  const { months, weeks, days } = ageParts(birthDate, now);
  const parts =
    months > 0
      ? [t('age.months', { count: months }), weeks > 0 ? t('age.weeks', { count: weeks }) : null]
      : weeks > 0
        ? [t('age.weeks', { count: weeks }), days > 0 ? t('age.days', { count: days }) : null]
        : [t('age.days', { count: days })];
  const [first, second] = parts.filter((p): p is string => p !== null);
  return second ? t('age.pair', { first, second }) : first;
}
