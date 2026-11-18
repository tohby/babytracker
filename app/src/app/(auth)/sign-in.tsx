import { SignInScreen } from '@/components/auth/sign-in-screen';

/** Email + password, reached from the hook ("I already have an account") or "Not you?". */
export default function SignInRoute() {
  return <SignInScreen canGoBack />;
}
