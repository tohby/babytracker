import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';
import { featureBg, type FeatureTone } from '@/constants/tones';

/**
 * Figma `Since-last tile` (Tone): "how long since…" at a glance. Label (what), value (how long, from format.ts)
 * and detail (last amount/type). Always 3–4 equal tiles in a row.
 */
export function SinceLastTile({
  tone,
  label,
  value,
  detail,
  onPress,
  accessibilityLabel,
}: {
  tone: FeatureTone;
  label: string;
  value: string;
  detail?: string;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      disabled={!onPress}
      onPress={onPress}
      className={`min-h-[128px] flex-1 justify-between rounded-xl p-lg active:opacity-90 ${featureBg[tone]}`}>
      <Text variant="label-small" numberOfLines={2}>
        {label}
      </Text>
      <Text variant="numeric-large" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary" numberOfLines={2}>
        {detail ?? ' '}
      </Text>
    </Pressable>
  );
}
