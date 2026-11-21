import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { parseUnlockRecord, type UnlockRecord } from './pin';

const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export async function unlockStorageKey(email: string) {
  const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, email);
  return `nappa.quickUnlock.${hash}`;
}

export async function loadUnlockRecord(key: string): Promise<UnlockRecord | null> {
  const raw = await SecureStore.getItemAsync(key, options);
  return raw === null ? null : parseUnlockRecord(raw);
}

export async function saveUnlockRecord(key: string, record: UnlockRecord) {
  await SecureStore.setItemAsync(key, JSON.stringify(record), options);
}

export async function forgetUnlockRecord(email: string) {
  const key = await unlockStorageKey(email.trim().toLowerCase());
  await SecureStore.deleteItemAsync(key, options);
}
