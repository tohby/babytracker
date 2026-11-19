import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { StateView } from '@/components/ui/state-view';
import { SyncStatus } from '@/components/ui/sync-status';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { logMeta } from '@/constants/log-types';
import { useLogStore } from '@/data/log-store';
import { useEventText } from '@/hooks/use-event-text';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { formatDate, formatTime } from '@/lib/format';

/** V2-D08 Entry detail and V2-D10 Delete confirm (destructive Dialog, then a toast with Undo). */
export default function EntryDetailScreen() {
  const { t } = useTranslation('timeline');
  const { t: tc } = useTranslation();
  const { t: tHome } = useTranslation('home');
  const { prefs } = useFormatPrefs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { name, events } = useLogContext();
  const { remove } = useLogStore();
  const toast = useToast();
  const describe = useEventText(events);
  const [confirming, setConfirming] = useState(false);
  const entry = events.find((e) => e.id === id);
  if (!entry) {
    return (
      <StackScreen>
        <StateView kind="empty" title={t('detail.missing')} body="" />
      </StackScreen>
    );
  }
  const text = describe(entry);
  const what = t(`nouns.${entry.type === 'nappy' && prefs.nappyWord === 'diaper' ? 'diaper' : entry.type}`);
  const timed = !!entry.endAt;
  const del = () => {
    const undo = remove(entry.id);
    setConfirming(false);
    router.back();
    toast.show({ message: t('detail.deleted', { what: text.title }), onUndo: undo });
  };
  return (
    <StackScreen title={text.title}>
      <View className="items-center gap-sm py-md">
        <IconTile icon={logMeta[entry.type].icon} tone={logMeta[entry.type].tone} size="L" />
        <Text variant="title-large" className="text-center">
          {text.value ?? text.detail ?? text.title}
        </Text>
        <Text variant="body-small" tone="secondary">
          {formatDate(entry.startAt, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>
      <ListGroup insetDividers={false}>
        <ListRow title={timed ? t(entry.type === 'sleep' ? 'detail.fellAsleep' : 'detail.started') : t('detail.time')} trailing={{ kind: 'custom', node: <Text tone="secondary">{formatTime(entry.startAt)}</Text> }} />
        {timed && <ListRow title={t(entry.type === 'sleep' ? 'detail.wokeUp' : 'detail.ended')} trailing={{ kind: 'custom', node: <Text tone="secondary">{formatTime(entry.endAt!)}</Text> }} />}
        {!!text.detail && text.value && <ListRow title={text.detail} />}
        <ListRow title={t('detail.loggedBy')} trailing={{ kind: 'custom', node: <Text tone="secondary">{entry.loggedBy}</Text> }} />
      </ListGroup>
      {!!entry.note && (
        <View className="gap-xs">
          <Text variant="label-small" tone="secondary">
            {t('detail.note')}
          </Text>
          <Text variant="body">{entry.note}</Text>
        </View>
      )}
      <SyncStatus state={entry.pendingSync ? 'syncing' : 'synced'} label={entry.pendingSync ? t('detail.local') : tHome('v2.sync.synced')} />
      <View className="gap-sm">
        <Button hierarchy="secondary" label={t('detail.edit', { what })} onPress={() => router.push({ pathname: '/entry/edit', params: { id: entry.id } })} />
        <Button hierarchy="tertiary" size="medium" label={t('detail.delete')} onPress={() => setConfirming(true)} />
      </View>
      <Dialog
        visible={confirming}
        tone="destructive"
        icon="trash"
        title={t('detail.deleteTitle', { what })}
        body={t('detail.deleteBody', { name })}
        confirmLabel={t('detail.deleteConfirm', { what })}
        cancelLabel={tc('actions.cancel')}
        onConfirm={del}
        onCancel={() => setConfirming(false)}
      />
    </StackScreen>
  );
}
