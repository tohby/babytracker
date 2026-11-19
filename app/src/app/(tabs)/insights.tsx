import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@/components/charts/stat-card';
import { WeekChart } from '@/components/charts/week-chart';
import { useLogContext } from '@/components/log/use-log-context';
import { TabScreen } from '@/components/screen';
import { DaySummary } from '@/components/tracking/day-summary';
import { Chip } from '@/components/ui/chip';
import { Header } from '@/components/ui/header';
import { IconTile } from '@/components/ui/icon-tile';
import { InsightCard } from '@/components/ui/insight-card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StateView } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { durationMs } from '@/data/log-events';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { formatDate, formatDuration, formatNumber, formatWeight } from '@/lib/format';
import { dayTotals, eventsOnDay, startOfDay } from '@/lib/log-summary';
import { sleepNeed } from '@/lib/onboarding/age';

const DAY = 86_400_000;
type Metric = 'sleep' | 'feeds' | 'nappies';

/** V2-F01 Insights · day and F02 Insights · week. Month has no V2 frame; it reuses the week layout per week. */
export default function InsightsScreen() {
  const { t } = useTranslation('insights');
  const tc = useTranslation('home').t;
  const tu = useTranslation().t;
  const { baby, name, events, now } = useLogContext();
  const { prefs } = useFormatPrefs();
  const [range, setRange] = useState<'day' | 'week' | 'month'>('day');
  const [metric, setMetric] = useState<Metric>('sleep');
  const today = startOfDay(now);
  const enough = events.length > 0;

  const naps = (from: number, to: number) => events.filter((e) => e.type === 'sleep' && e.endAt && Date.parse(e.startAt) >= from && Date.parse(e.startAt) < to && new Date(e.startAt).getHours() >= 6 && new Date(e.startAt).getHours() < 19).map((e) => durationMs(e)!);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

  const value = (d: number, m: Metric) => {
    const x = dayTotals(events, d, Math.min(now, d + DAY));
    return m === 'sleep' ? x.sleepMs / 3_600_000 : m === 'feeds' ? x.feeds : x.nappies;
  };
  const chart = useMemo(() => {
    if (range === 'day') return null;
    if (range === 'week') {
      const days = Array.from({ length: 7 }, (_, i) => today - (6 - i) * DAY);
      return days.map((d, i) => ({ label: formatDate(d, { weekday: 'short' }), value: value(d, metric), today: i === 6 }));
    }
    const weeks = Array.from({ length: 4 }, (_, i) => today - (3 - i) * 7 * DAY - 6 * DAY);
    return weeks.map((w, i) => ({ label: t('week.weekOf', { date: formatDate(w, { day: 'numeric', month: 'numeric' }) }), value: avg(Array.from({ length: 7 }, (_, k) => value(w + k * DAY, metric))), today: i === 3 }));
  }, [range, metric, events, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (v: number) => (metric === 'sleep' ? t('week.hours', { value: formatNumber(v, { maximumFractionDigits: 1 }) }) : formatNumber(v, { maximumFractionDigits: 1 }));

  const thisWeek = avg(naps(today - 6 * DAY, today + DAY));
  const lastWeek = avg(naps(today - 13 * DAY, today - 6 * DAY));
  const diff = thisWeek - lastWeek;
  const trend = Math.abs(diff) < 5 * 60_000 ? 'steady' : diff > 0 ? 'longer' : 'shorter';
  const growth = events.find((e) => e.growth?.weightG);

  let body;
  if (!enough) {
    body = <StateView kind="empty" title={t('insight.emptyTitle')} body={t('insight.emptyBody')} action={t('insight.emptyAction')} onAction={() => router.push('/log')} />;
  } else if (range === 'day') {
    const totals = dayTotals(events, today, now);
    const yesterday = dayTotals(events, today - DAY, today);
    const todayNaps = naps(today, today + DAY);
    const longest = Math.max(0, ...events.filter((e) => e.type === 'sleep' && e.endAt && Date.parse(e.endAt) > today).map((e) => durationMs(e)!));
    const bottles = events.filter((e) => e.bottle && Date.parse(e.startAt) >= today).reduce((s, e) => s + e.bottle!.amountMl, 0);
    const change = (a: number, b: number, f: (n: number) => string) => (b === 0 && a === 0 ? t('stats.noCompare') : a === b ? t('stats.sameAsYesterday') : t(a > b ? 'stats.moreThanYesterday' : 'stats.lessThanYesterday', { value: f(Math.abs(a - b)) }));
    body = (
      <>
        <DaySummary
          title={tc('v2.summary.title')}
          date={formatDate(now, { weekday: 'short', day: 'numeric', month: 'short' })}
          sleep={{ value: formatDuration(totals.sleepMs), label: tc('v2.summary.sleep'), change: change(totals.sleepMs, yesterday.sleepMs, (n) => formatDuration(n)) }}
          feeds={{ value: formatNumber(totals.feeds), label: tc('v2.summary.feeds'), change: change(totals.feeds, yesterday.feeds, (n) => formatNumber(n)) }}
          nappies={{ value: formatNumber(totals.nappies), label: tc(prefs.nappyWord === 'diaper' ? 'v2.summary.diapers' : 'v2.summary.nappies'), change: change(totals.nappies, yesterday.nappies, (n) => formatNumber(n)) }}
        />
        <View className="gap-md">
          <View className="flex-row gap-md">
            <StatCard label={t('stats.longestSleep')} value={formatDuration(longest)} />
            <StatCard label={t('stats.naps')} value={formatNumber(todayNaps.length)} />
          </View>
          <View className="flex-row gap-md">
            <StatCard label={t('stats.avgWake')} value={formatDuration(avg(gaps(events, today)))} />
            <StatCard label={t('stats.bottleTotal')} value={bottles ? formatNumber(bottles) : '—'} />
          </View>
        </View>
        {thisWeek > 0 && (
          <InsightCard
            tone="sleep"
            icon="moon"
            title={t(`insight.${trend}Title`)}
            body={t(`insight.${trend}Body`, { name, avg: formatDuration(thisWeek), diff: formatDuration(Math.abs(diff)) })}
            link={t('insight.seeWeek')}
            onLink={() => setRange('week')}
          />
        )}
      </>
    );
  } else {
    const need = baby ? sleepNeed(baby.birth_date) : null;
    const average = avg(chart!.map((d) => d.value));
    const titleKey = range === 'week' ? `${metric}Title` : `month${metric[0].toUpperCase()}${metric.slice(1)}`;
    body = (
      <>
        <View className="flex-row flex-wrap gap-sm">
          {(['sleep', 'feeds', 'nappies'] as const).map((m) => (
            <Chip key={m} label={t(`metric.${m}`)} variant={metric === m ? 'selected' : 'outline'} selected={metric === m} onPress={() => setMetric(m)} />
          ))}
        </View>
        <Text variant="body-small" tone="secondary">
          {metric === 'sleep' && need
            ? t('week.sleepSummary', { name, value: fmt(average), min: t('week.hours', { value: need.min }), max: t('week.hours', { value: need.max }) })
            : t(metric === 'feeds' ? 'week.feedsSummary' : 'week.nappiesSummary', { name, value: formatNumber(average, { maximumFractionDigits: 1 }) })}
        </Text>
        <WeekChart
          title={t(`week.${titleKey}` as 'week.sleepTitle')}
          range={tu('units.range', { start: formatDate(today - (range === 'week' ? 6 : 27) * DAY, { day: 'numeric', month: 'short' }), end: formatDate(today, { day: 'numeric', month: 'short' }) })}
          tone={metric === 'sleep' ? 'sleep' : metric === 'feeds' ? 'feed' : 'nappy'}
          days={chart!.map((d) => ({ ...d, valueLabel: fmt(d.value) }))}
          average={average}
          averageLabel={t('week.avg', { value: fmt(average) })}
          summary={t('week.avg', { value: fmt(average) })}
        />
        <ListGroup>
          <ListRow leading={<IconTile icon="clock" tone="sleep" />} title={t('week.wakeReport')} subtitle={t('week.wakeReportDetail', { name })} trailing={{ kind: 'chevron' }} onPress={() => router.push('/plus')} />
          <ListRow
            leading={<IconTile icon="log-growth" tone="care" />}
            title={t('week.growth')}
            subtitle={growth ? t('week.growthDetail', { weight: formatWeight(growth.growth!.weightG!), date: formatDate(growth.startAt, { day: 'numeric', month: 'short' }) }) : t('week.growthNone')}
            trailing={{ kind: 'chevron' }}
            onPress={() => router.push('/growth')}
          />
        </ListGroup>
      </>
    );
  }

  return (
    <TabScreen>
      <Header type="large-title" title={t('title')} eyebrow={t('subtitle', { name })} />
      <SegmentedControl label={t('range.label')} value={range} onChange={setRange} options={[{ value: 'day', label: t('range.day') }, { value: 'week', label: t('range.week') }, { value: 'month', label: t('range.month') }]} />
      {body}
    </TabScreen>
  );
}

/** Wake windows today: gaps between the end of one sleep and the start of the next. */
function gaps(events: ReturnType<typeof eventsOnDay>, dayStart: number): number[] {
  const sleeps = events.filter((e) => e.type === 'sleep' && e.endAt).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const out: number[] = [];
  for (let i = 1; i < sleeps.length; i++) {
    const s = Date.parse(sleeps[i].startAt);
    const e = Date.parse(sleeps[i - 1].endAt!);
    if (s >= dayStart && s > e && s - e < 6 * 3_600_000) out.push(s - e);
  }
  return out;
}
