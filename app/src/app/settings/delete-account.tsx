import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CodeInput, CODE_LENGTH } from '@/components/auth/code-input';
import { toAuthProblem } from '@/components/auth/auth-problem';
import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { useSession } from '@/hooks/use-session';
import { authApi } from '@/lib/auth/endpoints';

/**
 * V2-H10 Delete account and H10b confirm. Verify the account immediately before deleting it.
 */
export default function DeleteAccountScreen() {
  const { t } = useTranslation('settings');
  const tc = useTranslation().t;
  const ta = useTranslation('auth').t;
  const { name } = useLogContext();
  const { forgetAccount, user } = useSession();
  const [word, setWord] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeProblem, setCodeProblem] = useState<'invalidCode' | 'expiredCode' | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const passwordless = user?.has_password === false;
  const ready = word.trim() === t('v2.delete.deleteWord') && (passwordless ? code.length === CODE_LENGTH && codeSent : password.length > 0);
  const sendCode = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      await authApi.sendDeleteCode();
      setCodeSent(true);
      setCode('');
      setCodeProblem(null);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const destroy = async () => {
    setBusy(true);
    setError(false);
    try {
      await authApi.deleteAccount(passwordless ? { code } : { password });
      await forgetAccount();
    } catch (failure) {
      const problem = toAuthProblem(failure);
      if (passwordless && (problem.kind === 'invalidCode' || problem.kind === 'expiredCode')) {
        setCodeProblem(problem.kind);
        if (problem.kind === 'expiredCode') setCode('');
      } else setError(true);
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <StackScreen
      title={t('v2.delete.title')}
      footer={
        <>
          <Button hierarchy="destructive" label={t('v2.delete.button')} disabled={!ready || busy} onPress={() => setConfirm(true)} />
          <Button hierarchy="tertiary" size="medium" label={tc('actions.cancel')} onPress={() => router.back()} />
        </>
      }>
      <Banner type="error" message={error ? t('v2.delete.failed') : t('v2.delete.banner')} />
      <Text variant="label-large">{t('v2.delete.what')}</Text>
      <ListGroup>
        <ListRow title={t('v2.delete.logs', { name })} subtitle={t('v2.delete.logsDetail')} />
        <ListRow title={t('v2.delete.account')} subtitle={t('v2.delete.accountDetail')} />
        <ListRow title={t('v2.delete.shared')} subtitle={t('v2.delete.sharedDetail')} />
      </ListGroup>
      <Button hierarchy="secondary" label={t('v2.delete.exportFirst')} onPress={() => router.push('/settings/export')} />
      <View className="gap-lg">
        <Field label={t('v2.delete.typeDelete')} value={word} onChangeText={setWord} autoCapitalize="characters" autoCorrect={false} />
        {passwordless ? <>
          {codeSent && <>
            <Text tone="secondary">{ta('codeSubtitle', { email: user?.email ?? '' })}</Text>
            <CodeInput value={code} onChange={(value) => { setCode(value); setCodeProblem(null); }} error={codeProblem === 'invalidCode'} disabled={busy || codeProblem === 'expiredCode'} accessibilityLabel={ta('codeLabel')} />
            {codeProblem && <Text tone="error">{ta(codeProblem === 'expiredCode' ? 'codeExpired' : 'codeWrong')}</Text>}
          </>}
          <Button hierarchy="secondary" label={ta(codeSent ? 'resend' : 'send')} disabled={busy} onPress={() => void sendCode()} />
        </> : <Field label={t('v2.delete.password')} helper={t('v2.delete.passwordHelp')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />}
      </View>
      <Dialog
        visible={confirm}
        tone="destructive"
        icon="trash"
        title={t('v2.delete.confirmTitle')}
        body={t('v2.delete.confirmBody', { name })}
        confirmLabel={t('v2.delete.confirm')}
        cancelLabel={tc('actions.cancel')}
        confirming={busy}
        onConfirm={destroy}
        onCancel={() => setConfirm(false)}
      />
    </StackScreen>
  );
}
