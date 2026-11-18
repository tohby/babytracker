import { Redirect } from 'expo-router';

import { useOnboarding } from '@/hooks/use-onboarding';

/** Resume at the step the user last reached. */
export default function OnboardingStart() {
  const { resumeStep } = useOnboarding();
  return <Redirect href={{ pathname: '/onboarding/[step]', params: { step: resumeStep } }} />;
}
