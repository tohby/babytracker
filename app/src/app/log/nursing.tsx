import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { SideToggle, type Side } from '@/components/tracking/side-toggle';
import { TimerCard } from '@/components/tracking/timer-card';
import { InsightCard } from '@/components/ui/insight-card';
import { SyncStatus } from '@/components/ui/sync-status';
import { useToast } from '@/components/ui/toast';
import { timerElapsedMs, timerSideMs } from '@/data/log-events';
import { useLogStore } from '@/data/log-store';
import { useNow } from '@/hooks/use-now';
import { formatDuration, formatTime, formatTimer, formatTimerShort } from '@/lib/format';

/** V2-D06 Nursing timer: Timer card with the Side toggle, a "start on the … next time" hint, honest sync line. */
export default function NursingScreen() {
  const { t } = useTranslation('log');
  const { babyId, events } = useLogContext();
  const now = useNow(1000);
  const toast = useToast();
  const { timer, startTimer, switchSide, pauseTimer, resumeTimer, stopTimer, remove } = useLogStore();
  const running = timer?.kind === 'nursing' ? timer : null;
  const last = events.find((e) => e.nursing);
  const suggested: Side = last?.nursing?.lastSide === 'left' ? 'right' : 'left';
  const sides = running ? timerSideMs(running, now) : { left: 0, right: 0 };
  const elapsed = running ? timerElapsedMs(running, now) : 0;
  const select = (side: Side) => (running ? switchSide(side) : startTimer('nursing', babyId, { side }));
  const stop = () => {
    const saved = stopTimer();
    router.back();
    if (saved) toast.show({ message: t('saved.nursing', { time: formatTime(saved.startAt) }), onUndo: () => remove(saved.id) });
  };
  return (
    <StackScreen title={t('nursing.title')}>
      <TimerCard
        kind="nursing"
        paused={!!running?.pausedAt}
        title={t('nursing.title')}
        started={running ? t('nursing.started', { time: formatTime(running.startedAt), left: formatTimerShort(sides.left), right: formatTimerShort(sides.right) }) : t('nursing.notStarted')}
        elapsed={formatTimer(elapsed)}
        elapsedLabel={formatDuration(elapsed, 'long')}
        onPauseResume={running?.pausedAt ? resumeTimer : pauseTimer}
        onStop={stop}>
        <SideToggle
          active={running?.side ?? null}
          times={{ left: sides.left || running?.side === 'left' ? formatTimerShort(sides.left) : null, right: sides.right || running?.side === 'right' ? formatTimerShort(sides.right) : null }}
          onSelect={select}
        />
      </TimerCard>
      {last?.nursing && last.endAt && (
        <InsightCard
          tone="feed"
          icon="log-nursing"
          title={t('nursing.startOn', { side: t(suggested === 'left' ? 'nursing.left' : 'nursing.right') })}
          body={t('nursing.lastEnded', { side: t(last.nursing.lastSide === 'left' ? 'nursing.left' : 'nursing.right'), time: formatTime(last.endAt) })}
        />
      )}
      <SyncStatus state="offline" label={t('nursing.local')} />
    </StackScreen>
  );
}
