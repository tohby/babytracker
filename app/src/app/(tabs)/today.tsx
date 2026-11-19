import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TabScreen } from '@/components/screen';
import { DaySummary } from '@/components/tracking/day-summary';
import { NextNapCard } from '@/components/tracking/next-nap-card';
import { SinceLastTile } from '@/components/tracking/since-last-tile';
import { TimerCard } from '@/components/tracking/timer-card';
import { Banner } from '@/components/ui/banner';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { StateView } from '@/components/ui/state-view';
import { SyncStatus } from '@/components/ui/sync-status';
import { Text } from '@/components/ui/text';
import { Tooltip } from '@/components/ui/tooltip';
import { timerElapsedMs } from '@/data/log-events';
import { useBabyEvents, useLogStore } from '@/data/log-store';
import { useCurrentBaby } from '@/hooks/use-current-baby';
import { useEventText } from '@/hooks/use-event-text';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { useNow } from '@/hooks/use-now';
import { useSession } from '@/hooks/use-session';
import { elapsedMs, formatDate, formatDuration, formatNumber, formatTime, formatTimer } from '@/lib/format';
import { getGreetingPeriod } from '@/lib/greeting';
import { dayTotals, feedDue, lastOf, sevenDayAverage, startOfDay } from '@/lib/log-summary';
import { predictNextNap } from '@/lib/prediction';

const TIP_KEY = 'nappa.tip.logButton';

