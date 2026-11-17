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
      <ThemedNavigation />
    </ThemeModeProvider>
  );
}

/** Inside the provider, so it reads the restored theme on its first render. */
function ThemedNavigation() {
  const { theme } = useUniwind();
  const colors = useThemeColors();
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
        text: colors['text/primary'],
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
        {/* Native bottom sheet (Figma `Sheet/Bottom`): sized to its content, 36px top corners, grabber. */}
        <Stack.Screen name="appearance" options={sheetOptions} />
        {/* Home gear shortcut: Light / Dark / Auto + Cancel, same setting as the Appearance sheet. */}
        <Stack.Screen name="theme-menu" options={sheetOptions} />
      </Stack>
      {/* Fonts and the saved theme are ready by the time this renders, so the app is ready now.
          Add the session check here when it exists, and pass `problem` for offline / error. */}
      <AppSplash ready />
    </ThemeProvider>
  );
}
