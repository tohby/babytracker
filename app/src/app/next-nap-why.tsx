import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { WakeWindowRing } from '@/components/charts/wake-window-ring';
import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { IconTile } from '@/components/ui/icon-tile';
import { InsightCard } from '@/components/ui/insight-card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { ageLabel } from '@/lib/age-label';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';
import { useNapPrediction } from '@/hooks/use-nap-prediction';

/** V2-F05 Why this time: the wake-window ring and each input in plain words. */
export default function WhyThisTimeScreen() {
  const { t } = useTranslation('prediction');
  const { baby, name, events, now } = useLogContext();
  const p = useNapPrediction(events, baby, now);
  if (p.state !== 'predicted') return null;
  const awake = elapsedMs(p.awakeSince, now);
  const age = baby ? ageLabel(baby.birth_date) : '';
  return (
    <StackScreen title={t('why.title')}>
      <View className="flex-row items-center gap-lg">
        <WakeWindowRing
          progress={awake / p.wakeWindowMs}
          closing={now > p.windowStart}
          value={formatDuration(awake)}
          caption={t('why.of', { window: formatDuration(p.wakeWindowMs) })}
          label={t('why.ringLabel', { awake: formatDuration(awake, 'long'), window: formatDuration(p.wakeWindowMs, 'long') })}
        />
        <Text variant="body" tone="secondary" className="flex-1">
          {t('why.summary', { name, awake: formatDuration(awake, 'long'), time: formatTime(p.windowStart) })}
        </Text>
      </View>
      <InsightCard tone="sleep" icon="moon" title={t('why.typicalTitle')} body={t('why.typicalBody', { age, min: formatDuration(p.typicalWakeWindowMs.min), max: formatDuration(p.typicalWakeWindowMs.max) })} />
      <InsightCard
        tone="feed"
        icon="clock"
        title={t('why.awakeTitle', { time: formatTime(p.awakeSince) })}
        body={p.basis === 'logs' ? t('why.awakeBody', { open: formatTime(p.windowStart), days: 7 }) : t('why.awakeBodyAge', { open: formatTime(p.windowStart) })}
      />
      {p.lastNapMs !== null && p.lastNapMs < 45 * 60_000 && <InsightCard tone="care" icon="sparkle" title={t('why.shortTitle')} body={t('why.shortBody')} />}
      <ListGroup>
        <ListRow leading={<IconTile icon="info" tone="brand" />} title={t('why.sources')} subtitle={t('why.sourcesDetail')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/next-nap-sources')} />
        <ListRow leading={<IconTile icon="clock" tone="sleep" />} title={t('why.wakeWindows')} trailing={{ kind: 'value', value: p.basis === 'logs' ? t('why.fromLogs') : t('why.ageBased') }} />
      </ListGroup>
    </StackScreen>
  );
}
