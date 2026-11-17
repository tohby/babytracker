import { SignInScreen } from '@/components/auth/sign-in-screen';
import { WelcomeBackScreen } from '@/components/auth/welcome-back-screen';
import { useSession } from '@/hooks/use-session';

/**
 * Where the app opens when signed out ("/" while the app's own Home is protected): Welcome back
 * (password only) when this phone remembers an account, the email form otherwise.
 */
export default function SignedOutEntry() {
  const { account } = useSession();
  return account ? <WelcomeBackScreen /> : <SignInScreen />;
}
