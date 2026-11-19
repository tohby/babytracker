import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';
import { useThemeColors } from '@/hooks/use-theme-colors';

export type LinePoint = { t: number; value: number };

const PLOT_H = 150;
const PAD = 8;

/**
 * Figma `Line chart` (Metric: Weight / Length / Head). The parent's own entries as points on a line; the shaded
 * band is the WHO reference range for context only (labelled, never judged). Latest value printed and teal.
 */
export function LineChart({
  metricLabel,
  latestValue,
  points,
  band,
  axisLabels,
  legend,
  summary,
}: {
  metricLabel: string;
  latestValue: string;
  points: LinePoint[];
  /** Reference range at each point in time (lower, upper), same x domain as `points`. */
  band?: { t: number; low: number; high: number }[];
  axisLabels: string[];
  legend?: string;
  summary: string;
}) {
  const colors = useThemeColors();
  const shadow = useElevation('card');
  const [width, setWidth] = useState(0);
  const all = [...points.map((p) => p.value), ...(band ?? []).flatMap((b) => [b.low, b.high])];
  const ts = [...points.map((p) => p.t), ...(band ?? []).map((b) => b.t)];
  const [minV, maxV] = [Math.min(...all), Math.max(...all)];
  const [minT, maxT] = [Math.min(...ts), Math.max(...ts)];
  const sx = (t: number) => PAD + ((t - minT) / Math.max(1, maxT - minT)) * (width - PAD * 2);
  const sy = (v: number) => PAD + (1 - (v - minV) / Math.max(1e-6, maxV - minV)) * (PLOT_H - PAD * 2);
  const bandPath =
    band && band.length > 1
      ? `M${band.map((b) => `${sx(b.t)},${sy(b.high)}`).join(' L')} L${[...band].reverse().map((b) => `${sx(b.t)},${sy(b.low)}`).join(' L')} Z`
      : undefined;

  return (
    <View style={{ boxShadow: shadow }} className="gap-md rounded-2xl bg-background-surface p-page">
      <View>
        <Text variant="label-large" tone="secondary">
          {metricLabel}
        </Text>
        <Text variant="numeric-large" tabular>
          {latestValue}
        </Text>
      </View>
      <View accessible accessibilityLabel={summary} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: PLOT_H }}>
        {width > 0 && points.length > 0 && (
          <Svg width={width} height={PLOT_H}>
            {bandPath && <Path d={bandPath} fill={colors['color/feature/care']} opacity={0.6} />}
            <Polyline
              points={points.map((p) => `${sx(p.t)},${sy(p.value)}`).join(' ')}
              stroke={colors['color/feature/care-strong']}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {points.map((p, i) => {
              const last = i === points.length - 1;
              return (
                <Circle
                  key={i}
                  cx={sx(p.t)}
                  cy={sy(p.value)}
                  r={last ? 6 : 4}
                  fill={colors[last ? 'color/primary/default' : 'color/feature/care-strong']}
                  stroke={colors['color/background/surface']}
                  strokeWidth={2}
                />
              );
            })}
          </Svg>
        )}
      </View>
      <View className="flex-row justify-between">
        {axisLabels.map((l, i) => (
          <Text key={i} variant="caption" tone="tertiary">
            {l}
          </Text>
        ))}
      </View>
      {legend && (
        <View className="flex-row items-center gap-[6px]">
          <View className="h-sm w-[14px] rounded-[4px] bg-feature-care" />
          <Text variant="caption" tone="secondary">
            {legend}
          </Text>
        </View>
      )}
    </View>
  );
}
