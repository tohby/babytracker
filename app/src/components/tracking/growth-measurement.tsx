import { View } from 'react-native';

import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';

/**
 * Figma `Growth measurement` (Metric: Weight / Length / Head): latest value and change since the previous entry.
 * Values and dates only; no percentile judgements.
 */
export function GrowthMeasurement({ metric, value, change }: { metric: string; value: string; change?: string }) {
  return (
    <View accessible className="flex-1 gap-xs rounded-xl border border-border-default bg-background-surface p-lg">
      <View className="flex-row items-center gap-sm">
        <IconTile icon="log-growth" tone="care" compact />
        <Text variant="label-large" tone="secondary" numberOfLines={1} className="flex-shrink">
          {metric}
        </Text>
      </View>
      <Text variant="numeric-large" tabular numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {!!change && (
        <Text variant="caption" tone="success">
          {change}
        </Text>
      )}
    </View>
  );
}
