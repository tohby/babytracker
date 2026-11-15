import { Image } from 'expo-image';

/** Soft peach circle glowing behind the top-right of the screen. */
export function BackgroundGlow() {
  return (
    <Image
      source={require('@/assets/images/glow.svg')}
      pointerEvents="none"
      style={{ position: 'absolute', right: -120, top: -150, width: 340, height: 340 }}
      accessibilityElementsHidden
    />
  );
}
