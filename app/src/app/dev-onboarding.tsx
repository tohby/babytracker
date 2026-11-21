import { Redirect, useLocalSearchParams } from 'expo-router';

import { Setup } from '@/components/onboarding/setup';
import { OnboardingProvider } from '@/hooks/use-onboarding';
import type { OnboardingAnswers } from '@/lib/onboarding/answers';
import { isStepId } from '@/lib/onboarding/steps';

const sample: Partial<OnboardingAnswers> = {
  babyName: 'Ada', birthDate: '2026-04-12', guardian: true, feeding: 'breast_milk', carers: ['partner'],
};

export default function DevOnboardingPreview() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  if (!__DEV__ || !isStepId(step)) return <Redirect href="/" />;
  return <OnboardingProvider sample={sample}><Setup key={step} step={step} /></OnboardingProvider>;
}
