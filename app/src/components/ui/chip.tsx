import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export type ChipStyle = 'outline' | 'selected' | 'neutral' | 'sleep' | 'feed' | 'nappy' | 'care';

type ChipProps = {
  label: string;
  /** Figma `Style`. Outline = options in a group; Selected = chosen; feature tones = tags. */
  variant?: ChipStyle;
  /** Figma `Size`: Medium 36, Small 28 (both grow to 44 with hitSlop when tappable). */
  size?: 'medium' | 'small';
  leadingIcon?: IconName;
  /** Tappable when set. */
  onPress?: () => void;
  /** Read by screen readers for choice chips. */
  selected?: boolean;
  className?: string;
};

const fill: Record<ChipStyle, string> = {
  outline: 'bg-background-surface border border-border-default',
  selected: 'bg-state-selected',
  neutral: 'bg-background-surface-muted',
  sleep: 'bg-feature-sleep',
  feed: 'bg-feature-feed',
  nappy: 'bg-feature-nappy',
  care: 'bg-feature-care',
};

/** Figma `Chip` (Style × Size). Wraps to a new line in groups; never truncates. */
export function Chip({ label, variant = 'outline', size = 'medium', leadingIcon, onPress, selected, className = '' }: ChipProps) {
  const isSelected = variant === 'selected';
  const box = `flex-row items-center self-start gap-xs rounded-full ${size === 'medium' ? 'h-control-sm px-lg' : 'h-[28px] px-md'} ${fill[variant]} ${className}`;
  const content = (
    <>
      {leadingIcon && <Icon name={leadingIcon} tone="color/icon/primary" size={size === 'medium' ? 16 : 14} />}
      <Text variant={size === 'medium' ? 'label-large' : 'label-small'}>
        {label}
      </Text>
    </>
  );
  if (!onPress) return <View className={box}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: selected ?? isSelected }}
      onPress={onPress}
      hitSlop={size === 'medium' ? 4 : 8}
      className={`${box} active:opacity-80`}>
      {content}
    </Pressable>
  );
}
