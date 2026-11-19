import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

const SIZE = 140;
// Figma ellipse innerRadius 0.86: ring thickness 7% of the diameter.
const STROKE = SIZE * 0.07;

/**
 * Figma `Wake-window ring` (Open / Closing): how far through the wake window the baby is. Arc grows clockwise
 * from 12 o'clock; it turns to the care tone when the window is closing. The centre number is the information.
 */
export function WakeWindowRing({ progress, closing, value, caption, label }: { progress: number; closing: boolean; value: string; caption: string; label: string }) {
  const colors = useThemeColors();
  const r = (SIZE - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View accessible accessibilityLabel={label} style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke={colors['color/feature/sleep']} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke={colors[closing ? 'color/feature/care-strong' : 'color/feature/sleep-strong']}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Text variant="numeric-medium" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="secondary">
        {caption}
      </Text>
    </View>
  );
}
