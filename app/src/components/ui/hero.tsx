import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Mascot, type MascotPose } from '@/components/ui/mascot';
import { featureBg, featureStrongBg, type FeatureTone } from '@/constants/tones';

/**
 * Figma `Hero` (Tone): coloured header for moments that deserve warmth (Next nap, onboarding, success, paywall).
 * Feature tone fill, a 380 blob in the strong tone at 22%, the mascot at the end/bottom, bottom corners 40.
 * The top bar and title sit on top (`children`). Max one per screen; never on lists or forms.
 */
export function Hero({
  tone,
  mascot,
  height = 360,
  children,
}: {
  tone: FeatureTone;
  /** Figma `Mascot` swap; omit for `Show mascot = false`. */
  mascot?: MascotPose;
  height?: number;
  children?: ReactNode;
}) {
  return (
    // Bottom radius 40 has no radius token (see gaps list).
    <View style={{ height }} className={`overflow-hidden rounded-b-[40px] ${featureBg[tone]}`}>
      <View className={`absolute start-[150px] top-[30px] size-[380px] rounded-full opacity-[0.22] ${featureStrongBg[tone]}`} />
      {mascot && (
        <View className="absolute bottom-[3px] end-[17px]">
          <Mascot pose={mascot} size={197} />
        </View>
      )}
      {children}
    </View>
  );
}
