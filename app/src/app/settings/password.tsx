import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CODE_LENGTH, CodeInput } from '@/components/auth/code-input';
import { toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { LinkAction } from '@/components/unlock/quick-unlock';
import { useSession } from '@/hooks/use-session';
import { authApi } from '@/lib/auth/endpoints';
import { passwordProblem } from '@/lib/auth/password-rules';

/**
 * Settings › Security & Sign-In › Change password (or Set a password, for an account made with an
 * email code). Proof is the current password, or an email code when it's forgotten or never set.
 * The server hashes it and signs out every other phone; this one stays signed in.
 */
export default function PasswordScreen() {
  const { t } = useTranslation('settings');
  const ta = useTranslation('auth').t;
  const toast = useToast();
  const { user, updateUser } = useSession();
  const hasPassword = user?.has_password !== false;
  const [useCode, setUseCode] = useState(!hasPassword);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const [busy, setBusy] = useState(false);

  const rule = passwordProblem(next);
  const mismatch = confirm.length > 0 && confirm !== next;
  const proofReady = useCode ? codeSent && code.length === CODE_LENGTH : current.length > 0;
  const ready = proofReady && next.length > 0 && confirm.length > 0;
  const serverWeak = problem?.kind === 'validation' && !!problem.fields.password;

  const sendCode = async () => {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    try {
      await authApi.sendPasswordCode();
      setCodeSent(true);
      setCode('');
    } catch (error) {
      setProblem(toAuthProblem(error));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setSubmitted(true);
    if (busy || !ready || rule || mismatch) return;
    setBusy(true);
    setProblem(null);
    Keyboard.dismiss();
    try {
      const { data } = await authApi.updatePassword({
        password: next,
        password_confirmation: confirm,
        ...(useCode ? { code } : { current_password: current }),
      });
      updateUser(data);
      toast.show({ message: t(hasPassword ? 'password.changed' : 'password.set') });
      router.back();
    } catch (error) {
      const failure = toAuthProblem(error);
      setProblem(failure);
      if (failure.kind === 'expiredCode') setCode('');
      if (failure.kind === 'codeRequired') setUseCode(true);
    } finally {
      setBusy(false);
    }
  };

  const switchToCode = () => {
    setUseCode(true);
    setCurrent('');
    setProblem(null);
    void sendCode();
  };

  // Problems that belong to a field are shown on it; everything else goes in the banner.
  const banner = !problem ? null
    : problem.kind === 'offline' ? ta('offline')
    : problem.kind === 'tooManyRequests' || problem.kind === 'locked' ? ta('rateLimit')
    : ['invalidCredentials', 'invalidCode', 'expiredCode'].includes(problem.kind) || serverWeak ? null
    : t('password.failed');

  return (
    <StackScreen
      title={t(hasPassword ? 'password.changeTitle' : 'password.setTitle')}
      footer={<Button label={t('password.save')} onPress={() => void save()} disabled={!ready} loading={busy} />}>
      <Text variant="body-small" tone="secondary">{t(hasPassword ? 'password.intro' : 'password.introSet')}</Text>
      {banner && <Banner type="error" message={banner} />}
      <View className="gap-lg">
        {useCode ? (
          <View className="gap-md">
            {codeSent ? <>
              <Text variant="body-small" tone="secondary">{ta('codeSubtitle', { email: user?.email ?? '' })}</Text>
              <CodeInput value={code} onChange={(value) => { setCode(value); setProblem(null); }}
                error={problem?.kind === 'invalidCode'} disabled={busy || problem?.kind === 'expiredCode'} accessibilityLabel={ta('codeLabel')} />
              {(problem?.kind === 'invalidCode' || problem?.kind === 'expiredCode') &&
                <Text variant="body-small" tone="error">{ta(problem.kind === 'expiredCode' ? 'codeExpired' : 'codeWrong')}</Text>}
            </> : <Text variant="body-small" tone="secondary">{t('password.codeExplain', { email: user?.email ?? '' })}</Text>}
            <Button hierarchy="secondary" label={ta(codeSent ? 'resend' : 'send')} disabled={busy} onPress={() => void sendCode()} />
            {hasPassword && <LinkAction label={t('password.useCurrent')} disabled={busy} onPress={() => { setUseCode(false); setProblem(null); setCode(''); }} />}
          </View>
        ) : (
          <View className="gap-xs">
            <TextField label={t('password.current')} secure value={current} onChangeText={(value) => { setCurrent(value); setProblem(null); }}
              autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password" disabled={busy}
              error={problem?.kind === 'invalidCredentials' ? t('password.currentWrong') : undefined} />
            <LinkAction label={t('password.forgotCurrent')} disabled={busy} onPress={switchToCode} />
          </View>
        )}
        <TextField label={t('password.new')} secure value={next} onChangeText={(value) => { setNext(value); setProblem(null); }}
          autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" disabled={busy}
          hint={t('password.rules')}
          error={serverWeak ? t('password.weakServer') : submitted && rule ? t(`password.rule.${rule}`) : undefined} />
        <TextField label={t('password.confirm')} secure value={confirm} onChangeText={setConfirm}
          autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" disabled={busy}
          returnKeyType="done" onSubmitEditing={() => void save()}
          error={mismatch && (submitted || confirm.length >= next.length) ? t('password.mismatch') : undefined} />
        <Text variant="caption" tone="secondary">{t('password.otherPhones')}</Text>
      </View>
    </StackScreen>
  );
}