/** V2-C01–C05 Today: the daily dashboard (normal, nap running, first day, loading, offline). */
export default function TodayScreen() {
  const { t } = useTranslation('home');
  const now = useNow(timerTick());
  const { user, offline: sessionOffline } = useSession();
  const { baby, loading: babiesLoading, failed } = useCurrentBaby();
  const { ready, timer, pauseTimer, resumeTimer, stopTimer } = useLogStore();
  const events = useBabyEvents(baby?.id);
  const describe = useEventText(events);
  const { prefs } = useFormatPrefs();
  const [showTip, setShowTip] = useState(false);
  const name = baby?.name ?? '';

  const prediction = useMemo(
    () => predictNextNap(events, baby?.birth_date ?? null, now, baby?.usual_wake_time ?? null),
    [events, baby, now],
  );
  const firstDay = ready && events.length === 0;
  useEffect(() => {
    if (!firstDay) return;
    AsyncStorage.getItem(TIP_KEY).then((v) => setShowTip(!v)).catch(() => {});
  }, [firstDay]);
  const dismissTip = () => {
    setShowTip(false);
    AsyncStorage.setItem(TIP_KEY, '1').catch(() => {});
  };

  const header = (
    <Header
      type="home"
      eyebrow={t(`greeting.${getGreetingPeriod(new Date(now))}`)}
      title={name ? t('familyName', { name }) : t('familyNameFallback')}
      avatar={{ initials: (user?.name ?? user?.email ?? '').slice(0, 1).toUpperCase(), photo: user?.avatar_url ? { uri: user.avatar_url } : undefined }}
      action={<IconButton icon="settings" label={t('openSettings')} onPress={() => router.push('/settings')} />}
    />
  );

  // C04 loading: the saved logs or the baby aren't back yet.
  if (!ready || (babiesLoading && !baby)) {
    return (
      <TabScreen>
        {header}
        <Skeleton type="card" />
        <Skeleton type="row" />
        <Skeleton type="tiles" />
        <View className="flex-row items-center gap-sm">
          <Spinner />
          <Text variant="body-small" tone="secondary">
            {t('v2.loading')}
          </Text>
        </View>
      </TabScreen>
    );
  }

  const offline = sessionOffline || failed;
  const pending = events.filter((e) => e.pendingSync).length;
  const lastFeed = lastOf(events, ['feed', 'nursing', 'solids']);
  const lastSleep = events.find((e) => e.type === 'sleep');
  const lastNappy = lastOf(events, 'nappy');
  const due = feedDue(events, now);
  const today = startOfDay(now);
  const totals = dayTotals(events, today, now);
  const avg = sevenDayAverage(events, today);
  const sleepingNow = timer?.kind === 'sleep';

  const change = (value: number, base: number | undefined, fmt: (n: number) => string) => {
    if (base === undefined) return t('v2.summary.noAvg');
    const diff = value - base;
    if (Math.abs(diff) < (fmt === formatNumberRound ? 0.5 : 5 * 60_000)) return t('v2.summary.same');
    return t(diff > 0 ? 'v2.summary.more' : 'v2.summary.less', { value: fmt(Math.abs(diff)) });
  };

  const nextNap = (() => {
    if (prediction.state === 'too-young') {
      return <NextNapCard state="too-young" chip={t('v2.nextNap.tooYoungChip')} title={t('v2.nextNap.tooYoungTitle')} body={t('v2.nextNap.tooYoungBody')} accessibilityLabel={t('v2.nextNap.tooYoungTitle')} onPress={() => router.push('/next-nap')} />;
    }
    if (prediction.state === 'learning') {
      const left = prediction.napsNeeded - prediction.napsLogged;
      return (
        <NextNapCard
          state="learning"
          chip={t('v2.nextNap.learningChip')}
          title={t('v2.nextNap.learningTitle', { name })}
          body={t('v2.nextNap.learningBody', { count: left })}
          progress={prediction.napsLogged / prediction.napsNeeded}
          progressLabel={t('v2.nextNap.learningProgress', { logged: prediction.napsLogged, needed: prediction.napsNeeded })}
          accessibilityLabel={t('v2.nextNap.learningTitle', { name })}
          onPress={() => router.push('/next-nap')}
        />
      );
    }
    const until = prediction.windowStart - now;
    const age = prediction.basis === 'age' && !events.some((e) => e.type === 'sleep');
    return (
      <NextNapCard
        state="predicted"
        countdown={age ? t('v2.nextNap.basedOnAge') : until > 60_000 ? t('v2.nextNap.countdown', { duration: formatDuration(until, 'short') }) : t('v2.nextNap.now')}
        time={formatTime(prediction.windowStart)}
        window={age ? t('v2.nextNap.personalise') : t('v2.nextNap.window', { time: formatTime(prediction.windowEnd) })}
        accessibilityLabel={t('v2.nextNap.a11y', { time: formatTime(prediction.windowStart) })}
        onPress={() => router.push('/next-nap')}
      />
    );
  })();

  const tile = (label: string, value: string, detail: string) => ({ label, value, detail, a11y: t('v2.tiles.a11y', { label, value, detail }) });
  const feedTile = tile(
    t('v2.tiles.lastFeed'),
    lastFeed ? formatDuration(elapsedMs(lastFeed.startAt, now)) : t('tiles.empty'),
    lastFeed ? (describe(lastFeed).value ? t('v2.tiles.feedDetail', { what: describe(lastFeed).title, amount: describe(lastFeed).value }) : describe(lastFeed).title) : t('v2.tiles.noFeeds'),
  );
  const sleepTile = sleepingNow
    ? tile(t('v2.tiles.asleepFor'), formatDuration(timerElapsedMs(timer!, now)), t('v2.tiles.fellAsleep', { time: formatTime(timer!.startedAt) }))
    : tile(
        t('v2.tiles.awakeFor'),
        lastSleep?.endAt ? formatDuration(elapsedMs(lastSleep.endAt, now)) : t('tiles.empty'),
        lastSleep?.endAt ? t('v2.tiles.woke', { time: formatTime(lastSleep.endAt) }) : t('v2.tiles.logNap'),
      );
  const nappyTile = tile(
    t(prefs.nappyWord === 'diaper' ? 'v2.tiles.lastDiaper' : 'v2.tiles.lastNappy'),
    lastNappy ? formatDuration(elapsedMs(lastNappy.startAt, now)) : t('tiles.empty'),
    lastNappy ? (describe(lastNappy).detail ?? '') : t('v2.tiles.noneYet'),
  );

  return (
    <TabScreen>
      {header}
      {offline && <Banner type="offline" message={t('v2.offline', { count: pending })} action={t('v2.offlineDetails')} onAction={() => router.push('/sync')} />}
      {sleepingNow && timer ? (
        <TimerCard
          kind="sleep"
          paused={!!timer.pausedAt}
          title={t('v2.nap.title', { name })}
          started={t('v2.nap.started', { time: formatTime(timer.startedAt) })}
          elapsed={formatTimer(timerElapsedMs(timer, now))}
          elapsedLabel={formatDuration(timerElapsedMs(timer, now), 'long')}
          onPauseResume={timer.pausedAt ? resumeTimer : pauseTimer}
          onStop={() => {
            const saved = stopTimer();
            if (saved) router.push({ pathname: '/log/saved', params: { id: saved.id } });
          }}
        />
      ) : (
        nextNap
      )}
      {due && (
        <ListGroup>
          <ListRow
            leading={<IconTile icon="bottle" tone="feed" />}
            title={t('v2.feedDue.title', { time: formatTime(due.dueAt) })}
            subtitle={
              lastFeed && describe(lastFeed).value
                ? t('v2.feedDue.detail', { interval: formatDuration(due.intervalMs, 'long'), amount: describe(lastFeed).value })
                : t('v2.feedDue.detailPlain', { interval: formatDuration(due.intervalMs, 'long') })
            }
            trailing={{ kind: 'value', value: due.dueAt > now ? t('v2.feedDue.in', { duration: formatDuration(due.dueAt - now) }) : t('v2.feedDue.overdue') }}
            onPress={() => router.push('/log/feed')}
          />
        </ListGroup>
      )}
      <View className="flex-row items-center justify-between gap-sm">
        <Text variant="heading" accessibilityRole="header">
          {t('sinceLast.heading')}
        </Text>
        <SyncStatus state="offline" label={offline ? t('v2.sync.offline') : t('v2.sync.local')} />
      </View>
      <View className="flex-row gap-md">
        <SinceLastTile tone="feed" label={feedTile.label} value={feedTile.value} detail={feedTile.detail} accessibilityLabel={feedTile.a11y} onPress={() => router.push('/log/feed')} />
        <SinceLastTile tone="sleep" label={sleepTile.label} value={sleepTile.value} detail={sleepTile.detail} accessibilityLabel={sleepTile.a11y} onPress={() => router.push(sleepingNow ? '/log/sleep-timer' : '/log/nap')} />
        <SinceLastTile tone="nappy" label={nappyTile.label} value={nappyTile.value} detail={nappyTile.detail} accessibilityLabel={nappyTile.a11y} onPress={() => router.push('/log/nappy')} />
      </View>
      {firstDay ? (
        <StateView kind="empty" size="compact" title={t('v2.firstDay.title', { name })} body={t('v2.firstDay.body')} action={t('v2.firstDay.link')} onAction={() => router.push('/log')} />
      ) : (
        <DaySummary
          title={t('v2.summary.title')}
          date={formatDate(now, { weekday: 'short', day: 'numeric', month: 'short' })}
          sleep={{ value: formatDuration(totals.sleepMs), label: t('v2.summary.sleep'), change: change(totals.sleepMs, avg?.sleepMs, (n) => formatDuration(n)) }}
          feeds={{ value: formatNumber(totals.feeds), label: t('v2.summary.feeds'), change: change(totals.feeds, avg?.feeds, formatNumberRound) }}
          nappies={{ value: formatNumber(totals.nappies), label: t(prefs.nappyWord === 'diaper' ? 'v2.summary.diapers' : 'v2.summary.nappies'), change: change(totals.nappies, avg?.nappies, formatNumberRound) }}
        />
      )}
      {showTip && (
        <View className="items-end">
          <Tooltip text={t('v2.firstDay.tip')} onDismiss={dismissTip} />
        </View>
      )}
    </TabScreen>
  );
}

function formatNumberRound(n: number) {
  return formatNumber(Math.round(n));
}

/** Tick every second while a timer could be on screen; the cost is one render per second on Today only. */
function timerTick() {
  return 1000;
}
