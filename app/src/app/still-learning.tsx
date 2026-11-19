import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressBar } from '@/components/charts/progress-bar';
import { AgeGuide } from '@/components/log/age-guide';
import { useLogContext } from '@/components/log/use-log-context';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';
import { NAPS_NEEDED } from '@/lib/prediction';

/** `Sheet content/Still learning` (Timeline & Insights page): progress towards the first logs-based prediction. */
export default function StillLearningSheet() {
  const { t } = useTranslation('prediction');
  const { name, events } = useLogContext();
  const logged = Math.min(NAPS_NEEDED, events.filter((e) => e.type === 'sleep' && e.endAt).length);
  return (
    <BottomSheet size="tall" title={t('learning.sheetTitle')} subtitle={t('learning.sheetSubtitle', { name })} onClose={() => router.back()} actions={<Button label={t('learning.logNap')} onPress={() => router.replace('/log/nap')} />}>
      <View className="flex-row items-center gap-md">
        <Mascot pose="thinking" size={96} />
        <Text variant="body" className="flex-1">
          {t('learning.body', { count: NAPS_NEEDED - logged, name })}
        </Text>
      </View>
      <View className="gap-sm">
        <View className="flex-row justify-between">
          <Text variant="label-large">{t('learning.napsLogged')}</Text>
          <Text variant="label-large">{t('learning.progress', { logged, needed: NAPS_NEEDED })}</Text>
        </View>
        <ProgressBar tone="sleep" value={logged / NAPS_NEEDED} label={t('learning.progress', { logged, needed: NAPS_NEEDED })} />
      </View>
      <AgeGuide />
    </BottomSheet>
  );
}
