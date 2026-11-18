import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import type { ColorToken } from '@/constants/color-tokens';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { transparentOf } from '@/lib/color';

export type HeroTone = 'nap' | 'feed';

const CARD = { width: 280, height: 170 };

/** Figma blurs each blob by 40px; a radial fade this much bigger than the shape gives the same soft edge. */
const BLUR = 40;

type Blob = { token: ColorToken; left: number; top: number; width: number; height: number };

/** Blob positions and sizes from the Figma `Card/Hero gradient` component (280x170). */
const tones: Record<HeroTone, { start: ColorToken; end: ColorToken; blobs: Blob[] }> = {
  nap: {
    start: 'hero/nap-start',
    end: 'hero/nap-end',
    blobs: [
      { token: 'hero/nap-blob-1', left: -40, top: -50, width: 170, height: 150 },
      { token: 'hero/nap-blob-2', left: 130, top: 70, width: 190, height: 150 },
      { token: 'hero/nap-blob-3', left: 20, top: 90, width: 170, height: 130 },
    ],
  },
  feed: {
    start: 'hero/feed-start',
    end: 'hero/feed-end',
    blobs: [
      { token: 'hero/feed-blob-1', left: -40, top: -40, width: 170, height: 150 },
      { token: 'hero/feed-blob-2', left: 120, top: 80, width: 190, height: 150 },
      { token: 'hero/feed-blob-3', left: 10, top: 100, width: 150, height: 120 },
    ],
  },
};

const mascots = {
  sleeping: require('@/assets/images/mascot/sleeping.png'),
  feeding: require('@/assets/images/mascot/feeding.png'),
};

type HeroCardProps = {
  tone: HeroTone;
  chip: string;
  /** Title, subtitle and caption stack. */
  children: ReactNode;
  /** Mascot/Art pose shown in the bottom-right corner. */
  mascot: keyof typeof mascots;
};

/** Pastel mesh-gradient card for the Home carousel (Figma `Card/Hero gradient`). */
export function HeroCard({ tone, chip, children, mascot }: HeroCardProps) {
  const colors = useThemeColors();
  const { start, end, blobs } = tones[tone];

  return (
    <View style={CARD} className="justify-between overflow-hidden rounded-card p-lg">
      {/* Background layers: base gradient, glow blobs, flower. Hidden from screen readers. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <LinearGradient
          colors={[colors[start], colors[end]]}
          locations={[0, 0.714]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {blobs.map(({ token, left, top, width, height }) => (
          <View
            key={token}
            style={{
              position: 'absolute',
              left: left - BLUR,
              top: top - BLUR,
              width: width + BLUR * 2,
              height: height + BLUR * 2,
              experimental_backgroundImage: `radial-gradient(ellipse closest-side, ${colors[token]} 0%, ${colors[token]} 45%, ${transparentOf(colors[token])} 100%)`,
            }}
          />
        ))}
        <Image
          source={require('@/assets/images/hero-decor.svg')}
          tintColor={colors['hero/decor']}
          style={{ position: 'absolute', left: 186, top: -14, width: 96, height: 88.77 }}
        />
        <Image
          source={mascots[mascot]}
          contentFit="contain"
          style={{ position: 'absolute', right: 8, bottom: 0, width: 84, height: 94 }}
        />
      </View>

      <Chip label={chip} />
      {/* Clear of the mascot in the corner, so long (translated) lines wrap instead of running under it. */}
      <View className="gap-xs pe-[76px]">{children}</View>
    </View>
  );
}
