import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { StackScreen } from '@/components/screen';
import { TimerCard } from '@/components/tracking/timer-card';
import { SyncStatus } from '@/components/ui/sync-status';
import { useToast } from '@/components/ui/toast';
import { timerElapsedMs } from '@/data/log-events';
import { useLogStore } from '@/data/log-store';
import { useNow } from '@/hooks/use-now';
import { formatDuration, formatTime, formatTimer } from '@/lib/format';

/**
 * Pumping timer: the `Timer card` Kind=Pumping on the nursing-timer layout. There is no V2 frame for this
 * screen (see gaps list); the amount is added afterwards from the entry.
 */
export default function PumpingTimerScreen() {
  const { t } = useTranslation('log');
  const now = useNow(1000);
  const toast = useToast();
  const { timer, pauseTimer, resumeTimer, stopTimer, remove } = useLogStore();
  const running = timer?.kind === 'pumping' ? timer : null;
  const elapsed = running ? timerElapsedMs(running, now) : 0;
  return (
    <StackScreen title={t('pumpingSheet.timerTitle')}>
      <TimerCard
        kind="pumping"
        paused={!!running?.pausedAt}
        title={t('pumpingSheet.timerTitle')}
        started={running ? t('pumpingSheet.started', { time: formatTime(running.startedAt) }) : ''}
        elapsed={formatTimer(elapsed)}
        elapsedLabel={formatDuration(elapsed, 'long')}
        onPauseResume={running?.pausedAt ? resumeTimer : pauseTimer}
        onStop={() => {
          const saved = stopTimer({ pumping: { side: 'both', amountMl: 0 } });
          router.back();
          if (saved) toast.show({ message: t('saved.pumping', { time: formatTime(saved.startAt) }), onUndo: () => remove(saved.id) });
        }}
      />
      <SyncStatus state="offline" label={t('nursing.local')} />
    </StackScreen>
  );
}
