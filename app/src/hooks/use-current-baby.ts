import { useBabies } from '@/hooks/use-babies';
import type { Baby } from '@/lib/onboarding/endpoints';

/**
 * The baby the app is showing. The first one until the child switcher (G09) is wired to a stored choice.
 */
export function useCurrentBaby(): { baby: Baby | null; babies: Baby[]; loading: boolean; failed: boolean } {
  const { babies, loading, failed } = useBabies();
  return { baby: babies?.[0] ?? null, babies: babies ?? [], loading, failed };
}
