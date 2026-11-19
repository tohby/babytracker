import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DayStrip } from '@/components/charts/day-strip';
import { LegendItem } from '@/components/charts/legend-item';
import { useLogContext } from '@/components/log/use-log-context';
import { TabScreen } from '@/components/screen';
import { TimelineEntry } from '@/components/tracking/timeline-entry';
import { Card } from '@/components/ui/card';
import { DateStrip } from '@/components/ui/date-strip';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { StateView } from '@/components/ui/state-view';
import { ALL_GROUPS, useTimelineFilter } from '@/data/timeline-filter';
import { useEventText } from '@/hooks/use-event-text';
import { useSession } from '@/hooks/use-session';
import { formatDate, formatDuration, formatNumber, formatTime } from '@/lib/format';
import { dayTotals, eventsOnDay, startOfDay } from '@/lib/log-summary';

/** V2-E01 Timeline · day, E02 empty day, E03 filter (sheet), E04 entry deleted (toast from the detail screen). */
export default function TimelineScreen() {
  const { t } = useTranslation('timeline');
  const { user } = useSession();
  const { name, events, now } = useLogContext();
  const describe = useEventText(events);
  const { filter, setFilter, apply } = useTimelineFilter();
  const [day, setDay] = useState(() => startOfDay(Date.now()));
  const dayEvents = useMemo(() => eventsOnDay(events, day), [events, day]);
  const shown = useMemo(() => apply(dayEvents, user?.name ?? ''), [apply, dayEvents, user]);
  const filtered = filter.groups.length < ALL_GROUPS.length || filter.onlyMe;
  const totals = dayTotals(events, day, now);
  const dayData = {
    dayStart: day,
    sleeps: dayEvents.filter((e) => e.type === 'sleep').map((e) => ({ start: Date.parse(e.startAt), end: e.endAt ? Date.parse(e.endAt) : now })),
    feeds: dayEvents.filter((e) => e.type === 'feed' || e.type === 'nursing').map((e) => Date.parse(e.startAt)),
    nappies: dayEvents.filter((e) => e.type === 'nappy').map((e) => Date.parse(e.startAt)),
  };

  return (
    <TabScreen>
      <Header
        type="large-title"
        title={t('screen.title')}
        eyebrow={t('screen.subtitle', { name })}
        action={<IconButton icon="filter" label={t('screen.filter')} badge={filtered} onPress={() => router.push('/timeline-filter')} />}
      />
      <DateStrip selected={new Date(day)} onSelect={(d) => setDay(startOfDay(d))} onAdd={() => router.push('/log')} />
      {dayEvents.length === 0 ? (
        <StateView
          kind="empty"
          title={t('screen.emptyTitle', { day: formatDate(day, { weekday: 'long' }) })}
          body={t('screen.emptyBody')}
          action={t('screen.emptyAction')}
          onAction={() => router.push('/log')}
        />
      ) : (
        <>
          <Card>
            <DayStrip
              data={dayData}
              label={t('screen.dayStrip', { date: formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' }), sleep: formatDuration(totals.sleepMs, 'long'), feeds: formatNumber(totals.feeds), nappies: formatNumber(totals.nappies) })}
            />
            <View className="flex-row flex-wrap gap-lg">
              <LegendItem tone="sleep" label={t('screen.sleepLegend')} />
              <LegendItem tone="feed" label={t('screen.feedLegend')} />
              <LegendItem tone="nappy" label={t('screen.nappyLegend')} />
            </View>
          </Card>
          {shown.length === 0 ? (
            <StateView kind="empty" size="compact" title={t('screen.emptyFilteredTitle')} body={t('screen.emptyFilteredBody')} action={t('screen.emptyFilteredAction')} onAction={() => setFilter({ groups: ALL_GROUPS, onlyMe: false })} />
          ) : (
            <View>
              {shown.map((e, i) => {
                const text = describe(e);
                return (
                  <TimelineEntry
                    key={e.id}
                    type={e.type}
                    time={formatTime(e.startAt)}
                    title={text.title}
                    detail={text.detail}
                    value={text.value}
                    pendingSync={e.pendingSync}
                    showRail={i < shown.length - 1}
                    onPress={() => router.push({ pathname: '/entry/[id]', params: { id: e.id } })}
                  />
                );
              })}
            </View>
          )}
        </>
      )}
    </TabScreen>
  );
}
