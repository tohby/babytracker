import { ApiError, NetworkError, request } from '@/lib/api';
import { authedRequest, clearTokens, onSessionExpired, refresh, setAccessToken, storeTokens } from '@/lib/auth/tokens';
import type { TokenResponse } from '@/lib/auth/types';

// In-memory Keychain.
const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 0,
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => void mockStore.set(key, value)),
  deleteItemAsync: jest.fn(async (key: string) => void mockStore.delete(key)),
}));

type Reply = { status: number; body?: unknown; headers?: Record<string, string> };
const calls: { url: string; init: RequestInit }[] = [];
let replies: Reply[] = [];

function mockFetch(...next: Reply[]) {
  replies = next;
  global.fetch = jest.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const reply = replies.shift();
    if (!reply) throw new TypeError('Network request failed');
    return {
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      headers: { get: (name: string) => reply.headers?.[name] ?? null },
      json: async () => reply.body ?? {},
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

const tokens = (n: number): TokenResponse => ({
  access_token: `access-${n}`,
  token_type: 'Bearer',
  expires_in: 1800,
  refresh_token: `refresh-${n}`,
  refresh_expires_at: '2027-01-01T00:00:00Z',
  device: { id: 'device-1', pin_enabled: false },
});

beforeEach(async () => {
  mockStore.clear();
  calls.length = 0;
  await clearTokens();
});

describe('request', () => {
  it('turns an error body into an ApiError with its code, fields and wait time', async () => {
    mockFetch({ status: 429, body: { code: 'too_many_attempts', retry_after: 45 } });
    await expect(request('/v1/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 429,
      code: 'too_many_attempts',
      retryAfter: 45,
    });

    mockFetch({ status: 422, body: { code: 'validation_failed', errors: { email: ['email'] } } });
    await expect(request('/v1/auth/login')).rejects.toMatchObject({ code: 'validation_failed', fields: { email: ['email'] } });
  });

  it('reads Retry-After from the header when the body has none (rate limits)', async () => {
    mockFetch({ status: 429, body: { code: 'too_many_requests' }, headers: { 'Retry-After': '30' } });
    await expect(request('/v1/auth/register')).rejects.toMatchObject({ code: 'too_many_requests', retryAfter: 30 });
  });

  it('keeps extra fields such as attempts_left', async () => {
    mockFetch({ status: 401, body: { code: 'invalid_pin', attempts_left: 3 } });
    await expect(request('/v1/auth/pin-login')).rejects.toMatchObject({ code: 'invalid_pin', details: { attempts_left: 3 } });
  });

  it('throws NetworkError when there is no response at all', async () => {
    mockFetch();
    await expect(request('/ping')).rejects.toBeInstanceOf(NetworkError);
  });

  it('returns undefined for 204', async () => {
    mockFetch({ status: 204 });
    await expect(request('/v1/auth/logout')).resolves.toBeUndefined();
  });
});

describe('tokens', () => {
  it('sends the access token and renews it once when the server rejects it', async () => {
    await storeTokens(tokens(1));
    mockFetch(
      { status: 401, body: { code: 'unauthenticated' } }, // access token expired
      { status: 200, body: tokens(2) }, // refresh
      { status: 200, body: { data: { id: 1 } } }, // retried request
    );

    await expect(authedRequest('/v1/me')).resolves.toEqual({ data: { id: 1 } });

    expect(calls.map((c) => c.url.replace(/^.*\/api/, ''))).toEqual(['/v1/me', '/v1/auth/refresh', '/v1/me']);
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer access-1');
    expect(JSON.parse(String(calls[1].init.body))).toEqual({ refresh_token: 'refresh-1' });
    expect((calls[2].init.headers as Record<string, string>).Authorization).toBe('Bearer access-2');
    expect(mockStore.get('nappa.refreshToken')).toBe('refresh-2');
  });

  it('shares one refresh between requests made at the same time (refresh tokens work once)', async () => {
    await storeTokens(tokens(1));
    setAccessToken(null);
    mockFetch({ status: 200, body: tokens(2) });

    const [a, b] = await Promise.all([refresh(), refresh()]);

    expect(a).toBe('access-2');
    expect(b).toBe('access-2');
    expect(calls).toHaveLength(1);
  });

  it('ends the session when the refresh token is no longer valid', async () => {
    await storeTokens(tokens(1));
    setAccessToken(null);
    const expired = jest.fn();
    const stop = onSessionExpired(expired);
    mockFetch({ status: 401, body: { code: 'refresh_invalid' } });

    await expect(authedRequest('/v1/me')).rejects.toBeInstanceOf(ApiError);

    expect(expired).toHaveBeenCalledTimes(1);
    expect(mockStore.has('nappa.refreshToken')).toBe(false);
    stop();
  });

  it('keeps the session when offline', async () => {
    await storeTokens(tokens(1));
    setAccessToken(null);
    const expired = jest.fn();
    const stop = onSessionExpired(expired);
    mockFetch();

    await expect(refresh()).rejects.toBeInstanceOf(NetworkError);

    expect(expired).not.toHaveBeenCalled();
    expect(mockStore.get('nappa.refreshToken')).toBe('refresh-1');
    stop();
  });
});

it('keeps an email-code session when an earlier refresh fails after replacement', async () => {
  await storeTokens(tokens(1));
  let respond!: (response: Response) => void;
  let started!: () => void;
  const requested = new Promise<void>((resolve) => { started = resolve; });
  global.fetch = jest.fn(() => new Promise<Response>((resolve) => {
    respond = resolve;
    started();
  }));
  const expired = jest.fn();
  const stop = onSessionExpired(expired);

  const staleRefresh = refresh();
  const dismissed = expect(staleRefresh).rejects.toMatchObject({ code: 'session_changed' });
  await requested;
  await storeTokens(tokens(2));
  respond(new Response(JSON.stringify({ code: 'refresh_invalid' }), { status: 401 }));
  await dismissed;
  expect(expired).not.toHaveBeenCalled();
  expect(mockStore.get('nappa.refreshToken')).toBe('refresh-2');
  stop();
});
