import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform } from 'react-native';

import { useReduceTransparency } from '@/hooks/use-reduce-transparency';

/** iOS 26+ with the Liquid Glass API. Checked once: it can't change while the app runs. */
const glassSupported = Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

/**
 * Whether floating chrome should be Liquid Glass: iOS 26+ AND Reduce Transparency off. Otherwise the solid V2
 * Bottom nav / Top bar are the correct design (not a degraded one). Android never uses glass.
 */
export function useLiquidGlass(): boolean {
  const reduceTransparency = useReduceTransparency();
  return glassSupported && !reduceTransparency;
}
