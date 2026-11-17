import * as SecureStore from 'expo-secure-store';

import type { RememberedAccount } from '@/lib/auth/types';

/**
 * Keychain (iOS) / Keystore (Android). "This device only": not copied to a new phone from a backup,
 * so a restored phone has to sign in with the email again.
 */
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const KEYS = {
  account: 'nappa.account',
  refreshToken: 'nappa.refreshToken',
} as const;

export async function loadAccount(): Promise<RememberedAccount | null> {
  const raw = await SecureStore.getItemAsync(KEYS.account, options).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RememberedAccount;
  } catch {
    return null;
  }
}

export async function saveAccount(account: RememberedAccount): Promise<void> {
  await SecureStore.setItemAsync(KEYS.account, JSON.stringify(account), options);
}

export async function loadRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.refreshToken, options).catch(() => null);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.refreshToken, token, options);
}

export async function clearRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.refreshToken, options);
}

/** "Not you?" and account deletion: the phone forgets the account entirely. */
export async function clearAll(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.account, options),
    SecureStore.deleteItemAsync(KEYS.refreshToken, options),
  ]);
}
