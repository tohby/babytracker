import { useTranslation } from 'react-i18next';

import { HeroCard } from '@/components/home/hero-card';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';

type NextNapCardProps = {
  nextNap: NonNullable<HomeData['nextNap']>;
  babyName: string;
  now: number;
};

/**
 * Figma `Card/Hero gradient` (nap). With no logs yet (Figma M1-20) the chip says the time comes from
 * the baby's age and the caption invites the first nap log.
 */
export function NextNapCard({ nextNap, babyName, now }: NextNapCardProps) {
  const { t } = useTranslation('home');
  const msUntil = elapsedMs(now, nextNap.windowStart);
  const fromAge = nextNap.basis === 'age';
  const isTomorrow = new Date(nextNap.windowStart).getDate() !== new Date(now).getDate();
  const caption = fromAge
    ? t('nextNap.personalise')
    : msUntil < 60_000
      ? t('nextNap.startsNow')
      : t('nextNap.startsIn', { duration: formatDuration(msUntil, 'short') });

  return (
    <HeroCard tone="nap" chip={fromAge ? t('nextNap.basedOnAge', { name: babyName }) : t('nextNap.chip')} mascot="sleeping">
      <Text variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {formatTime(nextNap.windowStart)}
      </Text>
      <Text variant="label">
        {t(isTomorrow ? 'nextNap.windowUntilTomorrow' : 'nextNap.windowUntil', { time: formatTime(nextNap.windowEnd) })}
      </Text>
      <Text variant="caption" tone="heroMuted">
        {caption}
      </Text>
    </HeroCard>
  );
}
