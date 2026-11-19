import { View } from 'react-native';

export type ProgressTone = 'brand' | 'sleep' | 'feed' | 'nappy';

const track: Record<ProgressTone, string> = {
  brand: 'bg-primary-subtle',
  sleep: 'bg-feature-sleep',
  feed: 'bg-feature-feed',
  nappy: 'bg-feature-nappy',
};
const fill: Record<ProgressTone, string> = {
  brand: 'bg-primary-default',
  sleep: 'bg-feature-sleep-strong',
  feed: 'bg-feature-feed-strong',
  nappy: 'bg-feature-nappy-strong',
};

/** Figma `Progress bar` (Tone): determinate, 8 high, fully rounded. Always pair with a label or value. */
export function ProgressBar({ value, tone = 'brand', label }: { value: number; tone?: ProgressTone; label: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      className={`h-sm overflow-hidden rounded-full ${track[tone]}`}>
      <View style={{ width: `${pct * 100}%` }} className={`h-full rounded-full ${fill[tone]}`} />
    </View>
  );
}
