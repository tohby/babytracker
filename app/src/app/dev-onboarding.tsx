import { Redirect, useLocalSearchParams } from 'expo-router';

import { OnboardingProvider } from '@/hooks/use-onboarding';
import type { OnboardingAnswers } from '@/lib/onboarding/answers';
import { isStepId } from '@/lib/onboarding/steps';

import OnboardingStep from './onboarding/[step]';

const SAMPLE: Partial<OnboardingAnswers> = {
  babyName: 'Ada',
  parentName: 'Tuki',
  birthDate: '2026-07-20',
  feeding: 'breast_milk',
  hardest: ['shortNaps', 'nightWakings'],
  wakeTime: '07:30',
  napPlace: 'cot',
  weightGrams: 6200,
  carers: ['partner', 'grandparents'],
};

/**
 * Development-only preview of one onboarding step with sample answers:
 * nappa://dev-onboarding?step=birthday. Nothing is saved. Production builds redirect to Home.
 */
export default function DevOnboardingPreview() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <OnboardingProvider sample={SAMPLE}>
      {isStepId(step) ? <OnboardingStep /> : null}
    </OnboardingProvider>
  );
}
