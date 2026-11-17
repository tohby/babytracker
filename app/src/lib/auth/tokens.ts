import { ApiError, request } from '@/lib/api';
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from '@/lib/auth/storage';
import type { TokenResponse } from '@/lib/auth/types';

/**
 * Access token in memory only (30 minutes); refresh token in secure storage.
 *
 * Refresh tokens work once, so two refreshes must never run at the same time: the second would
 * look like a stolen copy and sign the phone out. `refresh()` shares one request between callers.
 */
let accessToken: string | null = null;
let inFlight: Promise<string> | null = null;
const expiredListeners = new Set<() => void>();

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** Called when the session can't be renewed (refresh token expired, revoked or replayed). */
export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

/** Store the tokens from any successful sign-in or refresh. */
export async function storeTokens(tokens: TokenResponse): Promise<void> {
  accessToken = tokens.access_token;
  await saveRefreshToken(tokens.refresh_token);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  await clearRefreshToken();
}

/**
 * Trade the stored refresh token for new tokens. Throws ApiError('refresh_invalid') when the
 * session is over (and tells the listeners), NetworkError when offline (session kept).
 */
export function refresh(): Promise<string> {
  inFlight ??= (async () => {
    try {
      const stored = await loadRefreshToken();
      if (!stored) throw new ApiError(401, 'refresh_invalid');
      const tokens = await request<TokenResponse>('/v1/auth/refresh', { method: 'POST', body: { refresh_token: stored } });
      await storeTokens(tokens);
      return tokens.access_token;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'refresh_invalid') {
        await clearTokens();
        expiredListeners.forEach((listener) => listener());
      }
      throw error;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

type AuthedOptions = Omit<Parameters<typeof request>[1], 'token'>;

/** A signed-in request. Renews the access token when it's missing or rejected, then retries once. */
export async function authedRequest<T>(path: string, options: AuthedOptions = {}): Promise<T> {
  const token = accessToken ?? (await refresh());
  try {
    return await request<T>(path, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && error.code === 'unauthenticated') {
      return request<T>(path, { ...options, token: await refresh() });
    }
    throw error;
  }
}
