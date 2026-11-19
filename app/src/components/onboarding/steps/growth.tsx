import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectRow } from '@/components/onboarding/select-row';
import type { StepProps } from '@/components/onboarding/steps/types';
import { WheelGroup, WheelPicker } from '@/components/onboarding/wheel-picker';
import { type IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/hooks/use-onboarding';
import type { Carer, WeightUnit } from '@/lib/onboarding/answers';
import { formatNumber } from '@/lib/format';

const G_PER_LB = 453.592;
/** Tenths of a kilogram or pound, so the wheel steps by 0.1. */
const RANGE: Record<WeightUnit, [number, number]> = { kg: [15, 250], lb: [30, 550] };
const toTenths = (grams: number, unit: WeightUnit) => Math.round((unit === 'kg' ? grams / 1000 : grams / G_PER_LB) * 10);
const toGrams = (tenths: number, unit: WeightUnit) => Math.round(unit === 'kg' ? tenths * 100 : (tenths / 10) * G_PER_LB);

/** Figma "Weight wheel": kg or lb, 0.1 steps, skippable. Stays on the phone until growth tracking exists. */
export function WeightStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const [unit, setUnit] = useState<WeightUnit>(answers.weightUnit);
  const [grams, setGrams] = useState(answers.weightGrams ?? 6000);
  const [lo, hi] = RANGE[unit];
  const tenths = Math.min(hi, Math.max(lo, toTenths(grams, unit)));

  return (
    <OnboardingScreen
      progress={progress}
      message={t('weight.message', { baby: answers.babyName })}
      actions={
        <>
          <Button
            label={t('continue')}
            onPress={() => {
              update({ weightGrams: toGrams(tenths, unit), weightUnit: unit });
              next(step, { edit });
            }}
          />
          <Button hierarchy="tertiary" size="medium"
            label={t('skip')}
            onPress={() => {
              update({ weightGrams: null, weightUnit: unit });
              next(step, { edit });
            }}
          />
        </>
      }>
      <WheelGroup>
        <View className="flex-1" />
        <WheelPicker
          flex={2}
          accessibilityLabel={t('weight.label')}
          items={Array.from({ length: hi - lo + 1 }, (_, i) => ({
            value: lo + i,
            label: formatNumber((lo + i) / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          }))}
          value={tenths}
          onChange={(v) => setGrams(toGrams(v, unit))}
        />
        <View className="flex-1" />
      </WheelGroup>
      <View accessibilityRole="radiogroup" className="flex-row self-center rounded-full bg-feature-feed p-xs">
        {(['kg', 'lb'] as const).map((u) => (
          <Pressable
            key={u}
            accessibilityRole="radio"
            accessibilityState={{ selected: unit === u, checked: unit === u }}
            onPress={() => setUnit(u)}
            className={`min-h-[44px] min-w-[72px] items-center justify-center rounded-full px-lg ${unit === u ? 'bg-background-surface' : ''}`}>
            <Text variant="label-large">{t(`weight.${u}`)}</Text>
          </Pressable>
        ))}
      </View>
      <Text variant="label-large" tone="secondary" className="text-center">
        {t('weight.hint')}
      </Text>
    </OnboardingScreen>
  );
}

const CARERS: { value: Carer; icon: IconName; danger?: boolean }[] = [
  { value: 'partner', icon: 'heart', danger: true },
  { value: 'grandparents', icon: 'star' },
  { value: 'nanny', icon: 'bell' },
  { value: 'justMe', icon: 'home' },
];

/**
 * Figma "Who else cares for Ada". Stays on the phone; inviting people comes with caregivers (M4).
 * "Just me for now" clears the others, and picking someone clears "Just me".
 */
export function CarersStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const toggle = (value: Carer) => {
    if (value === 'justMe') return update({ carers: answers.carers.includes('justMe') ? [] : ['justMe'] });
    const others = answers.carers.filter((c) => c !== 'justMe');
    update({ carers: others.includes(value) ? others.filter((c) => c !== value) : [...others, value] });
  };
  const count = answers.carers.length;
  return (
    <OnboardingScreen
      progress={progress}
      message={t('carers.message', { baby: answers.babyName })}
      actions={
        <Button
          label={count ? t('continueCount', { count }) : t('continue')}
          disabled={!count}
          onPress={() => next(step, { edit })}
        />
      }>
      <View className="gap-sm">
        {CARERS.map((option) => (
          <SelectRow
            key={option.value}
            multi
            icon={option.icon}
            iconTone={option.danger ? 'danger' : 'default'}
            title={t(`carers.${option.value}.title`)}
            subtitle={t(`carers.${option.value}.subtitle`)}
            selected={answers.carers.includes(option.value)}
            onPress={() => toggle(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
