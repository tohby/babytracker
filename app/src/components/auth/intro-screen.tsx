import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthScreen } from '@/components/auth/auth-screen';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';

/**
 * Figma "Hook + social proof", without the "Loved by 10,000+ parents" chip until that's true.
 * New here: on to the promise and sign-up. Back again: the email form.
 */
export function IntroScreen() {
  const { t } = useTranslation('onboarding');
  return (
    <AuthScreen
      hero="waving"
      title={t('intro.title')}
      subtitle={t('intro.body')}
      actions={
        <>
          <PrimaryButton label={t('intro.start')} onPress={() => router.push('/promise')} />
          <TextButton label={t('intro.haveAccount')} onPress={() => router.push('/sign-in')} />
        </>
      }
    />
  );
}
