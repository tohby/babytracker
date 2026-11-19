import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { EMAIL_PATTERN, toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { AuthScreen } from '@/components/auth/auth-screen';
import { SelectionControl } from '@/components/ui/selection-control';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { Text } from '@/components/ui/text';
import { TextField, type TextFieldRef } from '@/components/ui/text-field';
import { useSession } from '@/hooks/use-session';
import { getDeviceLocale } from '@/i18n';

/** The server enforces the full password policy; this catches the minimum length early. */
const MIN_PASSWORD = 8;

/**
 * Sign-up step 1: email, password and health-data consent. Not designed in Figma yet; built in the
 * Sign in style. The API always answers "code sent", so this screen can't reveal existing accounts.
 */
export default function CreateAccountScreen() {
  const { t } = useTranslation('auth');
  const { register } = useSession();
  const passwordRef = useRef<TextFieldRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  const serverFields = problem?.kind === 'validation' ? problem.fields : {};
  const emailError = checked
    ? !email.trim()
      ? t('validation.emailRequired')
      : !EMAIL_PATTERN.test(email.trim()) || serverFields.email
        ? t('validation.emailInvalid')
        : undefined
    : undefined;
  const passwordError = checked
    ? !password
      ? t('validation.newPasswordRequired')
      : password.length < MIN_PASSWORD
        ? t('validation.passwordTooShort', { count: MIN_PASSWORD })
        : serverFields.password
          ? t('validation.passwordRules')
          : undefined
    : undefined;

  async function submit() {
    setChecked(true);
    setProblem(null);
    if (!EMAIL_PATTERN.test(email.trim()) || password.length < MIN_PASSWORD || !consent) return;
    setLoading(true);
    try {
      await register(email, password, getDeviceLocale().formatLocale);
      router.push({ pathname: '/verify-email', params: { email: email.trim() } });
    } catch (error) {
      setProblem(toAuthProblem(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      canGoBack
      title={t('createAccount.title')}
      subtitle={t('createAccount.subtitle')}
      actions={
        <>
          <Button label={t('createAccount.submit')} onPress={submit} loading={loading} disabled={!email && !password} />
          <View className="flex-row flex-wrap items-center justify-center">
            <Text variant="label-large">{t('createAccount.haveAccount')}</Text>
            <Button hierarchy="tertiary" size="medium" label={t('createAccount.signIn')} onPress={() => router.replace('/sign-in')} />
          </View>
        </>
      }>
      {problem?.kind === 'offline' ? (
        <StatusBanner type="offline" title={t('errors.offline.title')} detail={t('errors.offline.detail')} />
      ) : problem?.kind === 'tooManyRequests' ? (
        <StatusBanner type="locked" title={t('errors.tooManyRequests.title')} detail={t('errors.tooManyRequests.detail')} />
      ) : problem && problem.kind !== 'validation' ? (
        <StatusBanner type="error" title={t('errors.generic.title')} detail={t('errors.generic.detail')} />
      ) : null}
      <View className="gap-lg">
        <TextField
          label={t('fields.email')}
          leadingIcon="mail"
          placeholder={t('fields.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          disabled={loading}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={passwordRef}
          label={t('fields.password')}
          leadingIcon="lock"
          placeholder={t('fields.newPasswordPlaceholder')}
          secure
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          hint={t('fields.passwordHint')}
          disabled={loading}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
        />
        {/* Figma B01 "Consent": checkbox + Body text; the whole row is the target. */}
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent(!consent)} className="flex-row items-center gap-sm">
          <SelectionControl type="checkbox" checked={consent} />
          <Text variant="body" className="flex-1">
            {t('createAccount.consent')}
          </Text>
        </Pressable>
        {checked && !consent ? (
          <Text variant="caption" tone="error" accessibilityRole="alert">
            {t('validation.consentRequired')}
          </Text>
        ) : null}
      </View>
    </AuthScreen>
  );
}
