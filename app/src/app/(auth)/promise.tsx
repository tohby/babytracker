import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthScreen } from '@/components/auth/auth-screen';
import { PrimaryButton } from '@/components/ui/primary-button';

/** Figma "Big promise", the second first-launch screen, then sign-up. */
export default function PromiseScreen() {
  const { t } = useTranslation('onboarding');
  return (
    <AuthScreen
      canGoBack
      hero="sleeping"
      title={t('intro.promise')}
      actions={<PrimaryButton label={t('intro.continue')} onPress={() => router.push('/create-account')} />}
    />
  );
}
