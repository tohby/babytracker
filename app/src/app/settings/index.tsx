import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Avatar } from '@/components/ui/avatar';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { useSession } from '@/hooks/use-session';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { ageLabel } from '@/lib/age-label';

/** V2-H01 Settings. */
export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const tc = useTranslation().t;
  const { user, signOut } = useSession();
  const { baby, name } = useLogContext();
  const { mode } = useThemeMode();
  const confirmSignOut = () =>
    Alert.alert(t('account.signOutConfirmTitle'), t('account.signOutConfirmDetail'), [
      { text: tc('actions.cancel'), style: 'cancel' },
      { text: t('account.signOutConfirm'), style: 'destructive', onPress: () => signOut() },
    ]);
  return (
    <StackScreen title={t('v2.title')}>
      <ListGroup>
        <ListRow
          leading={<Avatar size="M" initials={(user?.name ?? user?.email ?? '').slice(0, 1).toUpperCase()} photo={user?.avatar_url ? { uri: user.avatar_url } : undefined} tone="surface" />}
          title={user?.name ?? user?.email ?? ''}
          subtitle={user?.email ?? undefined}
          trailing={{ kind: 'none' }}
        />
      </ListGroup>
      <ListGroup>
        <ListRow leading={<IconTile icon="family" tone="feed" />} title={t('v2.babyProfile')} subtitle={baby ? t('v2.babyDetail', { name, age: ageLabel(baby.birth_date) }) : undefined} trailing={{ kind: 'chevron' }} onPress={() => router.push('/family')} />
        <ListRow leading={<IconTile icon="clock" tone="sleep" />} title={t('v2.wakeWindows')} subtitle={t('v2.wakeWindowsDetail', { name })} trailing={{ kind: 'value', value: t('v2.ageBased') }} onPress={() => router.push('/next-nap-why')} />
        <ListRow leading={<IconTile icon="bell" tone="brand" />} title={t('v2.notifications')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/settings/notifications')} />
      </ListGroup>
      <ListGroup>
        <ListRow leading={<IconTile icon="globe" tone="neutral" />} title={t('v2.language')} subtitle={t('v2.languageDetail')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/settings/language')} />
        <ListRow leading={<IconTile icon="contrast" tone="neutral" />} title={t('v2.appearance')} trailing={{ kind: 'value', value: t(`appearance.${mode}`) }} onPress={() => router.push('/appearance')} />
        <ListRow leading={<IconTile icon="sparkle" tone="care" />} title={t('v2.plus')} subtitle={t('v2.plusDetail')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/plus')} />
      </ListGroup>
      <ListGroup>
        <ListRow leading={<IconTile icon="download" tone="neutral" />} title={t('v2.export')} subtitle={t('v2.exportDetail')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/settings/export')} />
        <ListRow leading={<IconTile icon="info" tone="neutral" />} title={t('v2.about')} subtitle={t('v2.version', { version: Constants.expoConfig?.version ?? '' })} trailing={{ kind: 'none' }} />
      </ListGroup>
      <ListGroup>
        <ListRow leading={<IconTile icon="arrow" tone="neutral" />} title={t('v2.signOut')} trailing={{ kind: 'chevron' }} onPress={confirmSignOut} />
        <ListRow leading={<IconTile icon="trash" tone="error" />} title={t('v2.deleteAccount')} titleTone="error" trailing={{ kind: 'chevron' }} onPress={() => router.push('/settings/delete-account')} />
      </ListGroup>
    </StackScreen>
  );
}
