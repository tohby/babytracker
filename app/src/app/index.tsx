import { Redirect } from 'expo-router';

import { useSession } from '@/hooks/use-session';

/**
 * "/" is a signpost, never protected: Home when signed in, onboarding when that isn't finished,
 * Welcome (sign-in) when signed out.
 * Home and Welcome have their own paths, so when the session changes and a guard closes the
 * current screen, the router lands here and is sent on, never back and forth.
 */
export default function Entry() {
  const { status, user } = useSession();
  if (status === 'loading') return null; // The splash covers this.
  if (status !== 'signedIn') return <Redirect href="/welcome" />;
  return <Redirect href={user && !user.onboarding.completed ? '/onboarding' : '/today'} />;
}
