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

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  twelve: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Raw palette values for places Tailwind classes can't reach (icon tints). Keep in sync with global.css. */
export const Palette = {
  plum600: '#7a6a82',
  plum900: '#3e2a47',
  orange500: '#f28a3c',
  white: '#ffffff',
} as const;

/**
 * Gradients can't be expressed as Tailwind classes in React Native,
 * so they live here. `locations` are the Figma stop positions (0 to 1).
 */
export const Gradients = {
  nextNap: {
    colors: ['#F6C65B', '#F5A35E', '#F28A3C'],
    locations: [0, 0.39, 0.71],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  feedDue: {
    colors: ['#EEE7F8', '#C9B8E8'],
    locations: [0, 0.71],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  avatar: {
    colors: ['#C9B8E8', '#F28A3C'],
    locations: [0, 0.71],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

/** CSS box-shadow strings (supported by React Native's `boxShadow` style). */
export const Shadows = {
  floatingNav: '0px 8px 48px rgba(0, 0, 0, 0.25)',
  logButton: '0px 8px 18px rgba(242, 138, 61, 0.4)',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
