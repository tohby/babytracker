import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TimeSinceTile } from '@/components/home/time-since-tile';
import { useFeedCaption } from '@/components/home/use-feed-caption';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';

type SinceLastSectionProps = Pick<HomeData, 'lastFeed' | 'awakeSince' | 'lastNappy' | 'sleepToday' | 'syncedWith' | 'babyName'> & {
  now: number;
};

/**
 * "Since last" heading with a sync note, then a two-column grid of tiles. Tiles without a log yet
 * show a dash and what to log (Figma M1-20).
 */
export function SinceLastSection({ lastFeed, awakeSince, lastNappy, sleepToday, syncedWith, babyName, now }: SinceLastSectionProps) {
  const { t } = useTranslation('home');
  const feedCaption = useFeedCaption();
  const empty = t('tiles.empty');

  return (
    <View className="gap-md">
      <View className="flex-row flex-wrap items-center justify-between gap-sm">
        <Text variant="heading">{t('sinceLast.heading')}</Text>
        <View className="flex-row items-center gap-sm">
          <View className="size-[8px] rounded-full bg-mint-400" />
          <Text variant="caption" tone="muted">
            {syncedWith ? t('sinceLast.syncedWith', { name: syncedWith }) : t('sinceLast.justYou')}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-md">
        <TimeSinceTile
          accent="orange"
          title={t('tiles.feed.title')}
          value={lastFeed ? formatDuration(elapsedMs(lastFeed.at, now)) : empty}
          caption={lastFeed ? feedCaption(lastFeed.kind, lastFeed.amountMl) : t('tiles.feed.first', { name: babyName })}
        />
        <TimeSinceTile
          accent="lavender"
          title={t('tiles.awake.title')}
          value={awakeSince ? formatDuration(elapsedMs(awakeSince, now)) : empty}
          caption={awakeSince ? t('tiles.awake.woke', { time: formatTime(awakeSince) }) : t('tiles.awake.first')}
        />
        <TimeSinceTile
          accent="mint"
          title={t('tiles.nappy.title')}
          value={lastNappy ? formatDuration(elapsedMs(lastNappy.at, now)) : empty}
          caption={lastNappy ? t(`tiles.nappy.${lastNappy.kind}`) : t('tiles.nappy.first')}
        />
        <TimeSinceTile
          accent="yellow"
          title={t('tiles.sleep.title')}
          value={sleepToday ? formatDuration(sleepToday.totalMs) : empty}
          caption={sleepToday && sleepToday.napCount > 0 ? t('tiles.sleep.naps', { count: sleepToday.napCount }) : t('tiles.sleep.none')}
        />
      </View>
    </View>
  );
}
