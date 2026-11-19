import { Image } from 'expo-image';

/**
 * The Nappa baby: Figma asset library "Mascot poses" (nine transparent PNGs on one square frame, feet 3% above the
 * bottom edge so swapping poses keeps the baby grounded). The art is the same in light and dark.
 *
 * Where each pose goes (Figma "02 — Mascot Poses & Expressions"):
 * - standing: default / greeting · happy: success, celebration · sleeping: nap or night sleep
 * - feeding: feeds · swaddled: bedtime, calm · playing: milestones, awake time
 * - crying: fussy period, soothing · nappy-change: nappy logging · fussy: overtired, gentle errors
 */
const poses = {
  standing: require('@/assets/images/mascot/standing.png'),
  happy: require('@/assets/images/mascot/happy.png'),
  sleeping: require('@/assets/images/mascot/sleeping.png'),
  feeding: require('@/assets/images/mascot/feeding.png'),
  swaddled: require('@/assets/images/mascot/swaddled.png'),
  playing: require('@/assets/images/mascot/playing.png'),
  crying: require('@/assets/images/mascot/crying.png'),
  'nappy-change': require('@/assets/images/mascot/nappy-change.png'),
  fussy: require('@/assets/images/mascot/fussy.png'),
} as const;

export type MascotPose = keyof typeof poses;

/** Decorative: hidden from screen readers. `size` is both width and height (the art frame is square). */
export function Mascot({ pose, size = 160 }: { pose: MascotPose; size?: number }) {
  return (
    <Image
      source={poses[pose]}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/**
 * The app icon (Figma "App Icon / Peach close-up", the chosen concept) used in the app: next to the chat bubble and
 * on the onboarding review. Rounded like the launcher icon.
 */
export function AppIcon({ size = 72 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/app-icon.png')}
      style={{ width: size, height: size, borderRadius: size * 0.2237 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
