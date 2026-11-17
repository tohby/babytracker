import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

export type ListRowTone = 'lavender' | 'orange' | 'mint' | 'cream';

/** Full class names so Tailwind can find them (Figma `List/Row` Circle variants). */
const circleClasses: Record<ListRowTone, string> = {
  lavender: 'bg-lavender-100',
  orange: 'bg-orange-100',
  mint: 'bg-mint-100',
  cream: 'bg-cream-50',
};

type ListRowProps = {
  icon: IconName;
  tone: ListRowTone;
  title: string;
  subtitle?: string;
  /** Current value shown on the end side (Figma `Trailing=Value`). */
  value?: string;
  onPress?: () => void;
};

/** Settings-style row: icon circle, title and optional subtitle, optional value (Figma `List/Row`). */
export function ListRow({ icon, tone, title, subtitle, value, onPress }: ListRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, value, subtitle].filter(Boolean).join(', ')}
      onPress={onPress}
      className="min-h-[56px] flex-row items-center gap-md px-lg py-md active:opacity-70">
      <View className={`size-[40px] items-center justify-center rounded-full ${circleClasses[tone]}`}>
        <Icon name={icon} color={colors['icon/primary']} />
      </View>
      <View className="flex-1 gap-xs">
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? <Text tone="muted">{value}</Text> : null}
    </Pressable>
  );
}
