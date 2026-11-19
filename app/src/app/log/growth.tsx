import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { Field } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { formatDate } from '@/lib/format';
import { isoAt } from '@/lib/log-summary';

/** Parse a decimal typed with either separator ("7,4" or "7.4"). */
function parse(text: string): number | null {
  if (!text.trim()) return null;
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

/** V2-D15 Growth (`Sheet content/Growth`). Stores grams and millimetres; kg·cm / lb·in is display only. */
export default function GrowthSheet() {
  const { t } = useTranslation('log');
  const { babyId, name, events } = useLogContext();
  const { prefs, update } = useFormatPrefs();
  const imperial = prefs.weightUnit === 'lb';
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [head, setHead] = useState('');
  const [at, setAt] = useState<number | null>(null);
  const last = events.find((e) => e.type === 'growth');
  const w = parse(weight);
  const l = parse(length);
  const h = parse(head);
  const bad = (n: number | null) => n !== null && Number.isNaN(n);
  const valid = !bad(w) && !bad(l) && !bad(h) && (w !== null || l !== null || h !== null);
  const toG = (n: number) => Math.round(imperial ? n * 453.592 : n * 1000);
  const toMm = (n: number) => Math.round(imperial ? n * 25.4 : n * 10);
  return (
    <LogForm
      title={t('growthSheet.title')}
      subtitle={last ? t('growthSheet.subtitle', { name, date: formatDate(last.startAt, { day: 'numeric', month: 'short' }) }) : t('growthSheet.subtitleFirst', { name })}
      saveLabel={t('growthSheet.save')}
      canSave={valid && !!babyId}
      savedMessage={(time) => t('saved.growth', { time })}
      buildEvent={() => {
        if (!valid) return null;
        const startAt = isoAt(at);
        return { babyId, type: 'growth', startAt, growth: { weightG: w ? toG(w) : undefined, lengthMm: l ? toMm(l) : undefined, headMm: h ? toMm(h) : undefined }, loggedBy: '' };
      }}>
      <SegmentedControl label={t('growthSheet.title')} value={imperial ? 'imperial' : 'metric'} onChange={(v) => update({ weightUnit: v === 'imperial' ? 'lb' : 'kg' })} options={[{ value: 'metric', label: t('growthSheet.metric') }, { value: 'imperial', label: t('growthSheet.imperial') }]} />
      <Field label={t('growthSheet.weight')} placeholder={t('growthSheet.weightPh')} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} error={bad(w) ? t('growthSheet.invalid') : undefined} />
      <Field label={t('growthSheet.length')} placeholder={t('growthSheet.lengthPh')} keyboardType="decimal-pad" value={length} onChangeText={setLength} error={bad(l) ? t('growthSheet.invalid') : undefined} />
      <Field label={t('growthSheet.head')} placeholder={t('growthSheet.headPh')} keyboardType="decimal-pad" value={head} onChangeText={setHead} error={bad(h) ? t('growthSheet.invalid') : undefined} />
      <WhenRow label={t('growthSheet.measured')} value={at} onChange={setAt} />
    </LogForm>
  );
}
