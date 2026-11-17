import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Radio } from '@/components/ui/radio';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { ThemeMode } from '@/lib/theme-schedule';

/** Icon and circle colour per mode (Figma `Card/Theme option`). Full class names so Tailwind finds them. */
const look: Record<ThemeMode, { icon: IconName; circle: string }> = {
  light: { icon: 'sun', circle: 'bg-yellow-400' },
  dark: { icon: 'moon', circle: 'bg-lavender-500' },
  auto: { icon: 'contrast', circle: 'bg-mint-400' },
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
      className={`flex-1 items-center gap-sm rounded-[28px] ${selected ? 'border-orange-500 bg-orange-100' : 'border-plum-200 bg-white'}`}>
      <View className={`size-[48px] items-center justify-center rounded-full ${look[mode].circle}`}>
        <Icon name={look[mode].icon} color={colors.white} />
      </View>
      <View className="w-full items-center gap-xs">
        <Text variant="label" className="text-center" numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
        <Text variant="caption" tone="muted" className="text-center">
          {caption}
        </Text>
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}
