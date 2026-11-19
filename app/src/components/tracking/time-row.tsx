import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

/**
 * Figma `Time row` (State: Now / Backdated). Every log sheet shows when it happened; backdated rows are
 * highlighted (`primary/subtle`) so mistakes are easy to spot. Tap opens the native time picker.
 */
export function TimeRow({ label, value, backdated, onChange }: { label: string; value: string; backdated: boolean; onChange: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      accessibilityHint={t('actions.change')}
      onPress={onChange}
      className={`min-h-control-lg flex-row items-center gap-md rounded-md px-lg py-sm ${backdated ? 'bg-primary-subtle' : 'bg-background-surface-muted'}`}>
      <Icon name="clock" size={20} tone="color/icon/secondary" />
      <Text variant="label-large" tone="secondary" className="flex-1">
        {label}
      </Text>
      <Text variant="subheading" numberOfLines={1} className="flex-shrink">
        {value}
      </Text>
      <Text variant="button-small" tone="link">
        {t('actions.change')}
      </Text>
    </Pressable>
  );
}
