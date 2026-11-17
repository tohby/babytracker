import { useUniwind } from 'uniwind';

import { resolveColors, type ResolvedColors, type ThemeName } from '@/constants/color-tokens';

const resolved: Record<ThemeName, ResolvedColors> = {
  light: resolveColors('light'),
  dark: resolveColors('dark'),
};

/**
 * Colour tokens for the active theme, as plain strings, for props that can't
 * take a Tailwind class (icon tints, LinearGradient stops, navigation theme).
 * Prefer classes (`text-text-primary`) everywhere else.
 *
 * Follows Uniwind's theme, which follows the device light/dark setting by default,
 * so these values always match the CSS classes on screen.
 */
export function useThemeColors(): ResolvedColors {
  const { theme } = useUniwind();
  return resolved[theme === 'dark' ? 'dark' : 'light'];
}
