// Base URL of the Laravel API. Override per environment with EXPO_PUBLIC_API_URL
// (e.g. http://babytracker-api.test for the local Herd site; see .env.example).
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://babytracker.madebyidia.com'
).replace(/\/$/, '');

/**
 * The API answered with an error. `code` is machine-readable (`invalid_credentials`,
 * `too_many_attempts`, `validation_failed`, ...); screens turn it into translated text.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    /** Failed rule codes per field, for `validation_failed`, e.g. `{ email: ['email'] }`. */
    public readonly fields: Record<string, string[]> = {},
    /** Seconds until the action is allowed again (429s). */
    public readonly retryAfter?: number,
    /** Extra fields from the body, e.g. `attempts_left`. */
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

/** No response at all: offline, DNS failure, server unreachable or timed out. */
export class NetworkError extends Error {
  constructor() {
    super('network');
  }
}

const TIMEOUT_MS = 15_000;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

/** One request to `/api{path}`. JSON in, JSON out; throws ApiError or NetworkError. */
export async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return undefined as T;

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const header = Number(response.headers.get('Retry-After'));
    const { code, errors, retry_after, ...details } = data;
    throw new ApiError(
      response.status,
      typeof code === 'string' ? code : `http_${response.status}`,
      (errors as Record<string, string[]>) ?? {},
      typeof retry_after === 'number' ? retry_after : Number.isFinite(header) && header > 0 ? header : undefined,
      details,
    );
  }
  return data as T;
}

export type Ping = { status: 'ok'; app: string; time: string };

export const ping = () => request<Ping>('/ping');
