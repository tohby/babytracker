import { View } from 'react-native';

import { TimeSinceTile } from '@/components/home/time-since-tile';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';

type SinceLastSectionProps = Pick<HomeData, 'sinceLast' | 'syncedWith'>;

/** "Since last" heading with a sync note, then a two-column grid of tiles. */
export function SinceLastSection({ sinceLast, syncedWith }: SinceLastSectionProps) {
  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">Since last</Text>
        <View className="flex-row items-center gap-sm">
          <View className="size-[8px] rounded-full bg-mint-400" />
          <Text variant="caption" tone="muted">
            Synced with {syncedWith}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-md">
        {sinceLast.map(({ id, ...tile }) => (
          <TimeSinceTile key={id} {...tile} />
        ))}
      </View>
    </View>
  );
}
