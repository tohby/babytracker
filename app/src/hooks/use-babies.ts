import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/hooks/use-session';
import { authedRequest } from '@/lib/auth/tokens';
import { isDevPreviewUser } from '@/lib/dev-preview';
import type { Baby } from '@/lib/onboarding/endpoints';

type BabiesState = {
  babies: Baby[] | null;
  /** True while there's nothing to show yet (first load, nothing cached). */
  loading: boolean;
  /** The last refresh failed (offline); `babies` may still hold the cached list. */
  failed: boolean;
};

const cacheKey = (userId: number) => `nappa.babies.${userId}`;

/**
 * The babies this user can see (`GET /babies`). Shows the copy saved on this phone straight away,
 * then refreshes from the API, so Home opens instantly and works offline.
 */
export function useBabies(): BabiesState & { reload: () => void } {
  const { user } = useSession();
  const userId = user?.id ?? 0;
  const [state, setState] = useState<BabiesState>({ babies: null, loading: true, failed: false });

  // Bumped by reload() to fetch again.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await AsyncStorage.getItem(cacheKey(userId)).catch(() => null);
      if (cached && !cancelled) {
        try {
          const babies = JSON.parse(cached) as Baby[];
          setState((s) => ({ ...s, babies, loading: false }));
        } catch {
          // Ignore a damaged cache; the API answer replaces it.
        }
      }
      if (isDevPreviewUser(user)) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }
      try {
        const { data } = await authedRequest<{ data: Baby[] }>('/v1/babies');
        if (cancelled) return;
        setState({ babies: data, loading: false, failed: false });
        AsyncStorage.setItem(cacheKey(userId), JSON.stringify(data)).catch(() => {});
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: s.babies === null, failed: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `user` only matters for the dev preview flag.
  }, [userId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, reload };
}
