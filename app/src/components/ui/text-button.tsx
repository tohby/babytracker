import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

type TextButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
};

/** Figma `Button/Text`: label only, 48pt tall tap target. */
export function TextButton({ label, onPress, disabled = false, accessibilityHint }: TextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="min-h-[48px] items-center justify-center px-lg active:opacity-60">
      <Text variant="label" tone={disabled ? 'muted' : 'default'}>
        {label}
      </Text>
    </Pressable>
  );
}
