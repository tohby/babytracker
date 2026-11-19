import { Image } from 'expo-image';

/** Figma `Mascot/Art` poses (transparent PNGs). The art is the same in light and dark. */
const poses = {
  awake: require('@/assets/images/mascot/awake.png'),
  crying: require('@/assets/images/mascot/crying.png'),
  'diaper-change': require('@/assets/images/mascot/diaper-change.png'),
  feeding: require('@/assets/images/mascot/feeding.png'),
  milestone: require('@/assets/images/mascot/milestone.png'),
  sleeping: require('@/assets/images/mascot/sleeping.png'),
  thinking: require('@/assets/images/mascot/thinking.png'),
  waving: require('@/assets/images/mascot/waving.png'),
} as const;

export type MascotPose = keyof typeof poses;

/** Every `Mascot/Art` component is a 240×270 frame with the art fitted inside. */
const FRAME_RATIO = 270 / 240;

/** Decorative: hidden from screen readers. `size` is the frame width; height follows the Figma frame. */
export function Mascot({ pose, size = 160 }: { pose: MascotPose; size?: number }) {
  return (
    <Image
      source={poses[pose]}
      style={{ width: size, height: Math.round(size * FRAME_RATIO) }}
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
