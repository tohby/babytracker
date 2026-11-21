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
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { EmailAuth } from '@/components/auth/email-auth';
import { QuickUnlockGate, QuickUnlockSetup } from '@/components/unlock/quick-unlock';
import { AppSplash } from '@/components/splash/app-splash';
import { TALL_SHEET_DETENT } from '@/components/ui/bottom-sheet';
import { ToastProvider } from '@/components/ui/toast';
import { Radius } from '@/constants/theme';
import { LogStoreProvider, useLogStore } from '@/data/log-store';
import { TimelineFilterProvider } from '@/data/timeline-filter';
import { FormatPrefsProvider } from '@/hooks/use-format-prefs';
import { useQuickUnlock } from '@/hooks/use-quick-unlock';
import { SessionProvider, useSession } from '@/hooks/use-session';
import { ThemeModeProvider } from '@/hooks/use-theme-mode';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useDeviceLocaleSync } from '@/i18n';
import { isDevPreviewUser } from '@/lib/dev-preview';
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
  const { status, offline, user, account, signOut } = useSession();
  const insets = useSafeAreaInsets();
  const signedIn = status === 'signedIn';
  const accountEmail = signedIn ? user?.email ?? account?.email ?? null : null;
  const unlock = useQuickUnlock(accountEmail);
  const [recoveringAccount, setRecoveringAccount] = useState<string | null>(null);
  const needsGate = signedIn && !isDevPreviewUser(user) && unlock.phase !== 'unlocked' && unlock.phase !== 'unsupported';
  const signedInReady = signedIn && !needsGate;
  const firstName = (user?.name ?? account?.name)?.trim().split(/\s+/)[0];

  // Offline at launch there's no user yet: go to the app rather than restart onboarding.
  const onboarded = user?.onboarding.completed ?? true;
  // Navigation chrome (screen background behind transitions, headers) uses Nappa tokens.
  const navigationTheme = useMemo(() => {
    const base = theme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors['color/primary/default'],
        background: colors['color/background/canvas'],
        card: colors['color/background/surface'],
        text: colors['color/text/primary'],
        border: colors['color/border/default'],
        notification: colors['color/accent/notification'],
      },
    };
  }, [theme, colors]);

  // Figma `Bottom sheet`: native form sheet, radius 2xl (32), grabber, `background/surface-raised`.
  // Compact fits its content; Tall goes up to 92% of the screen.
  const sheetOptions = {
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
    sheetCornerRadius: Radius['2xl'],
    contentStyle: { backgroundColor: colors['color/background/surface-raised'] },
  } as const;
  const tallSheetOptions = { ...sheetOptions, sheetAllowedDetents: [TALL_SHEET_DETENT] };

  return (
    <ThemeProvider value={navigationTheme}>
      <FormatPrefsProvider>
      <LogStoreProvider key={signedIn ? (user?.email ?? account?.email)?.trim().toLowerCase() ?? 'unknown' : 'signed-out'} loggedBy={user?.name ?? account?.name ?? user?.email ?? ''} account={signedIn ? (user?.email ?? account?.email)?.trim().toLowerCase() ?? null : null}>
      <TimelineFilterProvider>
      {/* Toasts sit above the tab bar (64 + 8 above the home indicator, plus 12). */}
      <ToastProvider bottomOffset={insets.bottom + 84}>
      {/* Follows the app theme (set natively by Uniwind), not the device setting. */}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {needsGate ? (
        unlock.phase === 'loading' && accountEmail ? null : unlock.phase === 'unconfigured' ? (
          <QuickUnlockSetup controller={unlock} onBack={() => void signOut()} />
        ) : accountEmail && recoveringAccount === accountEmail ? (
          <EmailAuth
            initialIntent="sign_in"
            onBack={() => setRecoveringAccount(null)}
            recovery={{ email: accountEmail, requireNewPin: unlock.requireNewPin, done: () => setRecoveringAccount(null) }}
          />
        ) : (
          <QuickUnlockGate controller={unlock} displayName={firstName} onRecover={() => {
            if (accountEmail) setRecoveringAccount(accountEmail);
            else void signOut();
          }} />
        )
      ) : <Stack screenOptions={{ headerShown: false }}>
        {/* "/" redirects to Home or Welcome. First and unprotected, so it's where the router goes
            when a guard closes the screen that was open (sign-in succeeded, session ended). */}
        <Stack.Screen name="index" />
        {/* Signed in and onboarded: the app. When the session ends, these close and sign-in opens. */}
        <Stack.Protected guard={signedInReady && onboarded}>
          <Stack.Screen name="(tabs)" />
          {/* Logging: one entry point, sheets keep context (Figma D). Timers are full screens. */}
          <Stack.Screen name="log/index" options={tallSheetOptions} />
          {(['nap', 'feed', 'pumping', 'solids', 'medicine', 'growth', 'activity'] as const).map((name) => (
            <Stack.Screen key={name} name={`log/${name}`} options={tallSheetOptions} />
          ))}
          <Stack.Screen name="log/nappy" options={sheetOptions} />
          <Stack.Screen name="log/saved" options={sheetOptions} />
          <Stack.Screen name="timeline-filter" options={sheetOptions} />
          <Stack.Screen name="still-learning" options={tallSheetOptions} />
          <Stack.Screen name="family/invite" options={tallSheetOptions} />
          <Stack.Screen name="child-switcher" options={sheetOptions} />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="explore" />
          {/* Native bottom sheet (Figma `Sheet/Bottom`): sized to its content, 36px top corners, grabber. */}
          <Stack.Screen name="appearance" options={sheetOptions} />
          {/* Home shortcut: the same Appearance sheet as Settings. */}
          <Stack.Screen name="theme-menu" options={sheetOptions} />
          {(['entry/[id]', 'entry/edit', 'growth', 'log/nursing', 'log/pumping-timer', 'log/sleep-timer',
            'next-nap', 'next-nap-why', 'next-nap-sources', 'plus', 'plus-done', 'settings/delete-account',
            'settings/export', 'settings/language', 'settings/notifications', 'sync'] as const).map((name) => (
            <Stack.Screen key={name} name={name} />
          ))}
        </Stack.Protected>
        {/* Signed in, onboarding not finished: the onboarding questions. */}
        <Stack.Protected guard={signedInReady && !onboarded}>
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        {/* Signed out: Welcome back (password only) or Sign in, plus sign-up and forgot password. */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="dev-components" />
          <Stack.Screen name="dev-onboarding" />
          <Stack.Screen name="dev-splash" />
        </Stack.Protected>
      </Stack>}
      {/* Fonts and the saved theme are ready by now; the splash stays until the saved session is
          checked. Offline at launch: the session is kept and the splash says so before hiding. */}
      </ToastProvider>
      </TimelineFilterProvider>
      <LogReadySplash sessionReady={status !== 'loading' && !(needsGate && unlock.phase === 'loading' && accountEmail)} signedIn={signedIn} offline={offline} />
      </LogStoreProvider>
      </FormatPrefsProvider>
    </ThemeProvider>
  );
}

function LogReadySplash({ sessionReady, signedIn, offline }: { sessionReady: boolean; signedIn: boolean; offline: boolean }) {
  const { ready } = useLogStore();
  return <AppSplash ready={sessionReady && (!signedIn || ready)} problem={offline ? 'offline' : undefined} />;
}
