import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text, type TextTone } from '@/components/ui/text';
import type { V2ColorToken } from '@/constants/color-tokens';

export type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'large' | 'medium' | 'small';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** Figma `Hierarchy`. Primary = the one main action per screen. */
  hierarchy?: ButtonHierarchy;
  /** Figma `Size`: Large 56 (screen CTAs, sheets), Medium 48 (cards, dialogs), Small 36 (inline). */
  size?: ButtonSize;
  disabled?: boolean;
  /** Figma `State=Loading`: keeps the label (invisible) so the width doesn't jump. */
  loading?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Layout only (e.g. `self-stretch`, `flex-1`). */
  className?: string;
  accessibilityHint?: string;
};

const sizeClass: Record<ButtonSize, string> = {
  large: 'h-control-lg px-xl',
  medium: 'h-control-md px-page',
  small: 'h-control-sm px-lg',
};

const fillClass: Record<ButtonHierarchy, string> = {
  primary: 'bg-primary-default active:bg-primary-pressed',
  secondary: 'bg-secondary-default active:bg-secondary-pressed',
  tertiary: 'active:bg-state-pressed-surface',
  destructive: 'bg-status-error active:bg-status-error-pressed',
};

const labelTone: Record<ButtonHierarchy, TextTone> = {
  primary: 'on-primary',
  secondary: 'secondary-on',
  tertiary: 'link',
  destructive: 'on-primary',
};

const iconTone: Record<ButtonHierarchy, V2ColorToken> = {
  primary: 'color/icon/on-primary',
  secondary: 'color/secondary/on',
  tertiary: 'color/text/link',
  destructive: 'color/icon/on-primary',
};

/** Figma `Button` (Hierarchy × Size × State). Fully rounded; labels are verbs in sentence case. */
export function Button({
  label,
  onPress,
  hierarchy = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  className = '',
  accessibilityHint,
}: ButtonProps) {
  const fill = disabled ? (hierarchy === 'tertiary' ? '' : 'bg-state-disabled') : fillClass[hierarchy];
  const tone: TextTone = disabled ? 'disabled' : labelTone[hierarchy];
  const icon: V2ColorToken = disabled ? 'color/icon/disabled' : iconTone[hierarchy];
  const iconSize = size === 'small' ? 16 : 20;
  const onColour = hierarchy === 'primary' || hierarchy === 'destructive';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      // Small is 36 high: grow the touch target to the 44 pt minimum.
      hitSlop={size === 'small' ? 4 : undefined}
      className={`flex-row items-center justify-center gap-sm rounded-full ${sizeClass[size]} ${fill} ${className}`}>
      <View className={`flex-row items-center gap-sm ${loading ? 'opacity-0' : ''}`}>
        {leadingIcon && <Icon name={leadingIcon} tone={icon} size={iconSize} />}
        <Text variant={size === 'small' ? 'button-small' : 'button-large'} tone={tone} numberOfLines={1}>
          {label}
        </Text>
        {trailingIcon && <Icon name={trailingIcon} tone={icon} size={iconSize} />}
      </View>
      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <Spinner tone={onColour ? 'on-colour' : 'brand'} />
        </View>
      )}
    </Pressable>
  );
}
