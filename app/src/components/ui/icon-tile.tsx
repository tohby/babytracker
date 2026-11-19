import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { featureBg, type FeatureTone } from '@/constants/tones';

export type IconTileTone = FeatureTone | 'neutral' | 'brand' | 'surface' | 'error';

const fill: Record<IconTileTone, string> = {
  ...featureBg,
  neutral: 'bg-background-surface-muted',
  brand: 'bg-primary-subtle',
  surface: 'bg-background-surface',
  // Used by the destructive Dialog (Figma overrides the Care tile with status/error-subtle).
  error: 'bg-status-error-subtle',
};

/**
 * Figma `Icon tile` (Tone × Size). The tone tells the event type at a glance; always pair with a text label.
 * M = 40 (radius sm, 20 icon), L = 48 (radius md, 24 icon). `compact` = the 32 tiles in reason/summary cards.
 */
export function IconTile({
  icon,
  tone = 'neutral',
  size = 'M',
  compact = false,
  round = false,
  px,
}: {
  icon: IconName;
  tone?: IconTileTone;
  size?: 'M' | 'L';
  compact?: boolean;
  /** The timer mini bar uses a circular tile. */
  round?: boolean;
  /** Exact box size where an instance is resized in Figma (the 36 pt tab-bar accessory tile). */
  px?: number;
}) {
  const box = compact ? 'size-avatar-sm rounded-sm' : size === 'L' ? 'size-control-md rounded-md' : 'size-avatar-md rounded-sm';
  return (
    <View style={px ? { width: px, height: px } : undefined} className={`items-center justify-center ${box} ${round ? 'rounded-full' : ''} ${fill[tone]}`}>
      <Icon name={icon} size={compact ? 16 : size === 'L' ? 24 : 20} tone={tone === 'error' ? 'color/status/error' : 'color/icon/primary'} />
    </View>
  );
}
