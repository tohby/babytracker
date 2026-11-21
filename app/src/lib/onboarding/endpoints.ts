import { authedRequest } from '@/lib/auth/tokens';
import type { FeedingMethod } from '@/lib/onboarding/answers';

export type Baby = {
  id: string;
  name: string;
  birth_date: string;
  timezone: string;
  feeding_method: FeedingMethod | null;
  usual_wake_time: string | null;
  role?: string;
};

type BabyInput = {
  name: string;
  birth_date: string;
  timezone: string;
  feeding_method: FeedingMethod | null;
  usual_wake_time?: string | null;
};

/** Profile, baby and onboarding progress (api/routes/api.php). */
export const onboardingApi = {
  listBabies: () => authedRequest<{ data: Baby[] }>('/v1/babies'),

  createBaby: (body: BabyInput) => authedRequest<{ data: Baby }>('/v1/babies', { method: 'POST', body }),

  updateBaby: (id: string, body: Partial<BabyInput>) =>
    authedRequest<{ data: Baby }>(`/v1/babies/${id}`, { method: 'PATCH', body }),

  saveProgress: (lastStep: string) =>
    authedRequest<{ data: { last_step: string; completed_at: string | null } }>('/v1/onboarding', {
      method: 'PUT',
      body: { last_step: lastStep },
    }),

  complete: () =>
    authedRequest<{ data: { last_step: string; completed_at: string | null } }>('/v1/onboarding/complete', {
      method: 'POST',
    }),
};
