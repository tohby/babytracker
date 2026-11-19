import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Shadows } from '@/constants/theme';
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
      style={selected ? undefined : { boxShadow: Shadows.glass }}
      className={`min-h-[72px] flex-row items-center gap-lg rounded-tile p-lg ${
        selected ? 'border-[1.5px] border-accent-primary bg-orange-100' : 'border border-glass-stroke bg-glass-fill'
      }`}>
      <View
        className={`size-[40px] items-center justify-center rounded-[12px] ${
          selected ? 'border border-glass-stroke bg-glass-fill' : 'bg-orange-100'
        }`}>
        <Icon name={icon} color={iconTone === 'danger' ? colors['danger/500'] : colors['color/icon/primary']} size={20} />
      </View>
      <View className="flex-1 gap-xs">
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View
        className={`size-[24px] items-center justify-center rounded-full ${
          selected ? 'bg-accent-primary' : 'border-2 border-plum-200'
        }`}>
        {selected ? <Icon name="check" color={colors['text/on-accent-ink']} size={14} /> : null}
      </View>
    </Pressable>
  );
}
