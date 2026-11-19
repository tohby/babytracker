import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { StackScreen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useLogStore } from '@/data/log-store';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { formatTime } from '@/lib/format';

/** V2-D09 Edit entry and D09b validation: wake-up must come after falling asleep; Save stays disabled until fixed. */
export default function EditEntryScreen() {
  const { t } = useTranslation('timeline');
  const { t: tc } = useTranslation();
  const { prefs } = useFormatPrefs();
  const tl = useTranslation('log').t;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, now } = useLogContext();
  const { update } = useLogStore();
  const toast = useToast();
  const entry = events.find((e) => e.id === id);
  const [start, setStart] = useState<number | null>(entry ? Date.parse(entry.startAt) : null);
  const [end, setEnd] = useState<number | null>(entry?.endAt ? Date.parse(entry.endAt) : null);
  const [note, setNote] = useState(entry?.note ?? '');
  if (!entry) return null;
  const what = t(`nouns.${entry.type === 'nappy' && prefs.nappyWord === 'diaper' ? 'diaper' : entry.type}`);
  const startAt = start ?? now;
  const invalid = !!entry.endAt && end !== null && end <= startAt;
  const save = () => {
    update(entry.id, { startAt: new Date(startAt).toISOString(), endAt: entry.endAt && end ? new Date(end).toISOString() : undefined, note: note || undefined });
    router.back();
    toast.show({ message: t('edit.saved') });
  };
  return (
    <StackScreen
      title={t('edit.title', { what })}
      footer={
        <>
          <Button label={t('edit.save')} disabled={invalid} onPress={save} />
          <Button label={tc('actions.cancel')} hierarchy="tertiary" size="medium" onPress={() => router.back()} />
        </>
      }>
      <WhenRow label={entry.endAt ? tl(entry.type === 'sleep' ? 'nap.fellAsleep' : 'activitySheet.started') : tl('when.time')} value={start} onChange={setStart} />
      {!!entry.endAt && <WhenRow label={tl(entry.type === 'sleep' ? 'nap.wokeUp' : 'when.time')} value={end} onChange={setEnd} minimum={startAt} />}
      {invalid && (
        <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
          {tl('nap.wakeBeforeSleep', { time: formatTime(startAt) })}
        </Text>
      )}
      <Field label={t('edit.note')} value={note} onChangeText={setNote} multiline />
    </StackScreen>
  );
}
