import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import type { Biometric } from './pin';

export async function readBiometricCapability(): Promise<{ method: Biometric | null; available: boolean }> {
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const method = Platform.OS === 'ios' && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      ? 'faceId'
      : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ? Platform.OS === 'ios' ? 'touchId' : 'fingerprint'
        : null;
    const supportedBuild = method !== 'faceId' || Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
    return { method, available: hardware && enrolled && method !== null && supportedBuild };
  } catch {
    return { method: null, available: false };
  }
}

export async function authenticateBiometric(promptMessage: string, cancelLabel: string) {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel, disableDeviceFallback: true });
    if (result.success) return 'success';
    if (result.warning || result.error.startsWith('unknown') || result.error === 'not_enrolled'
      || result.error === 'not_available' || result.error === 'lockout' || result.error === 'passcode_not_set') {
      return 'unavailable';
    }
    return 'cancelled';
  } catch {
    return 'unavailable';
  }
}
