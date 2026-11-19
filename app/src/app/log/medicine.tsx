import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { Field } from '@/components/ui/field';
import { ListRow } from '@/components/ui/list-row';
import { formatTime } from '@/lib/format';

/**
 * V2-D14 Medicine (`Sheet content/Medicine`). Name and dose are prefilled from the last entry. The reminder
 * toggle is kept with the entry; scheduling the reminder needs the notifications work (see gaps list).
 */
export default function MedicineSheet() {
  const { t } = useTranslation('log');
  const { babyId, name, events, now } = useLogContext();
  const last = events.find((e) => e.medicine)?.medicine;
  const [med, setMed] = useState(last?.name ?? '');
  const [dose, setDose] = useState(last?.dose ?? '');
  const [at, setAt] = useState<number | null>(null);
  const [remind, setRemind] = useState(false);
  return (
    <LogForm
      title={t('medicineSheet.title')}
      subtitle={t('medicineSheet.subtitle', { name, time: formatTime(now) })}
      saveLabel={t('medicineSheet.save')}
      canSave={!!med.trim() && !!babyId}
      savedMessage={(time) => t('saved.medicine', { time })}
      buildEvent={() => ({ babyId, type: 'medicine', startAt: new Date(at ?? Date.now()).toISOString(), medicine: { name: med.trim(), dose: dose.trim() || undefined }, loggedBy: '' })}>
      <Field label={t('medicineSheet.name')} placeholder={t('medicineSheet.namePlaceholder')} value={med} onChangeText={setMed} />
      <Field label={t('medicineSheet.dose')} placeholder={t('medicineSheet.dosePlaceholder')} helper={t('medicineSheet.doseHelp')} value={dose} onChangeText={setDose} />
      <WhenRow label={t('medicineSheet.given')} value={at} onChange={setAt} />
      <ListRow title={t('medicineSheet.remind')} subtitle={t('medicineSheet.remindOff')} trailing={{ kind: 'toggle', checked: remind }} onPress={() => setRemind((r) => !r)} />
    </LogForm>
  );
}
