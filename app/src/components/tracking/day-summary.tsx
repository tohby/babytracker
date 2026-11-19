import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import type { IconName } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { featureBg } from '@/constants/tones';
import { useElevation } from '@/hooks/use-elevation';

type Total = { value: string; label: string; change: string };

/**
 * Figma `Day summary`: totals for sleep, feeds and nappies with the change versus the 7-day average in words.
 */
export function DaySummary({ title, date, sleep, feeds, nappies }: { title: string; date: string; sleep: Total; feeds: Total; nappies: Total }) {
  const shadow = useElevation('card');
  const tiles: { key: string; tone: 'sleep' | 'feed' | 'nappy'; icon: IconName; total: Total }[] = [
    { key: 'sleep', tone: 'sleep', icon: 'moon', total: sleep },
    { key: 'feeds', tone: 'feed', icon: 'bottle', total: feeds },
    { key: 'nappies', tone: 'nappy', icon: 'log-nappy', total: nappies },
  ];
  return (
    <View style={{ boxShadow: shadow }} className="gap-lg rounded-2xl bg-background-surface p-page">
      <View className="flex-row items-center justify-between gap-md">
        <Text variant="heading" accessibilityRole="header" className="flex-shrink">
          {title}
        </Text>
        <Badge label={date} />
      </View>
      <View className="flex-row gap-sm">
        {tiles.map(({ key, tone, icon, total }) => (
          <View key={key} accessible className={`flex-1 gap-xs rounded-lg p-md ${featureBg[tone]}`}>
            <IconTile icon={icon} tone="surface" compact />
            <Text variant="numeric-medium" tabular numberOfLines={1} adjustsFontSizeToFit>
              {total.value}
            </Text>
            <Text variant="label-small" numberOfLines={1}>
              {total.label}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={2}>
              {total.change}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
