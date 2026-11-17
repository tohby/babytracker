import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Shadows } from '@/constants/theme';

export type TileAccent = 'orange' | 'lavender' | 'mint' | 'yellow';

type TimeSinceTileProps = {
  accent: TileAccent;
  title: string;
  /** The big number, already formatted, e.g. "2h 10m". */
  value: string;
  caption: string;
};

/** Full class names (not built from strings) so Tailwind can find them. */
const accentDotClasses: Record<TileAccent, string> = {
  orange: 'bg-orange-500',
  lavender: 'bg-lavender-500',
  mint: 'bg-mint-400',
  yellow: 'bg-yellow-400',
};

/** One "time since" stat on frosted glass (Figma `Tile/Time since`): label, big number, caption. */
export function TimeSinceTile({ accent, title, value, caption }: TimeSinceTileProps) {
  return (
    <View
      style={{ boxShadow: Shadows.glass }}
      className="min-h-[128px] grow basis-[48%] justify-between gap-xs rounded-tile border border-glass-stroke bg-glass-fill p-lg">
      <View className="flex-row items-center gap-sm">
        <View className={`size-[10px] rounded-full ${accentDotClasses[accent]}`} />
        <Text variant="label" tone="muted">
          {title}
        </Text>
      </View>

      <View className="gap-xs">
        {/* One line always: shrinks rather than wraps when a value ("12h 45m") is wider than the tile. */}
        <Text variant="numeral" numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text variant="caption" tone="muted">
          {caption}
        </Text>
      </View>
    </View>
  );
}
