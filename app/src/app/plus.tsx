import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HeroScreen } from '@/components/screen';
import { PerkRow, PlanCard } from '@/components/tracking/plan-card';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

/**
 * V2-I01 Nappa Plus. There is no in-app purchase integration yet, so the trial and restore buttons say so instead
 * of pretending (see gaps list). I02 ("You're all set") is `/plus-done`, shown once purchases exist.
 */
export default function PlusScreen() {
  const { t } = useTranslation('plus');
  const toast = useToast();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const unavailable = () => toast.show({ message: t('unavailable') });
  return (
    <HeroScreen
      tone="feed"
      mascot="happy"
      title={t('title')}
      subtitle={t('subtitle')}
      footer={
        <>
          <Button label={t('trial')} onPress={unavailable} />
          <Button hierarchy="tertiary" size="medium" label={t('restore')} onPress={unavailable} />
          <Text variant="caption" tone="secondary" className="text-center">
            {t('terms')}
          </Text>
        </>
      }>
      <Banner type="success" message={t('free')} />
      <View>
        <PerkRow text={t('perkWake')} />
        <PerkRow text={t('perkPdf')} />
      </View>
      <PlanCard plan={t('yearly')} terms={t('yearlyTerms')} badge={t('save')} selected={plan === 'yearly'} onPress={() => setPlan('yearly')} />
      <PlanCard plan={t('monthly')} terms={t('monthlyTerms')} selected={plan === 'monthly'} onPress={() => setPlan('monthly')} />
    </HeroScreen>
  );
}
