import { ApiError, NetworkError } from '@/lib/api';

/**
 * What went wrong, in screen terms. Screens choose the banner and field messages from `kind`;
 * the API only ever sends codes, never sentences.
 */
export type AuthProblem =
  | { kind: 'invalidCredentials' }
  | { kind: 'locked'; until: number }
  | { kind: 'offline' }
  | { kind: 'deviceForgotten' }
  | { kind: 'invalidCode' }
  | { kind: 'expiredCode' }
  | { kind: 'emailInUse' }
  | { kind: 'codeRequired' }
  | { kind: 'tooManyRequests'; until: number }
  | { kind: 'validation'; fields: Record<string, string[]> }
  | { kind: 'generic' };

export function toAuthProblem(error: unknown): AuthProblem {
  if (error instanceof NetworkError) return { kind: 'offline' };
  if (!(error instanceof ApiError)) return { kind: 'generic' };

  const until = Date.now() + (error.retryAfter ?? 60) * 1000;
  switch (error.code) {
    case 'invalid_credentials':
      return { kind: 'invalidCredentials' };
    case 'too_many_attempts':
      return { kind: 'locked', until };
    case 'too_many_requests':
      return { kind: 'tooManyRequests', until };
    case 'device_revoked':
      return { kind: 'deviceForgotten' };
    case 'invalid_code':
      return { kind: 'invalidCode' };
    case 'code_expired':
      return { kind: 'expiredCode' };
    case 'email_in_use':
      return { kind: 'emailInUse' };
    case 'code_required':
      return { kind: 'codeRequired' };
    case 'validation_failed':
      return { kind: 'validation', fields: error.fields };
    default:
      return { kind: 'generic' };
  }
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
