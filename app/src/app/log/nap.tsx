import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { Field } from '@/components/ui/field';
import { InsightCard } from '@/components/ui/insight-card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { useLogStore } from '@/data/log-store';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';
import { predictNextNap } from '@/lib/prediction';

/** V2-D02 Log a nap (`Sheet content/Log a nap`): start a timer now, or add a past nap. */
export default function LogNapSheet() {
  const { t } = useTranslation('log');
  const { baby, babyId, name, events, now } = useLogContext();
  const { startTimer, timer } = useLogStore();
  const [mode, setMode] = useState<'now' | 'past'>('now');
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const lastWake = events.find((e) => e.type === 'sleep' && e.endAt)?.endAt;
  const prediction = useMemo(() => predictNextNap(events, baby?.birth_date ?? null, now, baby?.usual_wake_time ?? null), [events, baby, now]);
  const startAt = start ?? now;
  const endBeforeStart = mode === 'past' && end !== null && end <= startAt;

  const insight = (() => {
    if (prediction.state !== 'predicted' || mode === 'past') return null;
    if (startAt < prediction.windowStart) return { title: t('nap.early'), body: t('nap.earlyBody', { name, time: formatTime(prediction.windowStart) }) };
    if (startAt > prediction.windowEnd) return { title: t('nap.late'), body: t('nap.lateBody', { name, time: formatTime(prediction.windowEnd) }) };
    return { title: t('nap.onTime'), body: t('nap.onTimeBody', { name, time: formatTime(prediction.windowStart) }) };
  })();

  const subtitle = lastWake ? t('nap.subtitle', { name, awake: formatDuration(elapsedMs(lastWake, now)) }) : t('nap.subtitlePlain', { name });

  if (mode === 'now') {
    // Starting a timer isn't an entry yet: the LogForm save path is replaced by starting the timer.
    return (
      <LogForm
        title={t('nap.title')}
        subtitle={subtitle}
        saveLabel={t('nap.startTimer')}
        canSave={!timer && !!babyId}
        savedMessage={() => ''}
        buildEvent={() => {
          startTimer('sleep', babyId, { startedAt: new Date(startAt).toISOString() });
          router.replace('/log/sleep-timer');
          return null;
        }}>
        <SegmentedControl label={t('nap.title')} value={mode} onChange={setMode} options={[{ value: 'now', label: t('nap.startNow') }, { value: 'past', label: t('nap.past') }]} />
        <WhenRow label={t('nap.fellAsleep')} value={start} onChange={setStart} />
        <Field label={t('nap.note')} placeholder={t('nap.notePlaceholder')} value={note} onChangeText={setNote} />
        {insight && <InsightCard tone="sleep" icon="moon" title={insight.title} body={insight.body} />}
      </LogForm>
    );
  }

  return (
    <LogForm
      title={t('nap.title')}
      subtitle={subtitle}
      saveLabel={t('nap.save')}
      canSave={end !== null && !endBeforeStart && !!babyId}
      savedMessage={(time) => t('saved.nap', { time })}
      buildEvent={() => (end === null || endBeforeStart ? null : { babyId, type: 'sleep', startAt: new Date(startAt).toISOString(), endAt: new Date(end).toISOString(), note: note || undefined, loggedBy: '' })}>
      <SegmentedControl label={t('nap.title')} value={mode} onChange={setMode} options={[{ value: 'now', label: t('nap.startNow') }, { value: 'past', label: t('nap.past') }]} />
      <WhenRow label={t('nap.fellAsleep')} value={start} onChange={setStart} />
      <WhenRow label={t('nap.wokeUp')} value={end} onChange={setEnd} emptyLabel={t('nap.stillAsleep')} minimum={startAt} />
      {endBeforeStart && (
        <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
          {t('nap.wakeBeforeSleep', { time: formatTime(startAt) })}
        </Text>
      )}
      <Field label={t('nap.note')} placeholder={t('nap.notePlaceholder')} value={note} onChangeText={setNote} />
    </LogForm>
  );
}
