import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { useSession } from '@/hooks/use-session';
import { authedRequest } from '@/lib/auth/tokens';

/**
 * V2-H10 Delete account and H10b confirm. The API also needs the password (`DELETE /v1/me`), which the Figma frame
 * doesn't show, so a password field sits under "Type DELETE" (see gaps list).
 */
export default function DeleteAccountScreen() {
  const { t } = useTranslation('settings');
  const tc = useTranslation().t;
  const { name } = useLogContext();
  const { forgetAccount } = useSession();
  const [word, setWord] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const ready = word.trim() === t('v2.delete.deleteWord') && password.length > 0;
  const destroy = async () => {
    setBusy(true);
    setError(false);
    try {
      await authedRequest('/v1/me', { method: 'DELETE', body: { password } });
      await forgetAccount();
    } catch {
      setError(true);
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
          <Button hierarchy="destructive" label={t('v2.delete.button')} disabled={!ready} onPress={() => setConfirm(true)} />
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
        <Field label={t('v2.delete.password')} helper={t('v2.delete.passwordHelp')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
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
