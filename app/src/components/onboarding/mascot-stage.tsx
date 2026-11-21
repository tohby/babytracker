import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { View } from 'react-native';

import { Mascot } from '@/components/ui/mascot';
import { useElevation } from '@/hooks/use-elevation';
import { useThemeColors } from '@/hooks/use-theme-colors';

const circle = require('@/assets/images/onboarding/circle-blob.svg');
const layout = {
  sleeping: { art: 295, artTop: -19, blob: require('@/assets/images/onboarding/sleeping-blob.svg'), x: 37.59, y: -83.71, w: 359.411, h: 366, overlap: 26 },
  feeding: { art: 240, artTop: 36, blob: require('@/assets/images/onboarding/feeding-blob.svg'), x: -70, y: -60, w: 355, h: 355, overlap: 24 },
  happy: { art: 240, artTop: 36, blob: circle, x: 120, y: -60, w: 300, h: 300, overlap: 22 },
  swaddled: { art: 200, artTop: 8, blob: circle, x: -80, y: -90, w: 300, h: 300, overlap: 96 },
} as const;

export function MascotStage({ pose, children }: { pose: keyof typeof layout; children: ReactNode }) {
  const [width, setWidth] = useState(350);
  const scale = width / 350;
  const stage = layout[pose];
  const shadow = useElevation('floating');
  const colors = useThemeColors();
  return (
    <View onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}>
      <View className="items-center overflow-hidden rounded-2xl bg-brand-surface" style={{ aspectRatio: 350 / 316 }}>
        <Image
          source={stage.blob}
          tintColor={colors['color/brand/accent']}
          style={{ position: 'absolute', left: stage.x * scale, top: stage.y * scale, width: stage.w * scale, height: stage.h * scale }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View style={{ marginTop: stage.artTop * scale }}>
          <Mascot pose={pose} size={stage.art * scale} />
        </View>
      </View>
      <View className="mx-[20px] rounded-lg bg-background-surface px-lg py-md" style={{ boxShadow: shadow, marginTop: -stage.overlap * scale }}>
        {children}
      </View>
    </View>
  );
}
