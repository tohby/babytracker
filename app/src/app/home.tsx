import { useMemo } from 'react';

import { firstLaunchHome, HomeView } from '@/components/home/home-view';
import { nextNapFromRhythm } from '@/data/home';
import { useBabies } from '@/hooks/use-babies';
import { useNow } from '@/hooks/use-now';
import { useSession } from '@/hooks/use-session';

/**
 * Home (Figma `01 Home · Today`). Until logging exists it shows the first-launch state (M1-20):
 * the signed-in parent, the baby, and a next nap worked out from the baby's age and wake time.
 */
export default function HomeScreen() {
  const now = useNow();
  const { user, account } = useSession();
  const { babies, loading } = useBabies();
  // The first baby for now; switching between babies comes with M4 (caregivers & children).
  const baby = babies?.[0] ?? null;
  const nowMinute = Math.floor(now / 60_000);

  const home = useMemo(() => {
    const photo = user?.avatar_url ?? account?.avatarUrl;
    return firstLaunchHome({
      babyName: baby?.name ?? '',
      user: {
        name: user?.name ?? account?.name ?? user?.email ?? account?.email ?? '',
        photo: photo ? { uri: photo } : undefined,
      },
      nextNap: nextNapFromRhythm(baby?.birth_date ?? null, baby?.usual_wake_time ?? null, new Date(nowMinute * 60_000)),
    });
  }, [user, account, baby, nowMinute]);

  return <HomeView home={home} loading={loading} now={now} />;
}
