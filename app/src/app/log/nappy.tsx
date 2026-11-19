import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { NappyPicker } from '@/components/tracking/nappy-picker';
import { Field } from '@/components/ui/field';
import type { NappyKind } from '@/data/log-events';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { elapsedMs, formatDuration } from '@/lib/format';

/** V2-D07 Nappy (`Sheet content/Nappy`, compact sheet). "Nappy"/"diaper" follows the wording setting. */
export default function NappySheet() {
  const { t } = useTranslation('log');
  const { babyId, name, events, now } = useLogContext();
  const { prefs } = useFormatPrefs();
  const diaper = prefs.nappyWord === 'diaper';
  const [kind, setKind] = useState<NappyKind | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const last = events.find((e) => e.type === 'nappy');
  return (
    <LogForm
      size="compact"
      title={t(diaper ? 'nappySheet.titleDiaper' : 'nappySheet.title')}
      subtitle={last ? t('nappySheet.subtitle', { name, ago: formatDuration(elapsedMs(last.startAt, now)) }) : t('nappySheet.subtitlePlain', { name })}
      saveLabel={t(diaper ? 'nappySheet.saveDiaper' : 'nappySheet.save')}
      canSave={kind !== null && !!babyId}
      savedMessage={(time) => t(diaper ? 'saved.diaper' : 'saved.nappy', { time })}
      buildEvent={() => (kind ? { babyId, type: 'nappy', startAt: new Date(at ?? Date.now()).toISOString(), nappy: { kind }, note: note || undefined, loggedBy: '' } : null)}>
      <NappyPicker value={kind} onChange={setKind} labels={{ wet: t('nappySheet.wet'), dirty: t('nappySheet.dirty'), both: t('nappySheet.both') }} />
      <WhenRow label={t('when.time')} value={at} onChange={setAt} />
      <Field label={t('nappySheet.note')} placeholder={t('nappySheet.notePlaceholder')} value={note} onChangeText={setNote} />
    </LogForm>
  );
}
