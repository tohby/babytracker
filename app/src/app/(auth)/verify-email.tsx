import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { AuthScreen } from '@/components/auth/auth-screen';
import { CodeInput } from '@/components/auth/code-input';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { useCountdown } from '@/hooks/use-countdown';
import { useSession } from '@/hooks/use-session';
import { authApi } from '@/lib/auth/endpoints';
import { formatCountdown } from '@/lib/format';

const RESEND_AFTER_MS = 60_000;

/** Sign-up step 2: the 6-digit email code. The right code creates the account and signs in. */
export default function VerifyEmailScreen() {
  const { t } = useTranslation('auth');
  const { verifyEmail } = useSession();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const [resent, setResent] = useState(false);
  const [resendAt, setResendAt] = useState(() => Date.now() + RESEND_AFTER_MS);
  const wait = useCountdown(resendAt);

  async function submit(value = code) {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    setProblem(null);
    setResent(false);
    try {
      await verifyEmail(email, value);
      // Signed in: the root layout's guard moves to the app.
    } catch (error) {
      setProblem(toAuthProblem(error));
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setProblem(null);
    try {
      await authApi.resendCode(email);
      setResent(true);
      setCode('');
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
      hero="standing"
      title={t('verify.title')}
      subtitle={t('verify.subtitle', { email })}
      actions={
        <>
          <Button label={t('verify.submit')} onPress={() => submit()} loading={loading} disabled={code.length !== 6} />
          <Button hierarchy="tertiary" size="medium"
            label={wait > 0 ? t('verify.resendIn', { time: formatCountdown(wait) }) : t('verify.resend')}
            disabled={wait > 0}
            onPress={resend}
          />
          <Button hierarchy="tertiary" size="medium" label={t('verify.wrongEmail')} onPress={() => router.back()} />
        </>
      }>
      {problem?.kind === 'invalidCode' ? (
        <StatusBanner type="error" title={t('verify.invalid.title')} detail={t('verify.invalid.detail')} />
      ) : problem?.kind === 'offline' ? (
        <StatusBanner type="offline" title={t('errors.offline.title')} detail={t('errors.offline.detail')} />
      ) : problem?.kind === 'tooManyRequests' || problem?.kind === 'locked' ? (
        <StatusBanner type="locked" title={t('errors.tooManyRequests.title')} detail={t('errors.tooManyRequests.detail')} />
      ) : problem ? (
        <StatusBanner type="error" title={t('errors.generic.title')} detail={t('errors.generic.detail')} />
      ) : resent ? (
        <StatusBanner type="info" title={t('verify.resent.title')} detail={t('verify.resent.detail')} />
      ) : null}
      <CodeInput
        value={code}
        onChange={(next) => {
          setCode(next);
          if (next.length === 6) submit(next);
        }}
        error={problem?.kind === 'invalidCode'}
        disabled={loading}
        accessibilityLabel={t('verify.codeLabel')}
      />
    </AuthScreen>
  );
}
