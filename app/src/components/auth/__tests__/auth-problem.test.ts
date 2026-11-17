import { EMAIL_PATTERN, toAuthProblem } from '@/components/auth/auth-problem';
import { ApiError, NetworkError } from '@/lib/api';

describe('toAuthProblem', () => {
  it('maps API codes to what the screens show', () => {
    expect(toAuthProblem(new ApiError(401, 'invalid_credentials'))).toEqual({ kind: 'invalidCredentials' });
    expect(toAuthProblem(new ApiError(401, 'device_revoked'))).toEqual({ kind: 'deviceForgotten' });
    expect(toAuthProblem(new ApiError(422, 'invalid_code'))).toEqual({ kind: 'invalidCode' });
    expect(toAuthProblem(new ApiError(422, 'validation_failed', { password: ['password'] }))).toEqual({
      kind: 'validation',
      fields: { password: ['password'] },
    });
    expect(toAuthProblem(new NetworkError())).toEqual({ kind: 'offline' });
    expect(toAuthProblem(new Error('boom'))).toEqual({ kind: 'generic' });
  });

  it('turns a sign-in pause into a time the countdown runs to', () => {
    const now = Date.now();
    const problem = toAuthProblem(new ApiError(429, 'too_many_attempts', {}, 45));
    expect(problem.kind).toBe('locked');
    if (problem.kind === 'locked') expect(problem.until - now).toBeGreaterThanOrEqual(45_000 - 50);
  });
});

describe('EMAIL_PATTERN', () => {
  it.each(['kemi@example.com', 'a.b+c@sub.example.co.uk'])('accepts %s', (email) => expect(EMAIL_PATTERN.test(email)).toBe(true));
  it.each(['kemi@example', 'kemi', 'kemi @example.com', '@example.com'])('rejects %s', (email) => expect(EMAIL_PATTERN.test(email)).toBe(false));
});
