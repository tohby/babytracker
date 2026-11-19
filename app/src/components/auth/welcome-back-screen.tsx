import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AccountChip } from '@/components/auth/account-chip';
import { toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { TextField } from '@/components/ui/text-field';
import { useCountdown } from '@/hooks/use-countdown';
import { useSession } from '@/hooks/use-session';
import { formatCountdown } from '@/lib/format';

/**
 * Remembered phone, password only (Figma B1–B2, D2, F1, G1, H1). The phone sends its device id and
 * secret with the password, so there's no email to type.
 */
export function WelcomeBackScreen() {
  const { t } = useTranslation('auth');
  const { account, signInWithPassword, signedOutReason } = useSession();

  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  const lockedSeconds = useCountdown(problem?.kind === 'locked' || problem?.kind === 'tooManyRequests' ? problem.until : null);
  const locked = (problem?.kind === 'locked' || problem?.kind === 'tooManyRequests') && lockedSeconds > 0;
  const offline = problem?.kind === 'offline';

  if (!account) return null; // The layout's guard moves to the email form.

  async function submit() {
    setChecked(true);
    if (!password) return;
    setLoading(true);
    setProblem(null);
    try {
      await signInWithPassword(password);
    } catch (error) {
      const next = toAuthProblem(error);
      // device_revoked: the session forgot the account; the guard shows the email form.
      if (next.kind !== 'deviceForgotten') setProblem(next);
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  const banner = locked ? (
    <StatusBanner type="locked" title={t('errors.locked.title')} detail={t('errors.locked.detail')} />
  ) : offline ? (
    <StatusBanner type="offline" title={t('errors.offline.title')} detail={t('errors.offline.detail')} />
  ) : problem?.kind === 'invalidCredentials' ? (
    <StatusBanner type="error" title={t('errors.wrongPassword.title')} detail={t('errors.wrongPassword.detail')} />
  ) : problem ? (
    <StatusBanner type="error" title={t('errors.generic.title')} detail={t('errors.generic.detail')} />
  ) : signedOutReason === 'expired' ? (
    <StatusBanner type="info" title={t('errors.expired.title')} detail={t('errors.expired.detail')} />
  ) : null;

  const title = locked
    ? t('errors.locked.screenTitle')
    : offline
      ? t('errors.offline.screenTitle')
      : account.name
        ? t('welcomeBack.title', { name: account.name })
        : t('welcomeBack.titleNoName');

  const forgot = () => router.push({ pathname: '/forgot-password', params: { email: account.email } });

  return (
    <AuthScreen
      hero={locked ? 'sleeping' : offline ? 'thinking' : 'icon'}
      title={title}
      actions={
        <>
          <Button
            label={locked ? t('errors.tryAgainIn', { time: formatCountdown(lockedSeconds) }) : offline ? t('errors.tryAgain') : t('signIn.submit')}
            onPress={submit}
            loading={loading}
            disabled={locked || !password}
          />
          {locked ? <Button hierarchy="tertiary" size="medium" label={t('errors.resetInstead')} onPress={forgot} /> : null}
        </>
      }>
      {banner}
      <AccountChip account={account} onNotYou={() => router.push('/forget-account')} />
      <View className="gap-lg">
        <TextField
          label={t('fields.password')}
          leadingIcon="lock"
          placeholder={t('fields.passwordPlaceholder')}
          secure
          value={password}
          onChangeText={setPassword}
          error={checked && !password ? t('validation.passwordRequired') : undefined}
          invalid={problem?.kind === 'invalidCredentials'}
          disabled={locked || loading}
          autoFocus={!locked}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {locked ? null : (
          <View className="items-end">
            <Button hierarchy="tertiary" size="medium" label={t('signIn.forgot')} onPress={forgot} />
          </View>
        )}
      </View>
    </AuthScreen>
  );
}
