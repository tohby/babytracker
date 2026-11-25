import Constants, { ExecutionEnvironment } from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Biometric } from './pin';

export async function readBiometricCapability(): Promise<{ method: Biometric | null; available: boolean }> {
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const facial = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const fingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    const method = Platform.OS === 'ios'
      ? facial ? 'faceId' : fingerprint ? 'touchId' : null
      : facial && !fingerprint ? 'face' : fingerprint ? 'fingerprint' : null;
    const supportedBuild = method !== 'faceId' || Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
    const strong = Platform.OS !== 'android'
      || await LocalAuthentication.getEnrolledLevelAsync() === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;
    return { method, available: hardware && enrolled && method !== null && supportedBuild && strong };
  } catch {
    return { method: null, available: false };
  }
}

const options = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  keychainService: 'nappa.quickUnlock.biometric',
  requireAuthentication: true,
};

export function removeBiometricKey(key: string) {
  return SecureStore.deleteItemAsync(key, options);
}

/** Only a random marker is bound to enrollment. The backup PIN lives in a separate entry. */
export async function createBiometricKey(prompt: string): Promise<string | null> {
  const key = randomUUID();
  try {
    await SecureStore.setItemAsync(key, key, { ...options, authenticationPrompt: prompt });
    // Android authenticates on creation. iOS authenticates when reading an item.
    if (Platform.OS === 'ios' && await authenticateBiometricKey(key, prompt) !== 'success') {
      await removeBiometricKey(key).catch(() => {});
      return null;
    }
    return key;
  } catch {
    await removeBiometricKey(key).catch(() => {});
    return null;
  }
}

export async function authenticateBiometricKey(key: string, prompt: string) {
  try {
    const marker = await SecureStore.getItemAsync(key, { ...options, authenticationPrompt: prompt });
    return marker === key ? 'success' : 'unavailable';
  } catch {
    // OS errors include cancellation, interruption, denied permission, and lockout.
    return 'fallback';
  }
}
