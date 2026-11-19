import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { featureStrongBg, type FeatureTone } from '@/constants/tones';

/** Figma `Legend item` (Tone incl. Today = primary). Shown whenever a chart has more than one series. */
export function LegendItem({ label, tone }: { label: string; tone: FeatureTone | 'today' }) {
  return (
    <View className="flex-row items-center gap-xs">
      <View className={`size-[10px] rounded-full ${tone === 'today' ? 'bg-primary-default' : featureStrongBg[tone]}`} />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}
