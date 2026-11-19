import { useBabyEvents } from '@/data/log-store';
import { useCurrentBaby } from '@/hooks/use-current-baby';
import { useNow } from '@/hooks/use-now';

/** What every log sheet needs: the baby, their events (newest first) and "now". */
export function useLogContext() {
  const { baby } = useCurrentBaby();
  const events = useBabyEvents(baby?.id);
  const now = useNow();
  return { baby, babyId: baby?.id ?? '', name: baby?.name ?? '', events, now };
}
