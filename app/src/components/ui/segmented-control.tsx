import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Figma `Segmented control` (Options 2–3 × Selected). Switches views of the same content; segments share width. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className = '',
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Group name for screen readers. */
  label: string;
  className?: string;
}) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      className={`h-touch-min flex-row gap-xs rounded-full border border-border-default bg-background-surface p-xs ${className}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center justify-center rounded-full px-sm ${selected ? 'bg-state-selected' : 'active:bg-state-pressed-surface'}`}>
            <Text variant="label-large" tone={selected ? 'on-primary' : 'secondary'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
