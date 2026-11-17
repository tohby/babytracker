import { useTranslation } from 'react-i18next';

import { HeroCard } from '@/components/home/hero-card';
import { useFeedCaption } from '@/components/home/use-feed-caption';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { formatDuration, formatTime } from '@/lib/format';

export function FeedDueCard({ feedDue }: { feedDue: HomeData['feedDue'] }) {
  const { t } = useTranslation('home');
  const feedCaption = useFeedCaption();
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
