import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatNumber } from '@/lib/format';
import type { Biometric } from '@/lib/unlock/pin';

export function PinDot({ state }: { state: 'empty' | 'filled' | 'error' }) {
  const tone = state === 'error' ? 'bg-status-error' : state === 'filled' ? 'bg-primary-default' : 'border-2 border-border-strong';
  return <View className={`size-[16px] rounded-full ${tone}`} />;
}

export function KeypadKey({ label, icon, disabled, onPress }: { label: string; icon?: IconName; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="h-[64px] flex-1 items-center justify-center rounded-full active:bg-state-pressed-surface"
    >
      {icon ? <Icon name={icon} size={24} /> : <Text variant="title-medium" tabular>{label}</Text>}
    </Pressable>
  );
}

const rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

export function Keypad({ disabled, paused, biometric, onDigit, onDelete, onBiometric }: {
  disabled?: boolean;
  paused?: boolean;
  biometric?: Biometric | null;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
}) {
  const { t } = useTranslation('unlock');
  return (
    <View className={`me-[40px] gap-sm ${paused ? 'opacity-35' : ''}`}>
      {rows.map((row) => (
        <View key={row[0]} className="flex-row gap-[19px]">
          {row.map((digit) => <KeypadKey key={digit} label={formatNumber(digit)} disabled={disabled} onPress={() => onDigit(String(digit))} />)}
        </View>
      ))}
      <View className="flex-row gap-[19px]">
        {biometric && onBiometric ? (
          <KeypadKey label={t(`biometric.${biometric}.prompt`)} icon={biometric === 'faceId' ? 'face-id-key' : 'fingerprint'} disabled={disabled} onPress={onBiometric} />
        ) : <View className="flex-1" />}
        <KeypadKey label={formatNumber(0)} disabled={disabled} onPress={() => onDigit('0')} />
        <KeypadKey label={t('deleteDigit')} icon="backspace" disabled={disabled} onPress={onDelete} />
      </View>
    </View>
  );
}
