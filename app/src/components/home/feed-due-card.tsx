import { useTranslation } from 'react-i18next';

import { HeroCard } from '@/components/home/hero-card';
import { useFeedCaption } from '@/components/home/use-feed-caption';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { formatDuration, formatTime } from '@/lib/format';

/** Figma `Card/Hero gradient` (feed). Without feed logs (Figma M1-20): a dash and "Log a feed to see this". */
export function FeedDueCard({ feedDue }: { feedDue: HomeData['feedDue'] }) {
  const { t } = useTranslation('home');
  const feedCaption = useFeedCaption();

  if (!feedDue) {
    return (
      <HeroCard tone="feed" chip={t('feedDue.chip')} mascot="feeding">
        <Text variant="title" accessibilityLabel={t('feedDue.empty')}>
          {t('tiles.empty')}
        </Text>
        <Text variant="label">{t('feedDue.empty')}</Text>
        <Text variant="caption" tone="heroMuted">
          {t('feedDue.learns')}
        </Text>
      </HeroCard>
    );
  }

  return (
    <HeroCard tone="feed" chip={t('feedDue.chip')} mascot="feeding">
      <Text variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {t('feedDue.approxTime', { time: formatTime(feedDue.at) })}
      </Text>
      <Text variant="label">
        {t('feedDue.usualInterval', { duration: formatDuration(feedDue.usualIntervalMs, 'long') })}
      </Text>
      <Text variant="caption" tone="heroMuted">
        {feedCaption(feedDue.kind, feedDue.amountMl)}
      </Text>
    </HeroCard>
  );
}
