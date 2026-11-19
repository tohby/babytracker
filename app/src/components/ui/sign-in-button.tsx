import { Pressable } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

/**
 * Figma `Sign-in button` (Provider). Apple: solid ink (`text/primary`) with a surface-coloured logo and label,
 * so it inverts in dark mode. Google: surface with the colour logo and a hairline `border/strong`.
 */
export function SignInButton({
  provider,
  label,
  onPress,
  disabled,
}: {
  provider: 'apple' | 'google';
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const apple = provider === 'apple';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-control-lg flex-row items-center justify-center gap-md rounded-full px-xl active:opacity-80 ${
        apple ? 'bg-text-primary' : 'border border-border-strong bg-background-surface'
      }`}>
      <Icon name={provider} size={20} tone={apple ? 'color/background/surface' : 'color/icon/primary'} />
      <Text variant="button-large" tone={apple ? 'inverse' : 'primary'}>
        {label}
      </Text>
    </Pressable>
  );
}
