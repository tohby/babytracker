import { router } from 'expo-router';

import { IntroScreen } from '@/components/auth/intro-screen';

export default function Welcome() {
  return <IntroScreen onCreate={() => router.push('/create-account')} onLogin={() => router.push('/sign-in')} />;
}
