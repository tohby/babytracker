import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TimeSinceTile } from '@/components/home/time-since-tile';
import { useFeedCaption } from '@/components/home/use-feed-caption';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';

type SinceLastSectionProps = Pick<HomeData, 'lastFeed' | 'awakeSince' | 'lastNappy' | 'sleepToday' | 'syncedWith'> & {
  now: number;
};

/** "Since last" heading with a sync note, then a two-column grid of tiles. */
export function SinceLastSection({ lastFeed, awakeSince, lastNappy, sleepToday, syncedWith, now }: SinceLastSectionProps) {
  const { t } = useTranslation('home');
  const feedCaption = useFeedCaption();

  return (
    <View className="gap-md">
      <View className="flex-row flex-wrap items-center justify-between gap-sm">
        <Text variant="heading">{t('sinceLast.heading')}</Text>
        <View className="flex-row items-center gap-sm">
          <View className="size-[8px] rounded-full bg-mint-400" />
          <Text variant="caption" tone="muted">
            {t('sinceLast.syncedWith', { name: syncedWith })}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-md">
        <TimeSinceTile
          accent="orange"
          title={t('tiles.feed.title')}
          value={formatDuration(elapsedMs(lastFeed.at, now))}
          caption={feedCaption(lastFeed.kind, lastFeed.amountMl)}
        />
        <TimeSinceTile
          accent="lavender"
          title={t('tiles.awake.title')}
          value={formatDuration(elapsedMs(awakeSince, now))}
          caption={t('tiles.awake.woke', { time: formatTime(awakeSince) })}
        />
        <TimeSinceTile
          accent="mint"
          title={t('tiles.nappy.title')}
          value={formatDuration(elapsedMs(lastNappy.at, now))}
          caption={t(`tiles.nappy.${lastNappy.kind}`)}
        />
        <TimeSinceTile
          accent="yellow"
          title={t('tiles.sleep.title')}
          value={formatDuration(sleepToday.totalMs)}
          caption={t('tiles.sleep.naps', { count: sleepToday.napCount })}
        />
      </View>
    </View>
  );
}
