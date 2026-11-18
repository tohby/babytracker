import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectRow } from '@/components/onboarding/select-row';
import { Chip } from '@/components/onboarding/steps/basics';
import type { StepProps } from '@/components/onboarding/steps/types';
import { WheelGroup, WheelPicker } from '@/components/onboarding/wheel-picker';
import { GlassCard } from '@/components/ui/glass-card';
import { type IconName } from '@/components/ui/icon';
import { Mascot } from '@/components/ui/mascot';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/hooks/use-onboarding';
import { sleepNeed } from '@/lib/onboarding/age';
import type { NapPlace } from '@/lib/onboarding/answers';
import { formatNumber } from '@/lib/format';

const today = () => new Date().toISOString().slice(0, 10);

/** Figma "Section opener · sleep". */
export function SleepOpenerStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { next } = useOnboarding();
  return (
    <OnboardingScreen
      progress={progress}
      message={t('sleepOpener.message')}
      actions={<PrimaryButton label={t('letsGo')} onPress={() => next(step)} />}>
      <View className="items-center gap-lg pt-xl">
        <Mascot pose="sleeping" size={220} />
        <View className="rounded-full bg-lavender-100 px-lg py-sm">
          <Text variant="label">{t('sleepOpener.chip')}</Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

/** Figma "Insight · sleep need", with the guideline it comes from. */
export function SleepNeedStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, next } = useOnboarding();
  const need = sleepNeed(answers.birthDate ?? today());
  return (
    <OnboardingScreen
      progress={progress}
      message={t('sleepNeed.message', { baby: answers.babyName })}
      actions={<PrimaryButton label={t('continue')} onPress={() => next(step)} />}>
      <GlassCard>
        <View className="items-center gap-sm p-xl">
          <Text variant="numeral">{t('sleepNeed.hours', { min: formatNumber(need.min), max: formatNumber(need.max) })}</Text>
          <Text className="text-center">{t('sleepNeed.body')}</Text>
          <View className="items-center gap-xs pt-md">
            <Text variant="label" className="text-center">
              {t(`sleepNeed.source.${need.source}.title`)}
            </Text>
            <Text variant="caption" tone="muted" className="text-center">
              {t(`sleepNeed.source.${need.source}.detail`)}
            </Text>
          </View>
        </View>
      </GlassCard>
      <View className="items-center">
        <Mascot pose="sleeping" size={150} />
      </View>
    </OnboardingScreen>
  );
}

/** Figma "Ada's sleep yesterday": hours on a wheel, compared with the age range. Stays on the phone. */
export function SleepYesterdayStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const need = sleepNeed(answers.birthDate ?? today());
  const [hours, setHours] = useState(answers.sleepYesterdayHours ?? Math.round((need.min + need.max) / 2));
  const verdict = hours < need.min ? 'under' : hours > need.max ? 'over' : 'inRange';
  return (
    <OnboardingScreen
      progress={progress}
      message={t('sleepYesterday.message', { baby: answers.babyName })}
      actions={
        <PrimaryButton
          label={t('continue')}
          onPress={() => {
            update({ sleepYesterdayHours: hours });
            next(step, { edit });
          }}
        />
      }>
      <WheelGroup>
        <View className="flex-1" />
        <WheelPicker
          flex={2}
          accessibilityLabel={t('sleepYesterday.label')}
          items={Array.from({ length: 17 }, (_, i) => ({ value: i + 4, label: formatNumber(i + 4) }))}
          value={hours}
          onChange={setHours}
        />
        <View className="flex-1 justify-center">
          <Text variant="heading">{t('sleepYesterday.unit')}</Text>
        </View>
      </WheelGroup>
      <Chip>{t(`sleepYesterday.${verdict}`)}</Chip>
      <Text variant="label" tone="muted" className="text-center">
        {t('sleepYesterday.hint')}
      </Text>
    </OnboardingScreen>
  );
}

const PLACES: { value: NapPlace; icon: IconName; danger?: boolean }[] = [
  { value: 'cot', icon: 'moon-filled' },
  { value: 'contact', icon: 'heart', danger: true },
  { value: 'onTheMove', icon: 'clock' },
  { value: 'changes', icon: 'star' },
];

/** Figma "Where Ada naps". Stays on the phone. */
export function NapPlaceStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  return (
    <OnboardingScreen
      progress={progress}
      message={t('napPlace.message', { baby: answers.babyName })}
      actions={<PrimaryButton label={t('continue')} disabled={!answers.napPlace} onPress={() => next(step, { edit })} />}>
      <View accessibilityRole="radiogroup" className="gap-sm">
        {PLACES.map((option) => (
          <SelectRow
            key={option.value}
            icon={option.icon}
            iconTone={option.danger ? 'danger' : 'default'}
            title={t(`napPlace.${option.value}.title`)}
            subtitle={t(`napPlace.${option.value}.subtitle`)}
            selected={answers.napPlace === option.value}
            onPress={() => update({ napPlace: option.value })}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
