import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useThemeColors } from '@/hooks/use-theme-colors';

type IconButtonProps = {
  icon: IconName;
  /** Read aloud by screen readers; icons have no visible text. */
  label: string;
  onPress?: () => void;
  /** Size of the round button in px. */
  size?: number;
  /** Background classes, e.g. `bg-cream-50`. */
  backgroundClassName?: string;
  /** Icon color. Defaults to the `icon/primary` token. */
  iconColor?: string;
  /** Shows a small orange dot in the top-right corner. */
  showBadge?: boolean;
};

export function IconButton({
  icon,
  label,
  onPress,
  size = 48,
  backgroundClassName = 'bg-cream-50',
  iconColor,
  showBadge = false,
}: IconButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: size, height: size }}
      className={`items-center justify-center rounded-full ${backgroundClassName}`}>
      <Icon name={icon} color={iconColor ?? colors['color/icon/primary']} />
      {showBadge && <View className="absolute right-[11px] top-[12px] size-[9px] rounded-full bg-orange-500" />}
    </Pressable>
  );
}
