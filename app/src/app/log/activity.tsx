import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { Chip } from '@/components/ui/chip';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import type { ActivityKind } from '@/data/log-events';
import { formatNumber, formatTime } from '@/lib/format';

const KINDS: ActivityKind[] = ['bath', 'tummy', 'play', 'outdoors', 'reading'];

/** V2-D16 Activity (`Sheet content/Activity`): what, how long (5-minute steps) and when it started. */
export default function ActivitySheet() {
  const { t } = useTranslation('log');
  const { kind: initial } = useLocalSearchParams<{ kind?: ActivityKind }>();
  const { babyId, name, now } = useLogContext();
  const [kind, setKind] = useState<ActivityKind>(initial && KINDS.includes(initial) ? initial : 'tummy');
  const [minutes, setMinutes] = useState(15);
  const [at, setAt] = useState<number | null>(null);
  const type = kind === 'bath' ? 'bath' : kind === 'tummy' ? 'tummy' : 'activity';
  return (
    <LogForm
      title={t('activitySheet.title')}
      subtitle={t('activitySheet.subtitle', { name, time: formatTime(now) })}
      saveLabel={t('activitySheet.save')}
      canSave={minutes > 0 && !!babyId}
      savedMessage={(time) => t('saved.activity', { time })}
      buildEvent={() => {
        const start = at ?? Date.now() - minutes * 60_000;
        return { babyId, type, startAt: new Date(start).toISOString(), endAt: new Date(start + minutes * 60_000).toISOString(), activity: { kind }, loggedBy: '' };
      }}>
      <View className="gap-lg">
        <Text variant="label-large">{t('activitySheet.what', { name })}</Text>
        <View className="flex-row flex-wrap gap-sm">
          {KINDS.map((k) => (
            <Chip key={k} label={t(`activitySheet.kinds.${k}`)} variant={kind === k ? 'selected' : 'outline'} selected={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>
      </View>
      <View className="gap-lg">
        <Text variant="label-large">{t('activitySheet.howLong')}</Text>
        <Stepper label={t('activitySheet.howLong')} amount={formatNumber(minutes)} unit={t('activitySheet.minutes')} canDecrease={minutes > 5} onDecrease={() => setMinutes((m) => Math.max(5, m - 5))} onIncrease={() => setMinutes((m) => m + 5)} />
      </View>
      <WhenRow label={t('activitySheet.started')} value={at} onChange={setAt} />
    </LogForm>
  );
}
