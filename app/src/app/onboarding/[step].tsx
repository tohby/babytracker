import { Redirect, useLocalSearchParams } from 'expo-router';

import { Setup } from '@/components/onboarding/setup';
import { useOnboarding } from '@/hooks/use-onboarding';
import { isStepId, stepIndex } from '@/lib/onboarding/steps';

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  const { resumeStep } = useOnboarding();
  if (!isStepId(step) || stepIndex(step) > stepIndex(resumeStep)) {
    return <Redirect href={{ pathname: '/onboarding/[step]', params: { step: resumeStep } }} />;
  }
  return <Setup key={step} step={step} />;
}
