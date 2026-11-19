import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/text';

type CodeInputProps = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
};

/**
 * Six boxes for the email code. One hidden text field underneath, so paste and iOS "From Mail"
 * autofill (`oneTimeCode`) fill all six at once.
 */
export function CodeInput({ value, onChange, length = 6, error = false, disabled = false, accessibilityLabel }: CodeInputProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable onPress={() => input.current?.focus()} accessible={false} className="w-full">
      <View className="flex-row justify-between gap-sm">
        {Array.from({ length }, (_, i) => {
          const active = focused && i === Math.min(value.length, length - 1);
          const border = error ? 'border-2 border-border-error' : active ? 'border-2 border-border-focus' : 'border border-border-default';
          return (
            <View key={i} className={`h-[64px] flex-1 items-center justify-center rounded-[16px] bg-background-surface ${border}`}>
              <Text variant="heading">{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        accessibilityLabel={accessibilityLabel}
        caretHidden
        className="absolute inset-0 opacity-0"
      />
    </Pressable>
  );
}
