import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EMAIL_PATTERN, toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { TextField } from '@/components/ui/text-field';
import { authApi } from '@/lib/auth/endpoints';

/** Figma E1: ask for a reset link. The API answers the same whether or not the email has an account. */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  const emailError = !checked
    ? undefined
    : !email.trim()
      ? t('validation.emailRequired')
      : !EMAIL_PATTERN.test(email.trim())
        ? t('validation.emailInvalid')
        : undefined;

  async function submit() {
    setChecked(true);
    if (!EMAIL_PATTERN.test(email.trim())) return;
    setLoading(true);
    setProblem(null);
    try {
      await authApi.forgotPassword(email.trim());
      router.replace({ pathname: '/check-email', params: { email: email.trim() } });
    } catch (error) {
      setProblem(toAuthProblem(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      canGoBack
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
      actions={<Button label={t('forgot.submit')} onPress={submit} loading={loading} disabled={!email} />}>
      {problem?.kind === 'offline' ? (
        <StatusBanner type="offline" title={t('errors.offline.title')} detail={t('errors.offline.detail')} />
      ) : problem?.kind === 'tooManyRequests' ? (
        <StatusBanner type="locked" title={t('errors.tooManyRequests.title')} detail={t('errors.tooManyRequests.detail')} />
      ) : problem ? (
        <StatusBanner type="error" title={t('errors.generic.title')} detail={t('errors.generic.detail')} />
      ) : null}
      <TextField
        label={t('fields.email')}
        leadingIcon="mail"
        placeholder={t('fields.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        error={emailError}
        disabled={loading}
        autoFocus={!params.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="username"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
    </AuthScreen>
  );
}
