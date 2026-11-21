import { router } from 'expo-router';

import { EmailAuth } from '@/components/auth/email-auth';

export default function CreateAccount() {
  return <EmailAuth initialIntent="create_account" onBack={() => router.canGoBack() ? router.back() : router.replace('/welcome')} />;
}
