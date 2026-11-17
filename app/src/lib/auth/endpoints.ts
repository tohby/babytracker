import { request } from '@/lib/api';
import { authedRequest } from '@/lib/auth/tokens';
import type { Platform, TokenResponse, User } from '@/lib/auth/types';

/** The sign-up, sign-in and account endpoints (api/routes/api.php). */
export const authApi = {
  register: (body: { email: string; password: string; locale?: string; consent: boolean }) =>
    request<{ status: 'verification_sent' }>('/v1/auth/register', { method: 'POST', body }),

  resendCode: (email: string) =>
    request<{ status: 'verification_sent' }>('/v1/auth/register/resend', { method: 'POST', body: { email } }),

  verify: (body: { email: string; code: string; platform: Platform }) =>
    request<TokenResponse>('/v1/auth/register/verify', { method: 'POST', body }),

  login: (body: { email: string; password: string; platform: Platform; device_id?: string; device_secret?: string }) =>
    request<TokenResponse>('/v1/auth/login', { method: 'POST', body }),

  deviceLogin: (body: { device_id: string; device_secret: string; password: string }) =>
    request<TokenResponse>('/v1/auth/device-login', { method: 'POST', body }),

  forgetDevice: (body: { device_id: string; device_secret: string }) =>
    request<void>('/v1/auth/forget-device', { method: 'POST', body }),

  forgotPassword: (email: string) =>
    request<{ status: 'reset_link_sent' }>('/v1/auth/password/forgot', { method: 'POST', body: { email } }),

  logout: (forgetDevice = false) => authedRequest<void>('/v1/auth/logout', { method: 'POST', body: { forget_device: forgetDevice } }),

  logoutAll: (password: string) => authedRequest<void>('/v1/auth/logout-all', { method: 'POST', body: { password } }),

  me: () => authedRequest<{ data: User; meta: { device: { id: string; pin_enabled: boolean } | null } }>('/v1/me'),
};
