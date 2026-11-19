import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { IconTile } from '@/components/ui/icon-tile';
import { InsightCard } from '@/components/ui/insight-card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';

/** Public guidance the age ranges come from. */
const SOURCES = [
  { key: 'nhs', url: 'https://www.nhs.uk/conditions/baby/caring-for-a-newborn/helping-your-baby-to-sleep/' },
  { key: 'aap', url: 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/default.aspx' },
  { key: 'nice', url: 'https://cks.nice.org.uk/topics/postnatal-care/' },
] as const;

/** V2-F06 Sources & method. */
export default function SourcesScreen() {
  const { t } = useTranslation('prediction');
  const { name } = useLogContext();
  return (
    <StackScreen title={t('sources.title')}>
      <Text variant="body">{t('sources.intro')}</Text>
      <Text variant="heading" accessibilityRole="header">
        {t('sources.public')}
      </Text>
      <ListGroup>
        {SOURCES.map((s) => (
          <ListRow key={s.key} leading={<IconTile icon="globe" tone="neutral" />} title={t(`sources.${s.key}`)} subtitle={t(`sources.${s.key}Detail`)} trailing={{ kind: 'chevron' }} onPress={() => WebBrowser.openBrowserAsync(s.url)} />
        ))}
      </ListGroup>
      <Text variant="heading" accessibilityRole="header">
        {t('sources.adjust')}
      </Text>
      <InsightCard tone="sleep" icon="moon" title={t('sources.adjustTitle', { name })} body={t('sources.adjustBody')} />
      <Banner type="info" message={t('sources.disclaimer')} />
    </StackScreen>
  );
}
