import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { featureBg, type FeatureTone } from '@/constants/tones';
import { useElevation } from '@/hooks/use-elevation';

export type WeekChartDay = {
  /** Short weekday label, already localised (Intl). */
  label: string;
  value: number;
  /** Value printed on today's bar, formatted. */
  valueLabel: string;
  today: boolean;
};

const PLOT = 150;
const BAR_MAX = 136;

/**
 * Figma `Week chart` (Metric: Sleep / Feeds / Nappies): seven bars, today teal with its value printed on it,
 * a dashed average line with a label, axis pills under each bar. `summary` is the text alternative.
 */
export function WeekChart({
  title,
  range,
  tone,
  days,
  average,
  averageLabel,
  summary,
  selectedIndex,
  onSelect,
}: {
  title: string;
  range: string;
  tone: Extract<FeatureTone, 'sleep' | 'feed' | 'nappy'>;
  days: WeekChartDay[];
  average: number;
  averageLabel: string;
  /** Screen-reader summary, e.g. "Sleep this week: 11.6 hours a day on average." */
  summary: string;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}) {
  const shadow = useElevation('card');
  const max = Math.max(average, ...days.map((d) => d.value), 1);
  const scale = (v: number) => (v / max) * BAR_MAX;
  const avgBottom = scale(average);

  return (
    <View style={{ boxShadow: shadow }} className="gap-lg rounded-2xl bg-background-surface p-page">
      <View className="flex-row items-center justify-between gap-md">
        <Text variant="heading" accessibilityRole="header" className="flex-shrink">
          {title}
        </Text>
        <Badge label={range} />
      </View>
      <View accessible accessibilityLabel={summary}>
        <View style={{ height: PLOT }} className="flex-row items-end justify-between">
          {days.map((day, i) => {
            // Only today is teal in Figma; a selected-bar style isn't designed (see gaps list).
            const highlight = day.today;
            return (
              <Pressable
                key={i}
                disabled={!onSelect}
                onPress={() => onSelect?.(i)}
                accessibilityElementsHidden
                accessibilityState={{ selected: i === selectedIndex }}
                style={{ height: Math.max(8, scale(day.value)) }}
                className={`w-[36px] items-center rounded-[10px] pt-xs ${highlight ? 'bg-primary-default' : featureBg[tone]}`}>
                {day.today && (
                  <Text variant="label-small" tone="on-primary" numberOfLines={1} adjustsFontSizeToFit>
                    {day.valueLabel}
                  </Text>
                )}
              </Pressable>
            );
          })}
          {/* Average: 1 pt dashed ink line with an ink label pill. */}
          <View pointerEvents="none" style={{ bottom: avgBottom }} className="absolute inset-x-0 flex-row items-center">
            <View className="h-0 flex-1 border-t border-dashed border-border-focus" />
            <View className="h-page items-center justify-center rounded-full bg-text-primary px-sm">
              <Text variant="caption" tone="inverse" numberOfLines={1}>
                {averageLabel}
              </Text>
            </View>
          </View>
        </View>
        <View className="mt-lg flex-row justify-between">
          {days.map((day, i) => (
            <View
              key={i}
              className={`h-xl w-[36px] items-center justify-center rounded-full border border-border-default ${day.today ? 'bg-primary-subtle' : ''}`}>
              <Text variant="caption" tone={day.today ? 'link' : 'tertiary'} numberOfLines={1}>
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
