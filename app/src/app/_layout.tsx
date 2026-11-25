import '@/global.css';

import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
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
import { QuickUnlockContext, useQuickUnlock } from '@/hooks/use-quick-unlock';
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
  const { status, offline, user, account, signOut, forgetAccount } = useSession();
  const insets = useSafeAreaInsets();
  const signedIn = status === 'signedIn';
  const accountEmail = signedIn ? user?.email ?? account?.email ?? null : null;
  const unlock = useQuickUnlock(accountEmail);
  // Email verification while locked: `resetPin` (Forgot PIN) or `unlock` (chosen on the lock screen).
  const [recovering, setRecovering] = useState<{ account: string; mode: 'resetPin' | 'unlock'; method: 'code' | 'password' } | null>(null);
  if (recovering && recovering.account !== accountEmail) setRecovering(null);
  const startEmailVerification = (mode: 'resetPin' | 'unlock', method: 'code' | 'password' = 'code') => {
    if (!accountEmail) {
      void signOut();
      return;
    }
    unlock.lock();
    unlock.stopAutomaticPrompt();
    setRecovering({ account: accountEmail, mode, method });
  };
  const recoverPin = () => startEmailVerification('resetPin');
  // Signs this account out and forgets it on the phone (tokens, device, PIN and biometric key);
  // its logs stay scoped to it and only load again after that email is verified.
  const switchAccount = () => forgetAccount({ switching: true });
  const previewSkipsSetup = isDevPreviewUser(user) && unlock.phase === 'unconfigured' && !unlock.setupRequired;
  const needsGate = signedIn && !previewSkipsSetup && unlock.phase !== 'unlocked' && unlock.phase !== 'unsupported';
  const signedInReady = signedIn && !needsGate;
  const protectSnapshot = signedIn && unlock.pinEnabled;
  useEffect(() => {
    if (!protectSnapshot) return;
    if (Platform.OS === 'ios') {
      void ScreenCapture.enableAppSwitcherProtectionAsync(1).catch(() => {});
      return () => { void ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {}); };
    }
    if (Platform.OS === 'android') {
      void ScreenCapture.preventScreenCaptureAsync('app-lock').catch(() => {});
      return () => { void ScreenCapture.allowScreenCaptureAsync('app-lock').catch(() => {}); };
    }
  }, [protectSnapshot]);

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
      <ToastProvider key={needsGate ? 'locked' : accountEmail ?? 'signed-out'} bottomOffset={insets.bottom + 84}>
      {/* Follows the app theme (set natively by Uniwind), not the device setting. */}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <QuickUnlockContext.Provider value={{ ...unlock, recoverPin }}>
      {needsGate ? (
        unlock.phase === 'loading' && accountEmail ? null : unlock.phase === 'unconfigured' ? (
          <QuickUnlockSetup controller={unlock} onBack={() => void signOut()} />
        ) : accountEmail && recovering?.account === accountEmail ? (
          <EmailAuth
            key={`${recovering.mode}-${recovering.method}`}
            initialIntent="sign_in"
            onBack={() => setRecovering(null)}
            recovery={{
              email: accountEmail,
              mode: recovering.mode,
              method: recovering.method,
              beforeSignIn: recovering.mode === 'unlock' ? unlock.unlockWithEmail : unlock.requireNewPin,
              done: () => setRecovering(null),
            }}
          />
        ) : (
          <QuickUnlockGate controller={unlock} onRecover={recoverPin}
            onEmailUnlock={() => startEmailVerification('unlock')}
            onPasswordUnlock={user?.has_password ? () => startEmailVerification('unlock', 'password') : undefined}
            onSwitchAccount={switchAccount} />
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
            'settings/export', 'settings/language', 'settings/notifications', 'settings/password', 'settings/security', 'sync'] as const).map((name) => (
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
      </QuickUnlockContext.Provider>
      {/* Fonts and the saved theme are ready by now; the splash stays until the saved session is
          checked. Offline at launch: the session is kept and the splash says so before hiding. */}
      </ToastProvider>
      {protectSnapshot && signedInReady && unlock.privacyCover && <AppLockCover color={colors['color/background/surface']} />}
      </TimelineFilterProvider>
      <LogReadySplash sessionReady={status !== 'loading' && !(needsGate && unlock.phase === 'loading' && accountEmail)} signedIn={signedIn} offline={offline} />
      </LogStoreProvider>
      </FormatPrefsProvider>
    </ThemeProvider>
  );
}

function AppLockCover({ color }: { color: string }) {
  const cover = <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />;
  if (Platform.OS === 'ios') return <FullWindowOverlay>{cover}</FullWindowOverlay>;
  return cover;
}

function LogReadySplash({ sessionReady, signedIn, offline }: { sessionReady: boolean; signedIn: boolean; offline: boolean }) {
  const { ready } = useLogStore();
  return <AppSplash ready={sessionReady && (!signedIn || ready)} problem={offline ? 'offline' : undefined} />;
}
