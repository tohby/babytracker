import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatTimeCompact } from '@/lib/format';

const DAY_MS = 86_400_000;

export type DayStripData = {
  /** Local midnight that starts the strip. */
  dayStart: number;
  sleeps: { start: number; end: number }[];
  feeds: number[];
  nappies: number[];
};

/**
 * Figma `Day strip`: 24 h overview. Sleep as blocks, feeds as full-height ticks and nappies as half-height ticks,
 * with five hour labels (Intl, so 12/24 h follows the device). `label` is the text alternative.
 */
export function DayStrip({ data, label }: { data: DayStripData; label: string }) {
  const [width, setWidth] = useState(0);
  const x = (t: number) => Math.max(0, Math.min(1, (t - data.dayStart) / DAY_MS)) * width;
  const ticks = [0, 6, 12, 18, 24].map((h) => data.dayStart + h * 3_600_000);
  return (
    <View className="gap-sm" accessible accessibilityLabel={label}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} className="h-[28px] overflow-hidden rounded-[14px] bg-background-surface-muted">
        {width > 0 && (
          <>
            {data.sleeps.map((s, i) => (
              <View key={`s${i}`} style={{ left: x(s.start), width: Math.max(3, x(s.end) - x(s.start)) }} className="absolute inset-y-0 rounded-[6px] bg-feature-sleep-strong" />
            ))}
            {data.feeds.map((t, i) => (
              <View key={`f${i}`} style={{ left: x(t) }} className="absolute inset-y-0 w-[3px] bg-feature-feed-strong" />
            ))}
            {data.nappies.map((t, i) => (
              <View key={`n${i}`} style={{ left: x(t) }} className="absolute bottom-0 h-[14px] w-[3px] bg-feature-nappy-strong" />
            ))}
          </>
        )}
      </View>
      <View className="flex-row justify-between">
        {ticks.map((t, i) => (
          <Text key={i} variant="caption" tone="tertiary">
            {formatTimeCompact(t)}
          </Text>
        ))}
      </View>
    </View>
  );
}
