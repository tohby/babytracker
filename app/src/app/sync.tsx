import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { IconTile } from '@/components/ui/icon-tile';
import { InsightCard } from '@/components/ui/insight-card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';

/** V2-G06 Sync & devices: honest about what exists today (this phone only, entries waiting for family sync). */
export default function SyncScreen() {
  const { t } = useTranslation('family');
  const { name, events } = useLogContext();
  const pending = events.filter((e) => e.pendingSync).length;
  return (
    <StackScreen title={t('syncScreen.title')}>
      {pending > 0 && <Banner type="warning" message={t('syncScreen.banner', { count: pending })} />}
      <Text variant="heading" accessibilityRole="header">
        {t('syncScreen.devices', { name })}
      </Text>
      <ListGroup>
        <ListRow leading={<IconTile icon="cloud-check" tone="brand" />} title={t('syncScreen.thisPhone')} subtitle={t('syncScreen.thisPhoneDetail')} trailing={{ kind: 'value', value: pending ? t('syncScreen.waiting', { count: pending }) : t('syncScreen.ok') }} />
      </ListGroup>
      <InsightCard tone="sleep" icon="cloud-check" title={t('syncScreen.safeTitle')} body={t('syncScreen.safeBody')} />
    </StackScreen>
  );
}
