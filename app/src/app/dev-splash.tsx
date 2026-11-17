import { Redirect, useLocalSearchParams } from 'expo-router';

import { BrandSplash, type SplashStatus } from '@/components/splash/brand-splash';

const STATES: SplashStatus[] = ['loading', 'slow', 'offline', 'error'];

/**
 * Development-only preview of the splash states: nappa://dev-splash?state=offline
 * Production builds redirect to Home.
 */
export default function DevSplashPreview() {
  const { state } = useLocalSearchParams<{ state?: string }>();
  if (!__DEV__) return <Redirect href="/" />;
  const status = STATES.find((s) => s === state) ?? 'loading';
  return <BrandSplash status={status} onRetry={() => {}} />;
}
