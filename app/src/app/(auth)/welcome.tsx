import { IntroScreen } from '@/components/auth/intro-screen';
import { WelcomeBackScreen } from '@/components/auth/welcome-back-screen';
import { useSession } from '@/hooks/use-session';

/**
 * Where the app opens when signed out: Welcome back (password only) when this phone remembers an
 * account, otherwise the first-launch hook ("Hi, I'm Nappa") that leads to sign-up.
 */
export default function SignedOutEntry() {
  const { account } = useSession();
  return account ? <WelcomeBackScreen /> : <IntroScreen />;
}
