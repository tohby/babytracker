import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressBar } from '@/components/charts/progress-bar';
import { AgeGuide } from '@/components/log/age-guide';
import { useLogContext } from '@/components/log/use-log-context';
import { HeroScreen } from '@/components/screen';
import { PredictionFeedback, type PredictionVerdict } from '@/components/tracking/prediction-feedback';
import { ReasonTile } from '@/components/tracking/reason-tile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { ageLabel } from '@/lib/age-label';
import { elapsedMs, formatDuration, formatTime } from '@/lib/format';
import { predictNextNap } from '@/lib/prediction';
import { scheduleReminder } from '@/lib/reminders';

/** V2-F04 Next nap, F07 still learning, F08 under 2 months: one route, three honest states. */
export default function NextNapScreen() {
  const { t } = useTranslation('prediction');
  const { baby, name, events, now } = useLogContext();
  const toast = useToast();
  const [answer, setAnswer] = useState<PredictionVerdict | null>(null);
  const remind = async (at: number, kind: 'nap' | 'eightWeeks') => {
    const result = await scheduleReminder(at, kind, name);
    if (result === 'scheduled') toast.show({ message: t('nextNap.reminderSet', { time: formatTime(at) }) });
    if (result === 'denied') toast.show({ message: t('reminderDenied') });
  };
  const p = useMemo(() => predictNextNap(events, baby?.birth_date ?? null, now, baby?.usual_wake_time ?? null), [events, baby, now]);
  const age = baby ? ageLabel(baby.birth_date) : '';
  const sub = t('learning.subtitle', { name, age });

  if (p.state === 'too-young') {
    return (
      <HeroScreen tone="care" mascot="swaddled" title={t('young.title')} titleVariant="title-large" subtitle={t('young.subtitle', { name, age })} footer={<Button hierarchy="secondary" label={t('young.remind')} onPress={() => baby && remind(Date.parse(baby.birth_date) + 56 * 86_400_000, 'eightWeeks')} />}>
        <Text variant="body">{t('young.body')}</Text>
        <Text variant="heading" accessibilityRole="header">
          {t('young.cues')}
        </Text>
        <ListGroup>
          <ListRow leading={<IconTile icon="sparkle" tone="care" />} title={t('young.yawn')} subtitle={t('young.yawnDetail')} />
          <ListRow leading={<IconTile icon="eye" tone="care" />} title={t('young.rub')} subtitle={t('young.rubDetail')} />
          <ListRow leading={<IconTile icon="moon" tone="care" />} title={t('young.stare')} subtitle={t('young.stareDetail')} />
        </ListGroup>
      </HeroScreen>
    );
  }

  if (p.state === 'learning') {
    const left = p.napsNeeded - p.napsLogged;
    return (
      <HeroScreen tone="sleep" mascot="standing" title={t('learning.title')} subtitle={sub} footer={<Button label={t('learning.logNap')} onPress={() => router.push('/log/nap')} />}>
        <Text variant="heading">{t('learning.body', { count: left, name })}</Text>
        <View className="gap-sm">
          <View className="flex-row justify-between">
            <Text variant="label-large">{t('learning.napsLogged')}</Text>
            <Text variant="label-large" tone="secondary">
              {t('learning.progress', { logged: p.napsLogged, needed: p.napsNeeded })}
            </Text>
          </View>
          <ProgressBar tone="sleep" value={p.napsLogged / p.napsNeeded} label={t('learning.progress', { logged: p.napsLogged, needed: p.napsNeeded })} />
        </View>
        <AgeGuide />
      </HeroScreen>
    );
  }

  const until = p.windowStart - now;
  const days = new Set(events.filter((e) => e.type === 'sleep' && Date.parse(e.startAt) > now - 7 * 86_400_000).map((e) => new Date(e.startAt).toDateString())).size;
  const remindAt = p.windowStart - 5 * 60_000;
  return (
    <HeroScreen tone="sleep" mascot="sleeping" title={t('nextNap.title')} subtitle={until > 60_000 ? t('nextNap.in', { duration: formatDuration(until, 'short') }) : t('nextNap.now')}>
      <View className="flex-row items-center justify-between gap-md">
        <View className="flex-1 gap-2xs">
          <Text variant="title-large" tabular>
            {t('nextNap.window', { start: formatTime(p.windowStart), end: formatTime(p.windowEnd) })}
          </Text>
          <Text variant="body" tone="secondary">
            {t('nextNap.likely', { time: formatTime((p.windowStart + p.windowEnd) / 2) })}
          </Text>
        </View>
        <Badge tone="brand" label={p.basis === 'logs' ? t('nextNap.basisDays', { count: days }) : t('nextNap.basisAge')} />
      </View>
      <View className="flex-row gap-md">
        <ReasonTile tone="sleep" label={t('nextNap.awake')} value={formatDuration(elapsedMs(p.awakeSince, now))} />
        {p.lastNapMs !== null && <ReasonTile tone="care" label={p.lastNapMs < 45 * 60_000 ? t('nextNap.shortNap') : t('nextNap.lastNap')} value={formatDuration(p.lastNapMs)} />}
        {/* Figma uses the Nappy tone for Age (see gaps list). */}
        <ReasonTile tone="nappy" label={t('nextNap.age')} value={age} />
      </View>
      <PredictionFeedback answer={answer} onAnswer={setAnswer} />
      <View className="gap-sm">
        {remindAt > now && <Button label={t('nextNap.remind', { time: formatTime(remindAt) })} onPress={() => remind(remindAt, 'nap')} />}
        <Button hierarchy="tertiary" size="medium" label={t('nextNap.why')} onPress={() => router.push('/next-nap-why')} />
      </View>
    </HeroScreen>
  );
}
