import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: boolean;
};

/** Square tick box with a wrapping label; the whole row is the tap target. */
export function Checkbox({ checked, onChange, label, error = false }: CheckboxProps) {
  const colors = useThemeColors();
  const box = checked
    ? 'bg-accent-primary border-accent-primary'
    : error
      ? 'bg-white border-2 border-danger-500'
      : 'bg-white border border-plum-200';
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      className="min-h-[44px] flex-row items-start gap-md py-xs">
      <View className={`size-[24px] items-center justify-center rounded-[6px] border ${box}`}>
        {checked ? <Icon name="check" color={colors['text/on-accent-ink']} size={18} /> : null}
      </View>
      <Text variant="label" className="flex-1">
        {label}
      </Text>
    </Pressable>
  );
}
