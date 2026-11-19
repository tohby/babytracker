import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/lib/auth/types';

/**
 * Development-only preview session, so screens behind sign-in can be checked in a simulator without a real
 * account. Set the AsyncStorage key `nappa.devPreviewSession` to a JSON `User` (and `nappa.babies.<id>` to a
 * baby list). Ignored in production builds.
 */
export const DEV_PREVIEW_KEY = 'nappa.devPreviewSession';

export async function loadDevPreviewUser(): Promise<User | null> {
  if (!__DEV__) return null;
  const raw = await AsyncStorage.getItem(DEV_PREVIEW_KEY).catch(() => null);
  if (!raw) return null;
  try {
    return { ...(JSON.parse(raw) as User), dev_preview: true } as User;
  } catch {
    return null;
  }
}

export function isDevPreviewUser(user: User | null | undefined): boolean {
  return __DEV__ && !!(user as (User & { dev_preview?: boolean }) | null)?.dev_preview;
}
