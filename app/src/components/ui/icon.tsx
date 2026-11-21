import { Image } from 'expo-image';

import type { V2ColorToken } from '@/constants/color-tokens';
import { useThemeColors } from '@/hooks/use-theme-colors';

/** Every icon in the app: the Figma `Icon/*` set (24 grid, stroke). Add a new SVG to assets/icons and list it here. */
const icons = {
  'alert-circle': require('@/assets/icons/alert-circle.svg'),
  apple: require('@/assets/icons/apple.svg'),
  arrow: require('@/assets/icons/arrow.svg'),
  back: require('@/assets/icons/back.svg'),
  backspace: require('@/assets/icons/backspace.svg'),
  bell: require('@/assets/icons/bell.svg'),
  bottle: require('@/assets/icons/bottle.svg'),
  calendar: require('@/assets/icons/calendar.svg'),
  'calendar-day': require('@/assets/icons/calendar-day.svg'),
  check: require('@/assets/icons/check.svg'),
  'chevron-down': require('@/assets/icons/chevron-down.svg'),
  'chevron-right': require('@/assets/icons/chevron-right.svg'),
  'chevrons-right': require('@/assets/icons/chevrons-right.svg'),
  clock: require('@/assets/icons/clock.svg'),
  close: require('@/assets/icons/close.svg'),
  'cloud-check': require('@/assets/icons/cloud-check.svg'),
  contrast: require('@/assets/icons/contrast.svg'),
  download: require('@/assets/icons/download.svg'),
  drop: require('@/assets/icons/drop.svg'),
  edit: require('@/assets/icons/edit.svg'),
  eye: require('@/assets/icons/eye.svg'),
  'face-id': require('@/assets/icons/face-id.svg'),
  'face-id-key': require('@/assets/icons/face-id-key.svg'),
  'face-id-warning': require('@/assets/icons/face-id-warning.svg'),
  family: require('@/assets/icons/family.svg'),
  filter: require('@/assets/icons/filter.svg'),
  fingerprint: require('@/assets/icons/fingerprint.svg'),
  globe: require('@/assets/icons/globe.svg'),
  'heart-outline': require('@/assets/icons/heart-outline.svg'),
  google: require('@/assets/icons/google.svg'),
  home: require('@/assets/icons/home.svg'),
  info: require('@/assets/icons/info.svg'),
  insights: require('@/assets/icons/insights.svg'),
  lock: require('@/assets/icons/lock.svg'),
  'log-activity': require('@/assets/icons/log-activity.svg'),
  'log-bath': require('@/assets/icons/log-bath.svg'),
  'log-chevron-left': require('@/assets/icons/log-chevron-left.svg'),
  'log-copy': require('@/assets/icons/log-copy.svg'),
  'log-growth': require('@/assets/icons/log-growth.svg'),
  'log-medicine': require('@/assets/icons/log-medicine.svg'),
  'log-nappy': require('@/assets/icons/log-nappy.svg'),
  'log-nursing': require('@/assets/icons/log-nursing.svg'),
  'log-pump': require('@/assets/icons/log-pump.svg'),
  'log-solids': require('@/assets/icons/log-solids.svg'),
  'log-tummy': require('@/assets/icons/log-tummy.svg'),
  mail: require('@/assets/icons/mail.svg'),
  minus: require('@/assets/icons/minus.svg'),
  moon: require('@/assets/icons/moon.svg'),
  more: require('@/assets/icons/more.svg'),
  plus: require('@/assets/icons/plus.svg'),
  refresh: require('@/assets/icons/refresh.svg'),
  search: require('@/assets/icons/search.svg'),
  settings: require('@/assets/icons/settings.svg'),
  share: require('@/assets/icons/share.svg'),
  sparkle: require('@/assets/icons/sparkle.svg'),
  sun: require('@/assets/icons/sun.svg'),
  timeline: require('@/assets/icons/timeline.svg'),
  trash: require('@/assets/icons/trash.svg'),
  'user-plus': require('@/assets/icons/user-plus.svg'),
  'wifi-off': require('@/assets/icons/wifi-off.svg'),
  // LEGACY (V1 only): remove with the V1 screens.
  'eye-off': require('@/assets/icons/eye-off.svg'),
  'moon-filled': require('@/assets/icons/moon-filled.svg'),
  nappy: require('@/assets/icons/nappy.svg'),
  growth: require('@/assets/icons/growth.svg'),
  heart: require('@/assets/icons/heart.svg'),
  star: require('@/assets/icons/star.svg'),
};

export type IconName = keyof typeof icons;

/** Icons drawn in their own colours (brand marks); never tinted. */
const multicolour: ReadonlySet<IconName> = new Set(['google']);

type IconProps = {
  name: IconName;
  /** Colour token (Figma binds icons to `color/icon/*`). Default `color/icon/primary`. */
  tone?: V2ColorToken;
  /** LEGACY: raw colour string from V1 callers. Prefer `tone`. */
  color?: string;
  size?: number;
};

export function Icon({ name, tone = 'color/icon/primary', color, size = 24 }: IconProps) {
  const colors = useThemeColors();
  return (
    <Image
      source={icons[name]}
      tintColor={multicolour.has(name) ? undefined : (color ?? colors[tone])}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
