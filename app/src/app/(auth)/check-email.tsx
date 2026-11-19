import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { useCountdown } from '@/hooks/use-countdown';
import { useSession } from '@/hooks/use-session';
import { authApi } from '@/lib/auth/endpoints';
import { formatCountdown } from '@/lib/format';

const RESEND_AFTER_MS = 60_000;

/** Figma E2: the reset link is on its way. The new password is set on the web page the link opens. */
export default function CheckEmailScreen() {
  const { t } = useTranslation('auth');
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { account } = useSession();
  const [resendAt, setResendAt] = useState(() => Date.now() + RESEND_AFTER_MS);
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const wait = useCountdown(resendAt);

  async function resend() {
    setProblem(null);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      setResendAt(Date.now() + RESEND_AFTER_MS);
    } catch (error) {
      const next = toAuthProblem(error);
      if (next.kind === 'tooManyRequests') setResendAt(next.until);
      setProblem(next);
    }
  }

  return (
    <AuthScreen
      canGoBack
      hero="awake"
      title={t('checkEmail.title')}
      subtitle={t('checkEmail.body', { email })}
      actions={
        <>
          <Button label={t('checkEmail.backToSignIn')} onPress={() => router.dismissTo(account ? '/welcome' : '/sign-in')} />
          <Button hierarchy="tertiary" size="medium"
            label={wait > 0 ? t('checkEmail.resendIn', { time: formatCountdown(wait) }) : t('checkEmail.resend')}
            disabled={wait > 0}
            onPress={resend}
          />
        </>
      }>
      {problem?.kind === 'offline' ? (
        <StatusBanner type="offline" title={t('errors.offline.title')} detail={t('errors.offline.detail')} />
      ) : problem?.kind === 'tooManyRequests' ? (
        <StatusBanner type="locked" title={t('errors.tooManyRequests.title')} detail={t('errors.tooManyRequests.detail')} />
      ) : problem ? (
        <StatusBanner type="error" title={t('errors.generic.title')} detail={t('errors.generic.detail')} />
      ) : sent ? (
        <StatusBanner type="info" title={t('checkEmail.resent.title')} detail={t('checkEmail.resent.detail')} />
      ) : null}
    </AuthScreen>
  );
}
