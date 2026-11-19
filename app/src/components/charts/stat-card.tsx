import { View } from 'react-native';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/** Figma `Stat card`: one metric with context (value, what it is, change vs last period in words). 2 per row. */
export function StatCard({ label, value, change, changeTone = 'success' }: { label: string; value: string; change?: string; changeTone?: BadgeTone }) {
  const shadow = useElevation('card');
  return (
    <View style={{ boxShadow: shadow }} className="flex-1 gap-xs rounded-xl bg-background-surface p-lg">
      <Text variant="label-small" tone="secondary">
        {label}
      </Text>
      <Text variant="numeric-large" tabular>
        {value}
      </Text>
      {change && <Badge label={change} tone={changeTone} />}
    </View>
  );
}
