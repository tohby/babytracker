import { router } from 'expo-router';

import { EmailAuth } from '@/components/auth/email-auth';

export default function SignIn() {
  return <EmailAuth initialIntent="sign_in" onBack={() => router.canGoBack() ? router.back() : router.replace('/welcome')} />;
}
