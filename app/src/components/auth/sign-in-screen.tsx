import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EMAIL_PATTERN, toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { Text } from '@/components/ui/text';
import { TextField, type TextFieldRef } from '@/components/ui/text-field';
import { useCountdown } from '@/hooks/use-countdown';
import { useSession } from '@/hooks/use-session';
import { formatCountdown } from '@/lib/format';

/**
 * Email + password (Figma A1–A5, D1, J2; locked and offline states from F1 and H1).
 * Shown on a phone with no remembered account, or after "Not you?".
 */
export function SignInScreen({ canGoBack = false }: { canGoBack?: boolean }) {
  const { t } = useTranslation('auth');
  const { signIn, account } = useSession();
  const passwordRef = useRef<TextFieldRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  const lockedSeconds = useCountdown(problem?.kind === 'locked' || problem?.kind === 'tooManyRequests' ? problem.until : null);
  const locked = (problem?.kind === 'locked' || problem?.kind === 'tooManyRequests') && lockedSeconds > 0;
  const offline = problem?.kind === 'offline';

  const emailError = !checked
    ? undefined
    : !email.trim()
      ? t('validation.emailRequired')
      : !EMAIL_PATTERN.test(email.trim())
        ? t('validation.emailInvalid')
        : undefined;
  const passwordError = checked && !password ? t('validation.passwordRequired') : undefined;

  async function submit() {
    setChecked(true);
    if (!email.trim() || !EMAIL_PATTERN.test(email.trim()) || !password) return;
    setLoading(true);
    setProblem(null);
    try {
      await signIn(email, password);
      // The signed-in guard in the root layout takes over from here.
    } catch (error) {
      setProblem(toAuthProblem(error));
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
    <StatusBanner type="error" title={t('errors.invalidCredentials.title')} detail={t('errors.invalidCredentials.detail')} />
  ) : problem?.kind === 'generic' || problem?.kind === 'validation' ? (
    <StatusBanner type="error" title={t('errors.generic.title')} detail={t('errors.generic.detail')} />
  ) : null;

  const title = locked ? t('errors.locked.screenTitle') : offline ? t('errors.offline.screenTitle') : t('signIn.title');

  return (
    <AuthScreen
      hero={locked ? 'sleeping' : offline ? 'thinking' : 'icon'}
      title={title}
      canGoBack={canGoBack}
      subtitle={locked || offline || problem ? undefined : t('signIn.subtitle')}
      actions={
        <>
          <Button
            label={locked ? t('errors.tryAgainIn', { time: formatCountdown(lockedSeconds) }) : offline ? t('errors.tryAgain') : t('signIn.submit')}
            onPress={submit}
            loading={loading}
            disabled={locked || (!email && !password)}
          />
          {locked ? (
            <Button hierarchy="tertiary" size="medium" label={t('errors.resetInstead')} onPress={() => router.push({ pathname: '/forgot-password', params: { email } })} />
          ) : account ? null : (
            <View className="flex-row flex-wrap items-center justify-center">
              <Text variant="label-large">{t('signIn.newHere')}</Text>
              <Button hierarchy="tertiary" size="medium" label={t('signIn.createAccount')} onPress={() => router.push('/create-account')} />
            </View>
          )}
        </>
      }>
      {banner}
      <View className="gap-lg">
        <TextField
          label={t('fields.email')}
          leadingIcon="mail"
          placeholder={t('fields.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          disabled={locked || loading}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={passwordRef}
          label={t('fields.password')}
          leadingIcon="lock"
          placeholder={t('fields.passwordPlaceholder')}
          secure
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          invalid={problem?.kind === 'invalidCredentials'}
          disabled={locked || loading}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {locked ? null : (
          <View className="items-end">
            <Button hierarchy="tertiary" size="medium" label={t('signIn.forgot')} onPress={() => router.push({ pathname: '/forgot-password', params: { email } })} />
          </View>
        )}
      </View>
    </AuthScreen>
  );
}
