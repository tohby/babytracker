import '@/global.css';

import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useUniwind } from 'uniwind';

import { AppSplash } from '@/components/splash/app-splash';
import { SessionProvider, useSession } from '@/hooks/use-session';
import { ThemeModeProvider } from '@/hooks/use-theme-mode';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useDeviceLocaleSync } from '@/i18n';
import { logIntlSupport } from '@/lib/format';

SplashScreen.preventAutoHideAsync();
// iOS: cross-fade from the native launch screen into the brand splash.
SplashScreen.setOptions({ fade: true, duration: 300 });
logIntlSupport();

export default function RootLayout() {
  useDeviceLocaleSync();
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

  // Keep the splash screen up until the fonts are ready. ThemeModeProvider then holds it
  // until the saved Light / Dark / Auto choice is restored, so the wrong theme never flashes.
  if (!fontsLoaded) return null;

  return (
    <ThemeModeProvider>
      <SessionProvider>
        <ThemedNavigation />
      </SessionProvider>
    </ThemeModeProvider>
  );
}

/** Inside the provider, so it reads the restored theme on its first render. */
function ThemedNavigation() {
  const { theme } = useUniwind();
  const colors = useThemeColors();
  const { status, offline, user } = useSession();
  const signedIn = status === 'signedIn';
  // Offline at launch there's no user yet: go to the app rather than restart onboarding.
  const onboarded = user?.onboarding.completed ?? true;
  // Navigation chrome (screen background behind transitions, headers) uses Nappa tokens.
  const navigationTheme = useMemo(() => {
    const base = theme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors['accent/primary'],
        background: colors['bg/gradient-top'],
        card: colors['cream/50'],
        text: colors['color/text/primary'],
        border: colors['glass/stroke'],
        notification: colors['accent/primary'],
      },
    };
  }, [theme, colors]);

  const sheetOptions = {
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
    sheetCornerRadius: 36,
    contentStyle: { backgroundColor: colors.white },
  } as const;

  return (
    <ThemeProvider value={navigationTheme}>
      {/* Follows the app theme (set natively by Uniwind), not the device setting. */}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        {/* "/" redirects to Home or Welcome. First and unprotected, so it's where the router goes
            when a guard closes the screen that was open (sign-in succeeded, session ended). */}
        <Stack.Screen name="index" />
        {/* Signed in and onboarded: the app. When the session ends, these close and sign-in opens. */}
        <Stack.Protected guard={signedIn && onboarded}>
          <Stack.Screen name="home" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="explore" />
          {/* Native bottom sheet (Figma `Sheet/Bottom`): sized to its content, 36px top corners, grabber. */}
          <Stack.Screen name="appearance" options={sheetOptions} />
          {/* Home shortcut: the same Appearance sheet as Settings. */}
          <Stack.Screen name="theme-menu" options={sheetOptions} />
        </Stack.Protected>
        {/* Signed in, onboarding not finished: the onboarding questions. */}
        <Stack.Protected guard={signedIn && !onboarded}>
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        {/* Signed out: Welcome back (password only) or Sign in, plus sign-up and forgot password. */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {/* Fonts and the saved theme are ready by now; the splash stays until the saved session is
          checked. Offline at launch: the session is kept and the splash says so before hiding. */}
      <AppSplash ready={status !== 'loading'} problem={offline ? 'offline' : undefined} />
    </ThemeProvider>
  );
}
