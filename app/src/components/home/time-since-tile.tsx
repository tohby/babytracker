import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { TileAccent, TimeSinceTileData } from '@/data/home';

/** Full class names (not built from strings) so Tailwind can find them. */
const accentDotClasses: Record<TileAccent, string> = {
  orange: 'bg-orange-500',
  lavender: 'bg-lavender-500',
  mint: 'bg-mint-400',
  yellow: 'bg-yellow-400',
};

/** One "time since" stat: coloured label on top, big number, small caption. */
export function TimeSinceTile({ accent, title, value, caption }: Omit<TimeSinceTileData, 'id'>) {
  return (
    <View className="h-[128px] grow basis-[48%] justify-between rounded-tile bg-cream-50 p-lg">
      <View className="flex-row items-center gap-sm">
        <View className={`size-[10px] rounded-full ${accentDotClasses[accent]}`} />
        <Text variant="label" tone="muted">
          {title}
        </Text>
      </View>

      <View className="gap-xs">
        <Text variant="numeral">{value}</Text>
        <Text variant="caption" tone="muted">
          {caption}
        </Text>
      </View>
    </View>
  );
}
