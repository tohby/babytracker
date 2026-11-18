import { Redirect, useLocalSearchParams } from 'expo-router';
import type { ComponentType } from 'react';

import { BirthdayStep, FeedingStep, GetToKnowStep, HardestStep } from '@/components/onboarding/steps/basics';
import { CarersStep, WeightStep } from '@/components/onboarding/steps/growth';
import { BabyNameStep, ParentNameStep, RewardStep } from '@/components/onboarding/steps/meet';
import { GlanceStep, PersonalisingStep, PlanRevealStep, RhythmStep } from '@/components/onboarding/steps/plan';
import { RemindersStep, ReminderTimingStep, WakeTimeStep, WakeWindowsStep } from '@/components/onboarding/steps/routine';
import { NapPlaceStep, SleepNeedStep, SleepOpenerStep, SleepYesterdayStep } from '@/components/onboarding/steps/sleep';
import type { StepProps } from '@/components/onboarding/steps/types';
import { FIRST_STEP, isStepId, progressOf, type StepId } from '@/lib/onboarding/steps';

const SCREENS: Record<StepId, ComponentType<StepProps>> = {
  'baby-name': BabyNameStep,
  'parent-name': ParentNameStep,
  reward: RewardStep,
  'get-to-know': GetToKnowStep,
  birthday: BirthdayStep,
  feeding: FeedingStep,
  hardest: HardestStep,
  'wake-time': WakeTimeStep,
  'wake-windows': WakeWindowsStep,
  reminders: RemindersStep,
  'reminder-timing': ReminderTimingStep,
  'sleep-opener': SleepOpenerStep,
  'sleep-need': SleepNeedStep,
  'sleep-yesterday': SleepYesterdayStep,
  'nap-place': NapPlaceStep,
  weight: WeightStep,
  carers: CarersStep,
  glance: GlanceStep,
  personalising: PersonalisingStep,
  'plan-reveal': PlanRevealStep,
  rhythm: RhythmStep,
};

/** One onboarding step, e.g. /onboarding/birthday. `?edit=1` comes back to "at a glance" after. */
export default function OnboardingStep() {
  const { step, edit } = useLocalSearchParams<{ step: string; edit?: string }>();
  if (!isStepId(step)) return <Redirect href={{ pathname: '/onboarding/[step]', params: { step: FIRST_STEP } }} />;
  const Screen = SCREENS[step];
  return <Screen key={step} step={step} edit={edit === '1'} progress={progressOf(step)} />;
}
