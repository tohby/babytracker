import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { featureBg, type FeatureTone } from '@/constants/tones';
import { useElevation } from '@/hooks/use-elevation';

export type CardTone = 'surface' | 'muted' | FeatureTone | 'brand';

const fill: Record<CardTone, string> = {
  surface: 'bg-background-surface',
  muted: 'bg-background-surface-muted',
  ...featureBg,
  brand: 'bg-primary-default',
};

/**
 * Figma `Card` (Tone). Padding 20, radius 2xl (32), children 12 apart. Surface carries Elevation 1 in light;
 * feature tones are for content about one event type; Brand for the single most important card on a screen.
 */
export function Card({
  tone = 'surface',
  children,
  onPress,
  accessibilityLabel,
  className = '',
}: {
  tone?: CardTone;
  children: ReactNode;
  /** Makes the whole card one tap target. */
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}) {
  const shadow = useElevation('card');
  const style = tone === 'surface' ? { boxShadow: shadow } : undefined;
  const classes = `gap-md rounded-2xl p-page ${fill[tone]} ${className}`;
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={style} className={`${classes} active:opacity-90`}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={style} className={classes}>
      {children}
    </View>
  );
}
