import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressBar } from '@/components/charts/progress-bar';
import { typicalNapMinutes } from '@/components/log/typical-nap';
import { useLogContext } from '@/components/log/use-log-context';
import { HeroScreen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StateView } from '@/components/ui/state-view';
import { SyncStatus } from '@/components/ui/sync-status';
import { Text } from '@/components/ui/text';
import { timerElapsedMs } from '@/data/log-events';
import { useLogStore } from '@/data/log-store';
import { useNow } from '@/hooks/use-now';
import { ageLabel } from '@/lib/age-label';
import { formatDuration, formatTime, formatTimer } from '@/lib/format';
import { startOfDay } from '@/lib/log-summary';

/** V2-D03 Sleep timer: sleep Hero with glass top bar, big timer, typical length, Pause and "She's awake". */
export default function SleepTimerScreen() {
  const { t } = useTranslation('log');
  const { baby, events } = useLogContext();
  const now = useNow(1000);
  const { timer, pauseTimer, resumeTimer, stopTimer } = useLogStore();
  if (!timer || timer.kind !== 'sleep') {
    return (
      <HeroScreen tone="sleep" mascot="awake" heroHeight={300}>
        <StateView kind="empty" title={t('sleepTimer.noTimer')} body={t('sleepTimer.noTimerBody')} action={t('quick.title')} onAction={() => router.replace('/log')} />
      </HeroScreen>
    );
  }
  const elapsed = timerElapsedMs(timer, now);
  const typical = typicalNapMinutes(baby?.birth_date ?? null, new Date(now));
  const napN = events.filter((e) => e.type === 'sleep' && Date.parse(e.startAt) >= startOfDay(Date.parse(timer.startedAt))).length + 1;
  const stop = () => {
    const saved = stopTimer();
    if (saved) router.replace({ pathname: '/log/saved', params: { id: saved.id } });
  };
  return (
    <HeroScreen tone="sleep" mascot="sleeping">
      <View className="gap-xs">
        <Text variant="body" tone="secondary">
          {t('sleepTimer.started', { n: napN, time: formatTime(timer.startedAt) })}
        </Text>
        <Text variant="numeric-timer" tone={timer.pausedAt ? 'tertiary' : 'primary'} tabular accessibilityRole="timer" accessibilityLabel={formatDuration(elapsed, 'long')}>
          {formatTimer(elapsed)}
        </Text>
      </View>
      <Card>
        <View className="flex-row flex-wrap items-center justify-between gap-sm">
          <Text variant="label-large">{t('sleepTimer.typical', { age: baby ? ageLabel(baby.birth_date) : '' })}</Text>
          <Text variant="label-large" tone="secondary">
            {t('sleepTimer.typicalRange', { min: formatDuration(typical.min * 60_000), max: formatDuration(typical.max * 60_000) })}
          </Text>
        </View>
        <ProgressBar tone="sleep" value={elapsed / (typical.max * 60_000)} label={t('sleepTimer.typical', { age: baby ? ageLabel(baby.birth_date) : '' })} />
      </Card>
      <SyncStatus state="offline" label={t('sleepTimer.local')} />
      <View className="flex-row gap-sm">
        <Button className="flex-1" hierarchy="secondary" label={timer.pausedAt ? t('timer.resume') : t('timer.pause')} onPress={timer.pausedAt ? resumeTimer : pauseTimer} />
        <Button className="flex-1" label={t('sleepTimer.awake')} onPress={stop} />
      </View>
    </HeroScreen>
  );
}
