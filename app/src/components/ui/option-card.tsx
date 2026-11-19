import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { SelectionControl } from '@/components/ui/selection-control';
import { Text } from '@/components/ui/text';

/**
 * Figma `Option card` (Control × Selected): a choice with a sentence of explanation. Radio = one, Checkbox =
 * many. Selected = 2 pt teal border + filled control. The whole card is the target (min 64).
 */
export function OptionCard({
  title,
  detail,
  leading,
  control = 'radio',
  selected,
  onPress,
}: {
  title: string;
  detail?: string;
  leading?: ReactNode;
  control?: 'radio' | 'checkbox';
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={control}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      // Border is drawn inside: 2 pt selected vs 1 pt default, padding compensates so content doesn't move.
      className={`min-h-[64px] flex-row items-center gap-md rounded-xl bg-background-surface active:bg-state-pressed-surface ${
        selected ? 'border-2 border-primary-default px-[15px] py-[11px]' : 'border border-border-default px-lg py-md'
      }`}>
      {leading}
      <View className="flex-1 gap-2xs">
        <Text variant="subheading">{title}</Text>
        {!!detail && (
          <Text variant="body-small" tone="secondary">
            {detail}
          </Text>
        )}
      </View>
      <SelectionControl type={control} checked={selected} />
    </Pressable>
  );
}
