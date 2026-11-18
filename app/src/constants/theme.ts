/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

import { colorTokens } from '@/constants/color-tokens';

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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  page: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

/**
 * CSS box-shadow strings (supported by React Native's `boxShadow` style), from the
 * Figma effect styles. Shadow colours are the same in both themes.
 */
export const Shadows = {
  /** `Glass/Card` and `Glass/Pill`: tiles and the bottom nav. */
  glass: `0px 8px 24px ${colorTokens.light['shadow/glass']}`,
  /** Orange glow under the Log button. */
  logButton: `0px 8px 20px ${colorTokens.light['shadow/accent']}`,
  /** Selected segment in a segmented control. */
  raised: `0px 2px 8px ${colorTokens.light['shadow/raised']}`,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
