import { TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

/** Figma `Nappa App/Onboarding/Big Input`: label over a large centred field (names). */
export function BigInput({ label, ...input }: TextInputProps & { label: string }) {
  const colors = useThemeColors();
  return (
    <View className="items-center gap-sm">
      <Text variant="label-large">{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={100}
        selectionColor={colors['color/primary/default']}
        placeholderTextColor={colors['color/text/secondary']}
        className="min-w-[160px] text-center font-outfit-semibold text-[28px] leading-[34px] text-text-primary"
      />
    </View>
  );
}
