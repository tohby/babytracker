import { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/text';

export const CODE_LENGTH = 6;

export function CodeCell({ value, focused, error }: { value?: string; focused: boolean; error: boolean }) {
  const border = error ? 'border-2 border-border-error' : focused ? 'border-2 border-border-focus' : 'border border-border-default';
  return (
    <View className={`h-[60px] flex-1 items-center justify-center rounded-md bg-background-surface ${border}`}>
      {value ? <Text variant="heading" tone={error ? 'error' : 'primary'}>{value}</Text> : focused && <View className="h-[24px] w-[2px] bg-primary-default" />}
    </View>
  );
}

/** A single native input preserves system paste and OTP autofill across all six visual cells. */
export function CodeInput({ value, onChange, error, disabled, accessibilityLabel }: {
  value: string;
  onChange: (code: string) => void;
  error: boolean;
  disabled: boolean;
  accessibilityLabel: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <View className="flex-row gap-sm" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: CODE_LENGTH }, (_, index) => (
          <CodeCell key={index} value={value[index]} error={error} focused={focused && !disabled && index === value.length} />
        ))}
      </View>
      <TextInput
        value={value}
        onChangeText={(code) => onChange(code.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus
        keyboardType="number-pad"
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : undefined}
        accessibilityLabel={accessibilityLabel}
        caretHidden
        selectTextOnFocus={error}
        underlineColorAndroid="transparent"
        className="absolute inset-0 bg-transparent text-transparent"
      />
    </View>
  );
}
