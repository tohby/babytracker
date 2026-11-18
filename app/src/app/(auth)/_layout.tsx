import { Stack } from 'expo-router';

import { useSession } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme-colors';

/**
 * Signed-out screens (Figma "Sign in" page). The entry screen (welcome) is Welcome back when this phone
 * remembers an account, so the app opens on "password only"; otherwise it's the first-launch hook.
 */
export default function AuthLayout() {
  const { account } = useSession();
  const colors = useThemeColors();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome back, or the first-launch hook, depending on `account`. */}
      <Stack.Screen name="welcome" />
      <Stack.Screen name="promise" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="check-email" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="verify-email" />
      <Stack.Protected guard={account !== null}>
        {/* Figma J1: "Sign in with another account?" confirm sheet. */}
        <Stack.Screen
          name="forget-account"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 36,
            contentStyle: { backgroundColor: colors.white },
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
