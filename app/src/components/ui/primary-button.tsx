import { ActivityIndicator, Pressable } from 'react-native';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * Main call to action (Figma `Primary button`): 56pt pill on `accent/primary`.
 * The label is `text/on-accent-ink` (dark plum in every theme) because white on orange fails WCAG AA.
 */
export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  const colors = useThemeColors();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`h-[56px] w-full flex-row items-center justify-center gap-sm rounded-full px-lg active:opacity-80 ${
        disabled ? 'bg-plum-200' : 'bg-accent-primary'
      }`}>
      {loading ? <ActivityIndicator color={colors['text/on-accent-ink']} /> : null}
      <Text variant="heading" tone={disabled ? 'muted' : 'onAccent'}>
        {label}
      </Text>
    </Pressable>
  );
}
