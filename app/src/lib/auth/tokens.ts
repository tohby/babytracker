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
let sessionGeneration = 0;
let inFlight: { generation: number; task: Promise<string> } | null = null;
let storageWrite: Promise<void> = Promise.resolve();
const expiredListeners = new Set<() => void>();

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** Called when the session can't be renewed (refresh token expired, revoked or replayed). */
export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

function writeStorage(write: () => Promise<void>) {
  storageWrite = storageWrite.catch(() => {}).then(write);
  return storageWrite;
}

/** Replace the session after authenticating. An older refresh may still be in flight. */
export function storeTokens(tokens: TokenResponse): Promise<void> {
  sessionGeneration += 1;
  return updateTokens(tokens);
}

function updateTokens(tokens: TokenResponse): Promise<void> {
  accessToken = tokens.access_token;
  return writeStorage(() => saveRefreshToken(tokens.refresh_token));
}

export function clearTokens(): Promise<void> {
  sessionGeneration += 1;
  accessToken = null;
  return writeStorage(clearRefreshToken);
}

const sessionChanged = () => new ApiError(401, 'session_changed');

/** Rotate the saved refresh token once for each active session and reject stale responses. */
export function refresh(): Promise<string> {
  const generation = sessionGeneration;
  if (inFlight?.generation === generation) return inFlight.task;

  const task = (async () => {
    try {
      await storageWrite;
      if (generation !== sessionGeneration) throw sessionChanged();
      const stored = await loadRefreshToken();
      if (generation !== sessionGeneration) throw sessionChanged();
      if (!stored) throw new ApiError(401, 'refresh_invalid');
      const tokens = await request<TokenResponse>('/v1/auth/refresh', { method: 'POST', body: { refresh_token: stored } });
      if (generation !== sessionGeneration) throw sessionChanged();
      await updateTokens(tokens);
      if (generation !== sessionGeneration) throw sessionChanged();
      return tokens.access_token;
    } catch (error) {
      if (generation !== sessionGeneration) throw sessionChanged();
      if (error instanceof ApiError && error.code === 'refresh_invalid') {
        await clearTokens();
        if (sessionGeneration === generation + 1) expiredListeners.forEach((listener) => listener());
      }
      throw error;
    } finally {
      if (inFlight?.generation === generation) inFlight = null;
    }
  })();
  inFlight = { generation, task };
  return task;
}

type AuthedOptions = Omit<Parameters<typeof request>[1], 'token'>;

/** A signed-in request. Renews the access token when it's missing or rejected, then retries once. */
export async function authedRequest<T>(path: string, options: AuthedOptions = {}): Promise<T> {
  const generation = sessionGeneration;
  const token = accessToken ?? (await refresh());
  const send = async (access: string) => {
    if (generation !== sessionGeneration) throw sessionChanged();
    const result = await request<T>(path, { ...options, token: access });
    if (generation !== sessionGeneration) throw sessionChanged();
    return result;
  };
  try {
    return await send(token);
  } catch (error) {
    if (generation !== sessionGeneration) throw sessionChanged();
    if (error instanceof ApiError && error.status === 401 && error.code === 'unauthenticated') {
      return send(await refresh());
    }
    throw error;
  }
}
