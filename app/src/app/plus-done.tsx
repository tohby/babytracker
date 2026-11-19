import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HeroScreen } from '@/components/screen';
import { PerkRow } from '@/components/tracking/plan-card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/** V2-I02 Plus · you're all set. */
export default function PlusDoneScreen() {
  const { t } = useTranslation('plus');
  return (
    <HeroScreen tone="nappy" mascot="happy" heroHeight={300} onBack={null} footer={<Button label={t('back')} onPress={() => router.replace('/settings')} />}>
      <Text variant="title-large">{t('doneTitle')}</Text>
      <Text variant="body">{t('doneBody')}</Text>
      <View>
        <PerkRow text={t('donePerkWake')} />
        <PerkRow text={t('donePerkPdf')} />
        <PerkRow text={t('donePerkThemes')} />
      </View>
    </HeroScreen>
  );
}
