import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LineChart } from '@/components/charts/line-chart';
import { useLogContext } from '@/components/log/use-log-context';
import { StackScreen } from '@/components/screen';
import { GrowthMeasurement } from '@/components/tracking/growth-measurement';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StateView } from '@/components/ui/state-view';
import { formatDate, formatLength, formatWeight } from '@/lib/format';

type Metric = 'weight' | 'length' | 'head';
const field = { weight: 'weightG', length: 'lengthMm', head: 'headMm' } as const;

/**
 * V2-F03 Growth. The WHO reference band isn't drawn: the app has no WHO data set yet (see gaps list), and a
 * made-up band would be worse than none. Measurements live on this phone, so the F03b load error can't occur yet.
 */
export default function GrowthScreen() {
  const { t } = useTranslation('insights');
  const { name, events } = useLogContext();
  const [metric, setMetric] = useState<Metric>('weight');
  const fmt = (m: Metric, v: number) => (m === 'weight' ? formatWeight(v) : formatLength(v));
  const series = (m: Metric) =>
    events
      .filter((e) => e.growth?.[field[m]])
      .map((e) => ({ t: Date.parse(e.startAt), value: e.growth![field[m]]! }))
      .sort((a, b) => a.t - b.t);
  const points = series(metric);
  const latest = (m: Metric) => {
    const s = series(m);
    if (!s.length) return null;
    const last = s[s.length - 1];
    const prev = s[s.length - 2];
    return {
      value: fmt(m, last.value),
      change: prev ? t(last.value >= prev.value ? 'growth.sinceMore' : 'growth.sinceLess', { value: fmt(m, Math.abs(last.value - prev.value)), date: formatDate(prev.t, { day: 'numeric', month: 'short' }) }) : undefined,
    };
  };
  const others = (['weight', 'length', 'head'] as const).filter((m) => m !== metric);
  const axis = points.length ? [points[0].t, points[points.length - 1].t].map((x) => formatDate(x, { month: 'short' })) : [];
  return (
    <StackScreen title={t('growth.title')} footer={<Button label={t('growth.add')} onPress={() => router.push('/log/growth')} />}>
      <SegmentedControl label={t('growth.title')} value={metric} onChange={setMetric} options={(['weight', 'length', 'head'] as const).map((m) => ({ value: m, label: t(`growth.${m}`) }))} />
      {points.length === 0 ? (
        <StateView kind="empty" title={t('growth.emptyTitle')} body={t('growth.emptyBody', { name })} />
      ) : (
        <LineChart
          metricLabel={t(`growth.${metric}`)}
          latestValue={fmt(metric, points[points.length - 1].value)}
          points={points}
          axisLabels={axis}
          summary={t('growth.chartSummary', { metric: t(`growth.${metric}`), count: points.length, value: fmt(metric, points[points.length - 1].value) })}
        />
      )}
      <View className="flex-row gap-md">
        {others.map((m) => {
          const l = latest(m);
          return l ? <GrowthMeasurement key={m} metric={t(`growth.${m}`)} value={l.value} change={l.change} /> : null;
        })}
      </View>
    </StackScreen>
  );
}
