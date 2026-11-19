import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';

/**
 * Figma `Stepper`: − value unit +. `amount` and `unit` arrive formatted (format.ts); the caller owns the
 * step size (10 ml / 0.5 oz) and limits.
 */
export function Stepper({
  amount,
  unit,
  onDecrease,
  onIncrease,
  canDecrease = true,
  canIncrease = true,
  label,
}: {
  amount: string;
  unit: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease?: boolean;
  canIncrease?: boolean;
  /** What is being adjusted, read before the value ("Amount"). */
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <View
      className="h-control-lg flex-row items-center justify-between rounded-full border border-border-default bg-background-surface p-xs"
      accessible={false}>
      <IconButton icon="minus" variant="tinted" label={t('actions.decrease', { what: label })} onPress={onDecrease} disabled={!canDecrease} />
      <View className="flex-row items-baseline gap-xs" accessible accessibilityLabel={t('a11y.stepperValue', { what: label, amount, unit })} accessibilityLiveRegion="polite">
        <Text variant="numeric-medium" tabular>
          {amount}
        </Text>
        <Text variant="body-small" tone="secondary">
          {unit}
        </Text>
      </View>
      <IconButton icon="plus" variant="tinted" label={t('actions.increase', { what: label })} onPress={onIncrease} disabled={!canIncrease} />
    </View>
  );
}
