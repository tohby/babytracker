import { useUniwind } from 'uniwind';

import { Elevation, type ElevationLevel } from '@/constants/theme';

/**
 * `boxShadow` for a V2 elevation level. In dark mode there is no shadow: the surface colour
 * (`bg-background-surface-raised`) carries the elevation, as the design system specifies.
 */
export function useElevation(level: ElevationLevel): string | undefined {
  const { theme } = useUniwind();
  return theme === 'dark' ? undefined : Elevation[level];
}
