import { authedRequest } from '@/lib/auth/tokens';
import type { User } from '@/lib/auth/types';
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
  usual_wake_time: string | null;
};

/** Profile, baby and onboarding progress (api/routes/api.php). */
export const onboardingApi = {
  updateProfile: (body: { name?: string | null; locale?: string }) =>
    authedRequest<{ data: User }>('/v1/me', { method: 'PATCH', body }),

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
