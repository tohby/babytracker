import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Elevation } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SelectRowProps = {
  icon: IconName;
  /** Heart is red in Figma; everything else is `text/primary`. */
  iconTone?: 'default' | 'danger';
  title: string;
  subtitle?: string;
  selected: boolean;
  multi?: boolean;
  onPress: () => void;
};

/**
 * Figma `Nappa App/Onboarding/Select Row`: glass row with an icon tile; selected rows turn
 * `orange/100` with an `accent/primary` border and a filled check.
 */
export function SelectRow({ icon, iconTone = 'default', title, subtitle, selected, multi = false, onPress }: SelectRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      style={selected ? undefined : { boxShadow: Elevation.card }}
      className={`min-h-[72px] flex-row items-center gap-lg rounded-xl p-lg ${
        selected ? 'border-[1.5px] border-primary-default bg-primary-subtle' : 'border border-border-default bg-background-surface'
      }`}>
      <View
        className={`size-[40px] items-center justify-center rounded-[12px] ${
          selected ? 'border border-border-default bg-background-surface' : 'bg-primary-subtle'
        }`}>
        <Icon name={icon} color={iconTone === 'danger' ? colors['color/status/error'] : colors['color/icon/primary']} size={20} />
      </View>
      <View className="flex-1 gap-xs">
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View
        className={`size-[24px] items-center justify-center rounded-full ${
          selected ? 'bg-primary-default' : 'border-2 border-border-default'
        }`}>
        {selected ? <Icon name="check" color={colors['color/text/on-primary']} size={14} /> : null}
      </View>
    </Pressable>
  );
}
