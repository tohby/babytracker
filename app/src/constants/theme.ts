/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';


export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Spacing for StyleSheet code. Same names and values as the Figma "Nappa Spacing"
 * variables and the `--spacing-*` tokens in `global.css` (`p-lg`, `gap-md`, `px-page`).
 * Prefer the Uniwind classes; use these only where a style object is needed.
 */
export const Spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  page: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

/** Figma "V2 · Shape & Size" radius/*. Classes: `rounded-xs` ... `rounded-2xl`, `rounded-full`. */
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  '2xl': 32,
  full: 999,
} as const;

/** Figma "V2 · Shape & Size" size/*. Classes: `min-h-touch-min`, `h-control-lg`, `size-avatar-md`, `size-icon-lg`. */
export const Size = {
  touchMin: 44,
  controlSm: 36,
  controlMd: 48,
  controlLg: 56,
  fab: 64,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 80,
} as const;

/**
 * Figma "V2 · Shape & Size" border/*. Classes: hairline = `border` (1), strong = `border-2`, focus = `border-3`
 * (Tailwind's bare-number widths match the token values).
 */
export const BorderWidth = {
  hairline: 1,
  strong: 2,
  focus: 3,
} as const;

/** Outfit files loaded in the root layout (`@expo-google-fonts/outfit`). */
export const FontFamily = {
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  /** px. Figma stores a percentage of the font size; converted here. */
  letterSpacing: number;
};

const type = (family: keyof typeof FontFamily, fontSize: number, lineHeight: number, trackingPercent = 0): TypeStyle => ({
  fontFamily: FontFamily[family],
  fontSize,
  lineHeight,
  letterSpacing: Math.round(((fontSize * trackingPercent) / 100) * 100) / 100,
});

/**
 * The 17 Figma "V2/*" text styles (all Outfit). Key = Figma style name. Use through `<Text variant>`.
 * Weight lives in the font file name (Light 300, Regular 400, Medium 500, SemiBold 600), so no `fontWeight`.
 */
export const Typography = {
  'V2/Display/Numeric': type('semibold', 44, 48, -1),
  'V2/Display/Light': type('light', 40, 44, -1),
  'V2/Title/Large': type('semibold', 30, 36, -0.5),
  'V2/Title/Medium': type('semibold', 24, 30, -0.5),
  'V2/Heading': type('semibold', 18, 24),
  'V2/Subheading': type('medium', 16, 22),
  'V2/Body/Regular': type('regular', 16, 24),
  'V2/Body/Small': type('regular', 14, 20),
  'V2/Label/Large': type('medium', 15, 20),
  'V2/Label/Small': type('medium', 13, 18),
  'V2/Caption': type('regular', 12, 16),
  'V2/Button/Large': type('semibold', 17, 22),
  'V2/Button/Small': type('semibold', 14, 18),
  'V2/Numeric/Large': type('semibold', 28, 32, -0.5),
  'V2/Numeric/Medium': type('semibold', 20, 24),
  'V2/Numeric/Timer': type('light', 56, 60, -1),
  'V2/Tab label': type('medium', 11, 13, 1),
} as const satisfies Record<string, TypeStyle>;

export type TypographyStyle = keyof typeof Typography;

/** Shadow colour of the V2 elevation styles: slate/900 (#17262e) at the style's alpha. */
const elevationInk = (alpha: number) => `rgba(23, 38, 46, ${alpha})`;

/**
 * Figma effect styles "V2/Elevation/1 · Card", "2 · Floating", "3 · Overlay" as CSS `boxShadow` strings.
 * Light only: in dark mode elevation comes from the surface colour (surface-raised), so use `useElevation()`,
 * which returns `undefined` in dark.
 */
export const Elevation = {
  card: `0px 4px 16px 0px ${elevationInk(0.06)}`,
  floating: `0px 8px 24px 0px ${elevationInk(0.1)}, 0px 2px 6px 0px ${elevationInk(0.04)}`,
  overlay: `0px -8px 40px 0px ${elevationInk(0.14)}`,
} as const;

export type ElevationLevel = keyof typeof Elevation;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
