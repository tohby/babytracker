import { useTranslation } from 'react-i18next';

import { HeroCard } from '@/components/home/hero-card';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';

type NextNapCardProps = {
  nextNap: HomeData['nextNap'];
  now: number;
};

export function NextNapCard({ nextNap, now }: NextNapCardProps) {
  const { t } = useTranslation('home');
  const msUntil = elapsedMs(now, nextNap.windowStart);
  const startsIn =
    msUntil < 60_000 ? t('nextNap.startsNow') : t('nextNap.startsIn', { duration: formatDuration(msUntil, 'short') });

  return (
    <HeroCard tone="nap" chip={t('nextNap.chip')} mascot="sleeping">
      <Text variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {formatTime(nextNap.windowStart)}
      </Text>
      <Text variant="label">{t('nextNap.windowUntil', { time: formatTime(nextNap.windowEnd) })}</Text>
      <Text variant="caption" tone="heroMuted">
        {startsIn}
      </Text>
    </HeroCard>
  );
}
