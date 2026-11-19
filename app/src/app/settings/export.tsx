import { useState } from 'react';
import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { InsightCard } from '@/components/ui/insight-card';
import { OptionCard } from '@/components/ui/option-card';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/format';

/** V2-H09 Export your data. CSV and JSON go through the share sheet; PDF isn't built yet (see gaps list). */
export default function ExportScreen() {
  const { t } = useTranslation('settings');
  const { events } = useLogContext();
  const toast = useToast();
  const [format, setFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const first = events[events.length - 1];
  const run = () => {
    if (format === 'pdf') return toast.show({ message: t('v2.exportScreen.pdfSoon') });
    const message =
      format === 'json'
        ? JSON.stringify(events, null, 2)
        : ['id,type,start,end,details', ...events.map((e) => [e.id, e.type, e.startAt, e.endAt ?? '', JSON.stringify({ ...e.bottle, ...e.nappy, ...e.nursing, ...e.pumping, ...e.solids, ...e.medicine, ...e.growth, ...e.activity, note: e.note }).replace(/,/g, ';')].join(','))].join('\n');
    Share.share({ message });
  };
  return (
    <StackScreen title={t('v2.exportScreen.title')} footer={<Button label={t('v2.exportScreen.button', { count: events.length })} disabled={events.length === 0} onPress={run} />}>
      <InsightCard tone="sleep" icon="download" title={t('v2.exportScreen.freeTitle')} body={t('v2.exportScreen.freeBody')} />
      <Text variant="label-large">{t('v2.exportScreen.format')}</Text>
      {(['csv', 'pdf', 'json'] as const).map((f) => (
        <OptionCard key={f} title={t(`v2.exportScreen.${f}`)} detail={t(`v2.exportScreen.${f}Detail`)} selected={format === f} onPress={() => setFormat(f)} />
      ))}
      {first && <Text variant="body-small" tone="secondary">{t('v2.exportScreen.rangeValue', { start: formatDate(first.startAt, { day: 'numeric', month: 'short', year: 'numeric' }) })}</Text>}
    </StackScreen>
  );
}
