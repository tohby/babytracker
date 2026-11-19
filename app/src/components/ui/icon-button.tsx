import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import type { V2ColorToken } from '@/constants/color-tokens';
import type { ElevationLevel } from '@/constants/theme';
import { useElevation } from '@/hooks/use-elevation';

export type IconButtonStyle = 'surface' | 'tinted' | 'primary' | 'ghost';
export type IconButtonSize = 'small' | 'medium' | 'large';

type IconButtonProps = {
  icon: IconName;
  /** Read aloud by screen readers; icon-only controls always need one. */
  label: string;
  onPress?: () => void;
  /** Figma `Style`: Surface (white on canvas), Tinted (pink), Primary (teal), Ghost (no fill). */
  variant?: IconButtonStyle;
  /** Figma `Size`: Small 40, Medium 48, Large 64 (the log FAB). */
  size?: IconButtonSize;
  disabled?: boolean;
  /** Figma `Badge`: the notification dot. */
  badge?: boolean;
  /** Surface buttons carry Elevation 1; the bottom-nav FAB uses Elevation 2. */
  elevation?: ElevationLevel;
  className?: string;
};

const sizePx: Record<IconButtonSize, { box: string; icon: number; badge: string }> = {
  small: { box: 'size-[40px]', icon: 20, badge: 'end-[1px] top-[2px]' },
  medium: { box: 'size-control-md', icon: 24, badge: 'end-[3px] top-[3px]' },
  large: { box: 'size-fab', icon: 28, badge: 'end-[8px] top-[4px]' },
};

const fill: Record<IconButtonStyle, string> = {
  surface: 'bg-background-surface active:bg-state-pressed-surface',
  tinted: 'bg-secondary-default active:bg-secondary-pressed',
  primary: 'bg-primary-default active:bg-primary-pressed',
  ghost: 'active:bg-state-pressed-surface',
};

const tone: Record<IconButtonStyle, V2ColorToken> = {
  surface: 'color/icon/primary',
  tinted: 'color/secondary/on',
  primary: 'color/icon/on-primary',
  ghost: 'color/icon/primary',
};

/** Figma `Icon button` (Style × Size × State). Round, icon only; also the floating log button. */
export function IconButton({
  icon,
  label,
  onPress,
  variant = 'surface',
  size = 'medium',
  disabled = false,
  badge = false,
  elevation,
  className = '',
}: IconButtonProps) {
  const shadow = useElevation(elevation ?? 'card');
  const s = sizePx[size];
  const hasShadow = !disabled && (elevation !== undefined || variant === 'surface');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={size === 'small' ? 2 : undefined}
      style={hasShadow ? { boxShadow: shadow } : undefined}
      className={`items-center justify-center rounded-full ${s.box} ${disabled ? (variant === 'ghost' ? '' : 'bg-state-disabled') : fill[variant]} ${className}`}>
      <Icon name={icon} tone={disabled ? 'color/icon/disabled' : tone[variant]} size={s.icon} />
      {badge && (
        <View
          className={`absolute size-[10px] rounded-full border-2 border-background-surface bg-accent-notification ${s.badge}`}
        />
      )}
    </Pressable>
  );
}
