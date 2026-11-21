import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FlowLink } from '@/components/onboarding/flow-screen';
import { Text } from '@/components/ui/text';
import { formatNumber } from '@/lib/format';

export function StepFooter({ step, omitLabel, onOmit }: { step: number; omitLabel?: string; onOmit?: () => void }) {
  const { t } = useTranslation('onboarding');
  const number = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });
  return (
    <View className="min-h-[40px] flex-row flex-wrap items-center justify-center gap-sm">
      <Text variant="body-small" tone="secondary">{t('stepCount', { step: number(step), total: number(5) })}</Text>
      {omitLabel && onOmit && <>
        <Text variant="caption" tone="secondary" accessibilityElementsHidden>{t('stepSeparator')}</Text>
        <FlowLink label={omitLabel} onPress={onOmit} />
      </>}
    </View>
  );
}
