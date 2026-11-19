import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';

export type PredictionVerdict = 'early' | 'right' | 'late';

/** Figma `Prediction feedback` (Answered): one tap to correct the engine; answered thanks, no follow-up. */
export function PredictionFeedback({ answer, onAnswer }: { answer: PredictionVerdict | null; onAnswer: (v: PredictionVerdict) => void }) {
  const { t } = useTranslation('prediction');
  const options: { v: PredictionVerdict; label: string }[] = [
    { v: 'early', label: t('feedback.early') },
    { v: 'right', label: t('feedback.right') },
    { v: 'late', label: t('feedback.late') },
  ];
  if (answer) {
    return (
      <View className="min-h-touch-min flex-row flex-wrap items-center gap-sm">
        <Chip label={options.find((o) => o.v === answer)!.label} variant="selected" size="small" />
        <Text variant="body-small" tone="secondary" accessibilityLiveRegion="polite">
          {t('feedback.thanks')}
        </Text>
      </View>
    );
  }
  return (
    <View className="min-h-touch-min flex-row flex-wrap items-center gap-sm">
      <Text variant="body-small" tone="secondary">
        {t('feedback.question')}
      </Text>
      {options.map((o) => (
        <Chip key={o.v} label={o.label} variant="outline" size="small" onPress={() => onAnswer(o.v)} />
      ))}
    </View>
  );
}
