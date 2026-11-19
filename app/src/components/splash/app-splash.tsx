import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { BrandSplash, type SplashStatus } from '@/components/splash/brand-splash';

/** Keep the brand splash up at least this long so it reads as a moment, not a flicker. */
const MIN_VISIBLE_MS = 600;
/** After this long without being ready, say so ("Taking a little longer…"). */
const SLOW_AFTER_MS = 5_000;
const FADE_OUT_MS = 300;

type AppSplashProps = {
  /** True once everything the first screen needs is ready. */
  ready: boolean;
  /**
   * A startup problem to show instead of the spinner. Nothing reports one yet: today the app only waits for
   * fonts and the saved theme, which are local. Wire this to the first network step (e.g. the session check).
   * - `offline`: no connection; the app can continue with what's on the phone, so the splash still hides when ready.
   * - `error`: startup failed; the splash stays up with a "Try again" button that calls `onRetry`.
   */
  problem?: 'offline' | 'error';
  onRetry?: () => void;
};

/**
 * Hands over from the native launch screen (the Peach close-up app icon on the canvas colour, set in app.json) to the
 * brand splash, then fades out when the app is ready.
 */
export function AppSplash({ ready, problem, onRetry }: AppSplashProps) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(slowTimer);
    };
  }, []);

  // Derived, not stored: hide once ready and shown long enough, unless startup failed.
  if (ready && minElapsed && problem !== 'error') return null;

  const status: SplashStatus = problem ?? (slow && !ready ? 'slow' : 'loading');

  return (
    <Animated.View
      exiting={FadeOut.duration(FADE_OUT_MS)}
      style={styles.overlay}
      // The native launch screen hides once this first frame is on screen, so there is no blank gap.
      onLayout={() => SplashScreen.hide()}>
      <BrandSplash status={status} onRetry={onRetry} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 1000 },
});
