import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { featureBg, type FeatureTone } from '@/constants/tones';

const icons = { sleep: 'moon', feed: 'bottle', nappy: 'check', care: 'sparkle' } as const;

/** Figma `Reason tile` (Tone): one input the prediction used, in plain words with one number. */
export function ReasonTile({ tone, label, value }: { tone: FeatureTone; label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View accessible accessibilityLabel={t('a11y.labelValue', { label, value })} className={`min-h-[110px] flex-1 gap-xs rounded-lg p-md ${featureBg[tone]}`}>
      <IconTile icon={icons[tone]} tone="surface" compact />
      <Text variant="caption" tone="secondary" numberOfLines={2}>
        {label}
      </Text>
      <Text variant="numeric-medium" tabular numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}
