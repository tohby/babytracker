import { Image } from 'expo-image';

/** Every icon in the app. Add a new SVG to assets/icons and list it here. */
const icons = {
  'alert-circle': require('@/assets/icons/alert-circle.svg'),
  arrow: require('@/assets/icons/arrow.svg'),
  back: require('@/assets/icons/back.svg'),
  bell: require('@/assets/icons/bell.svg'),
  bottle: require('@/assets/icons/bottle.svg'),
  check: require('@/assets/icons/check.svg'),
  clock: require('@/assets/icons/clock.svg'),
  close: require('@/assets/icons/close.svg'),
  contrast: require('@/assets/icons/contrast.svg'),
  drop: require('@/assets/icons/drop.svg'),
  eye: require('@/assets/icons/eye.svg'),
  'eye-off': require('@/assets/icons/eye-off.svg'),
  family: require('@/assets/icons/family.svg'),
  growth: require('@/assets/icons/growth.svg'),
  heart: require('@/assets/icons/heart.svg'),
  home: require('@/assets/icons/home.svg'),
  info: require('@/assets/icons/info.svg'),
  insights: require('@/assets/icons/insights.svg'),
  lock: require('@/assets/icons/lock.svg'),
  mail: require('@/assets/icons/mail.svg'),
  moon: require('@/assets/icons/moon.svg'),
  'moon-filled': require('@/assets/icons/moon-filled.svg'),
  nappy: require('@/assets/icons/nappy.svg'),
  plus: require('@/assets/icons/plus.svg'),
  settings: require('@/assets/icons/settings.svg'),
  star: require('@/assets/icons/star.svg'),
  sun: require('@/assets/icons/sun.svg'),
  timeline: require('@/assets/icons/timeline.svg'),
  'wifi-off': require('@/assets/icons/wifi-off.svg'),
};

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  /** Any CSS color. Recolors the whole icon. */
  color: string;
  size?: number;
};

export function Icon({ name, color, size = 24 }: IconProps) {
  return (
    <Image
      source={icons[name]}
      tintColor={color}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
    />
  );
}
