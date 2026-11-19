import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { SelectionControl } from '@/components/ui/selection-control';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { ThemeMode } from '@/lib/theme-schedule';

/** Icon and circle colour per mode (Figma `Card/Theme option`). Full class names so Tailwind finds them. */
const look: Record<ThemeMode, { icon: IconName; circle: string }> = {
  light: { icon: 'sun', circle: 'bg-feature-care-strong' },
  dark: { icon: 'moon', circle: 'bg-feature-feed-strong' },
  auto: { icon: 'contrast', circle: 'bg-feature-nappy-strong' },
};

/** Figma padding is 16 top, 12 sides and bottom, with the border drawn inside. RN borders take space, so subtract them. */
const PADDING = { top: 16, side: 12 };

type ThemeOptionCardProps = {
  mode: ThemeMode;
  label: string;
  caption: string;
  selected: boolean;
  onPress: () => void;
};

/** One mode in the Appearance sheet: icon circle, label, caption, radio. Selected = orange tint and border. */
export function ThemeOptionCard({ mode, label, caption, selected, onPress }: ThemeOptionCardProps) {
  const colors = useThemeColors();
  const border = selected ? 2 : 1;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}, ${caption}`}
      onPress={onPress}
      style={{
        borderWidth: border,
        paddingTop: PADDING.top - border,
        paddingHorizontal: PADDING.side - border,
        paddingBottom: PADDING.side - border,
      }}
      className={`flex-1 items-center gap-sm rounded-[28px] ${selected ? 'border-primary-default bg-primary-subtle' : 'border-border-default bg-background-surface'}`}>
      <View className={`size-[48px] items-center justify-center rounded-full ${look[mode].circle}`}>
        <Icon name={look[mode].icon} color={colors['color/background/surface']} />
      </View>
      <View className="w-full items-center gap-xs">
        <Text variant="label-large" className="text-center" numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
        <Text variant="caption" tone="secondary" className="text-center">
          {caption}
        </Text>
      </View>
      <SelectionControl type="radio" checked={selected} />
    </Pressable>
  );
}
