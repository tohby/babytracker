import { Redirect, useLocalSearchParams } from 'expo-router';

import { firstLaunchHome, HomeView } from '@/components/home/home-view';
import { nextNapFromRhythm } from '@/data/home';
import { useNow } from '@/hooks/use-now';

/**
 * Development-only preview of Home with a sample baby: nappa://dev-home (or ?state=loading).
 * Production builds redirect to Home.
 */
export default function DevHomePreview() {
  const { state } = useLocalSearchParams<{ state?: string }>();
  const now = useNow();
  if (!__DEV__) return <Redirect href="/" />;
  const home = firstLaunchHome({
    babyName: state === 'loading' ? '' : 'Ada',
    user: { name: 'Tuki' },
    nextNap: nextNapFromRhythm('2026-07-20', '07:30', new Date(now)),
  });
  return <HomeView home={home} loading={state === 'loading'} now={now} />;
}
