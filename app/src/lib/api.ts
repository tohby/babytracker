// Base URL of the Laravel API. Override per environment with EXPO_PUBLIC_API_URL
// (e.g. http://localhost:8000 when running `php artisan serve` locally).
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://babytracker.madebyidia.com'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export type Ping = { status: 'ok'; app: string; time: string };

export const ping = () => api<Ping>('/ping');
