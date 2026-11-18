import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/hooks/use-onboarding';

/** Onboarding questions (Figma "Onboarding screen"), shown after sign-up until finished. */
export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
