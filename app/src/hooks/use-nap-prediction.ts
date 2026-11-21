import { useEffect, useMemo, useState } from 'react';

import type { LogEvent } from '@/data/log-events';
import { useSession } from '@/hooks/use-session';
import { loadAnswers } from '@/lib/onboarding/answers';
import type { Baby } from '@/lib/onboarding/endpoints';
import { initialPrediction } from '@/lib/onboarding/initial-prediction';
import { predictNextNap } from '@/lib/prediction';

export function useNapPrediction(events: LogEvent[], baby: Baby | null | undefined, now: number) {
  const { user } = useSession();
  const userId = user?.id;
  const babyId = baby?.id;
  const [wake, setWake] = useState<{ userId: number; babyId: string; at: number } | null>(null);

  useEffect(() => {
    if (!userId || !babyId) return;
    let active = true;
    void loadAnswers(userId).then((answers) => {
      if (active && answers?.babyId === babyId && typeof answers.lastWakeAt === 'number') {
        setWake({ userId, babyId, at: answers.lastWakeAt });
      }
    });
    return () => { active = false; };
  }, [babyId, userId]);

  return useMemo(() => {
    const birthday = baby?.birth_date ?? null;
    const hasSleepLogs = events.some((event) => event.type === 'sleep' && event.endAt);
    if (!hasSleepLogs && wake && wake.userId === userId && wake.babyId === babyId) {
      return initialPrediction(birthday, wake.at, now, baby?.usual_wake_time);
    }
    return predictNextNap(events, birthday, now, baby?.usual_wake_time);
  }, [baby, babyId, events, now, userId, wake]);
}
