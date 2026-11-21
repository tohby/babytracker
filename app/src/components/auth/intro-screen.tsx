import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PromptLink } from '@/components/auth/email-auth';
import { FlowLink, FlowScreen, FlowTitle } from '@/components/onboarding/flow-screen';
import { MascotStage } from '@/components/onboarding/mascot-stage';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatVolume } from '@/lib/format';

const slides = ['nap', 'feed', 'family'] as const;
const poses = ['sleeping', 'feeding', 'happy'] as const;

export function IntroScreen({ onCreate, onLogin }: { onCreate: () => void; onLogin: () => void }) {
  const { t } = useTranslation('onboarding');
  const [index, setIndex] = useState(0);
  const key = slides[index];
  const last = index === slides.length - 1;
  return (
    <FlowScreen topAction={!last && <View className="pe-lg"><FlowLink label={t('intro.skip')} onPress={onCreate} /></View>} footer={
      <>
        <Button wrap label={t(last ? 'intro.start' : 'continue')} onPress={last ? onCreate : () => setIndex(index + 1)} />
        <PromptLink prompt={t('intro.haveAccount')} label={t('intro.login')} onPress={onLogin} />
      </>
    }>
      <MascotStage pose={poses[index]}>
        <View className="flex-row flex-wrap items-center gap-md">
          {key === 'family'
            ? <View className="flex-row">{(['initialsOne', 'initialsTwo'] as const).map((name) => (
              <View key={name} className="min-h-[32px] min-w-[32px] items-center justify-center rounded-full bg-feature-feed">
                <Text variant="caption">{t(`intro.family.${name}`)}</Text>
              </View>
            ))}</View>
            : <View className={`size-[40px] items-center justify-center rounded-sm ${key === 'nap' ? 'bg-feature-sleep' : 'bg-feature-feed'}`}>
              <Icon name={key === 'nap' ? 'moon' : 'bottle'} size={18} />
            </View>}
          <View className="min-w-[92px] flex-1">
            <Text variant={key === 'nap' ? 'caption' : 'label-large'} tone={key === 'nap' ? 'secondary' : 'primary'}>{t(`intro.${key}.card`)}</Text>
            <Text variant={key === 'nap' ? 'heading' : 'caption'} tone={key === 'nap' ? 'primary' : 'secondary'}>{t(`intro.${key}.detail`, { amount: formatVolume(120) })}</Text>
          </View>
          {key === 'family' ? <Icon name="cloud-check" size={24} /> :
            <View className={`rounded-full px-md py-xs ${key === 'nap' ? 'bg-feature-sleep' : 'bg-background-surface-muted'}`}>
              <Text variant="label-small">{t(`intro.${key}.badge`)}</Text>
            </View>}
        </View>
      </MascotStage>
      <View className="gap-md pt-2xl">
        <View className="flex-row gap-sm" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {slides.map((slide, i) => <View key={slide} className={`h-[8px] rounded-full ${i === index ? 'w-[20px] bg-primary-default' : 'w-[8px] bg-border-strong'}`} />)}
        </View>
        <FlowTitle title={t(`intro.${key}.title`)} subtitle={t(`intro.${key}.subtitle`)} />
      </View>
    </FlowScreen>
  );
}
