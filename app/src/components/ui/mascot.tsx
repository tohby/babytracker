import { Image } from 'expo-image';

/** Figma `Mascot/Art` poses that ship with the app (transparent PNGs). */
const poses = {
  awake: { source: require('@/assets/images/mascot/awake.png'), ratio: 600 / 562 },
  feeding: { source: require('@/assets/images/mascot/feeding.png'), ratio: 1 },
  milestone: { source: require('@/assets/images/mascot/milestone.png'), ratio: 600 / 590 },
  sleeping: { source: require('@/assets/images/mascot/sleeping.png'), ratio: 1 },
  thinking: { source: require('@/assets/images/mascot/thinking.png'), ratio: 600 / 569 },
  waving: { source: require('@/assets/images/mascot/waving.png'), ratio: 1020 / 1041 },
} as const;

export type MascotPose = keyof typeof poses;

/** Decorative: hidden from screen readers. `size` is the width; height follows the art. */
export function Mascot({ pose, size = 160 }: { pose: MascotPose; size?: number }) {
  const { source, ratio } = poses[pose];
  return (
    <Image
      source={source}
      style={{ width: size, height: Math.round(size * ratio) }}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** Figma `Mascot/App icon`: the panda app icon used at the top of the sign-in forms. */
export function AppIcon({ size = 72 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/splash-panda.png')}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
