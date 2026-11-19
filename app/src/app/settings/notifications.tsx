import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';

const KEY = 'nappa.reminders';
type Prefs = { nap: boolean; feed: boolean; medicine: boolean; sync: boolean; minutes: number };
const DEFAULTS: Prefs = { nap: false, feed: false, medicine: false, sync: false, minutes: 5 };
const STEPS = [5, 10, 15];

/** V2-H06 Notifications and H06b (permission denied: warning banner + Open Settings). All off by default. */
export default function NotificationsScreen() {
  const { t } = useTranslation('settings');
  const { name } = useLogContext();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => raw && setPrefs({ ...DEFAULTS, ...JSON.parse(raw) })).catch(() => {});
    const check = () => Notifications.getPermissionsAsync().then((p) => setDenied(!p.granted && !p.canAskAgain)).catch(() => {});
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, []);
  const set = async (patch: Partial<Prefs>) => {
    const turningOn = Object.values(patch).some((v) => v === true);
    if (turningOn) {
      const p = await Notifications.getPermissionsAsync();
      const ok = p.granted || (p.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
      if (!ok) {
        setDenied(true);
        return;
      }
    }
    const next = { ...prefs, ...patch };
    setPrefs(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };
  const toggle = (k: 'nap' | 'feed' | 'medicine' | 'sync', label: string, detail: string) => (
    <ListRow title={label} subtitle={detail} disabled={denied} trailing={{ kind: 'toggle', checked: prefs[k] && !denied }} onPress={() => set({ [k]: !prefs[k] })} />
  );
  return (
    <StackScreen title={t('v2.notif.title')}>
      {denied ? <Banner type="warning" message={t('v2.notif.denied')} action={t('v2.notif.openSettings')} onAction={() => Linking.openSettings()} /> : <Text variant="body-small" tone="secondary">{t('v2.notif.intro', { name })}</Text>}
      <ListGroup>
        {toggle('nap', t('v2.notif.nap'), t('v2.notif.napDetail'))}
        {toggle('feed', t('v2.notif.feed'), t('v2.notif.feedDetail'))}
        {toggle('medicine', t('v2.notif.medicine'), t('v2.notif.medicineDetail'))}
        {toggle('sync', t('v2.notif.sync'), t('v2.notif.syncDetail'))}
      </ListGroup>
      <ListGroup>
        <ListRow title={t('v2.notif.timing')} subtitle={t('v2.notif.timingDetail')} trailing={{ kind: 'value', value: t('v2.notif.minutes', { count: prefs.minutes }) }} onPress={() => set({ minutes: STEPS[(STEPS.indexOf(prefs.minutes) + 1) % STEPS.length] })} />
      </ListGroup>
    </StackScreen>
  );
}
