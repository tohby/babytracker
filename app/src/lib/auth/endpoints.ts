import { request } from '@/lib/api';
import { authedRequest } from '@/lib/auth/tokens';
import type { Platform, TokenResponse, User } from '@/lib/auth/types';

export type EmailIntent = 'sign_in' | 'create_account';

/** Account endpoints (api/routes/api.php). */
export const authApi = {
  sendEmailCode: (body: { email: string; intent: EmailIntent; locale: string; consent?: boolean }) =>
    request<{ status: 'verification_sent' }>('/v1/auth/email-code', { method: 'POST', body }),

  verifyEmailCode: (body: { email: string; intent: EmailIntent; code: string; platform: Platform; device_id?: string; device_secret?: string }) =>
    request<TokenResponse>('/v1/auth/email-code/verify', { method: 'POST', body }),

  forgetDevice: (body: { device_id: string; device_secret: string }) =>
    request<void>('/v1/auth/forget-device', { method: 'POST', body }),

  sendDeleteCode: () => authedRequest<{ status: 'verification_sent' }>('/v1/me/delete-code', { method: 'POST' }),

  deleteAccount: (proof: { password: string } | { code: string }) =>
    authedRequest<void>('/v1/me', { method: 'DELETE', body: proof }),

  logout: (forgetDevice = false) => authedRequest<void>('/v1/auth/logout', { method: 'POST', body: { forget_device: forgetDevice } }),

  logoutAll: (password: string) => authedRequest<void>('/v1/auth/logout-all', { method: 'POST', body: { password } }),

  me: () => authedRequest<{ data: User; meta: { device: { id: string; pin_enabled: boolean } | null } }>('/v1/me'),
};
