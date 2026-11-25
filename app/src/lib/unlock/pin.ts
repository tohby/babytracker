import { CryptoDigestAlgorithm, digestStringAsync, getRandomBytesAsync } from 'expo-crypto';

export const PIN_LENGTH = 4;
export const PIN_ATTEMPT_LIMIT = 5;
export const BACKGROUND_LOCK_MS = 60_000;
const FIRST_PAUSE_MS = 30_000;
const MAX_PAUSE_MS = 15 * 60_000;

export type Biometric = 'faceId' | 'touchId' | 'fingerprint' | 'face';
export const AUTO_LOCK_MINUTES = [0, 1, 5, 15] as const;
export type LockPreferences = { autoLockMinutes: typeof AUTO_LOCK_MINUTES[number]; lockOnExit: boolean };
export const DEFAULT_LOCK_PREFERENCES: LockPreferences = { autoLockMinutes: 1, lockOnExit: false };
export type PinAttempts = { failures: number; pauses: number; until: number };
export type PinRecord = {
  kind: 'pin';
  salt: string;
  hash: string;
  biometric: Biometric | null;
  biometricKey?: string;
  attempts: PinAttempts;
  preferences: LockPreferences;
};
export type UnlockRecord = PinRecord | { kind: 'skipped' | 'reset'; preferences?: LockPreferences };
export const emptyAttempts: PinAttempts = { failures: 0, pauses: 0, until: 0 };

export async function createPinRecord(pin: string, biometric: Biometric | null): Promise<PinRecord> {
  if (!/^\d{4}$/.test(pin)) throw new Error('Expected four PIN digits');
  const salt = Array.from(await getRandomBytesAsync(16), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { kind: 'pin', salt, hash: await hashPin(salt, pin), biometric, attempts: emptyAttempts, preferences: DEFAULT_LOCK_PREFERENCES };
}

export function shouldLockAfterExit(preferences: LockPreferences, elapsed: number) {
  return preferences.lockOnExit || elapsed < 0 || elapsed >= preferences.autoLockMinutes * BACKGROUND_LOCK_MS;
}

function hashPin(salt: string, pin: string) {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function verifyPin(pin: string, record: PinRecord): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  const candidate = await hashPin(record.salt, pin);
  let mismatch = 0;
  for (let index = 0; index < record.hash.length; index++) {
    mismatch |= candidate.charCodeAt(index) ^ record.hash.charCodeAt(index);
  }
  return mismatch === 0;
}

export function canAttemptPin(attempts: PinAttempts, now: number) {
  return now >= attempts.until;
}

/** Only called for a failed guess made outside an active pause. */
export function nextFailedAttempt(attempts: PinAttempts, now: number): PinAttempts {
  const failures = attempts.failures + 1;
  if (failures < PIN_ATTEMPT_LIMIT) return { ...attempts, failures, until: 0 };
  const duration = Math.min(FIRST_PAUSE_MS * 2 ** attempts.pauses, MAX_PAUSE_MS);
  return { failures: 0, pauses: attempts.pauses + 1, until: Math.min(now + duration, Number.MAX_SAFE_INTEGER) };
}

export function serializeUnlockRecord(record: UnlockRecord) {
  if (record.kind !== 'pin') return JSON.stringify(record);
  // Older versions can still verify the PIN. Only versions that check the enrollment key may use biometrics.
  return JSON.stringify({ ...record, biometric: null, preferredBiometric: record.biometric });
}

export function parseUnlockRecord(raw: string): UnlockRecord {
  const record = JSON.parse(raw) as (Partial<PinRecord> & { preferredBiometric?: Biometric | null })
    | Extract<UnlockRecord, { kind: 'skipped' | 'reset' }> | null;
  const preferences = record?.preferences === undefined ? DEFAULT_LOCK_PREFERENCES : record.preferences;
  if (!preferences || !AUTO_LOCK_MINUTES.includes(preferences.autoLockMinutes) || typeof preferences.lockOnExit !== 'boolean') {
    throw new Error('Invalid quick unlock preferences');
  }
  if (record?.kind === 'skipped' || record?.kind === 'reset') {
    return record.preferences === undefined ? { kind: record.kind } : { kind: record.kind, preferences };
  }
  if (record?.kind !== 'pin') throw new Error('Invalid quick unlock record');
  const biometric = record.preferredBiometric === undefined ? record.biometric : record.preferredBiometric;
  if (typeof record.salt === 'string' && /^[a-f0-9]{32}$/.test(record.salt)
    && typeof record.hash === 'string' && /^[a-f0-9]{64}$/.test(record.hash)
    && ([null, 'faceId', 'touchId', 'fingerprint', 'face'] as const).some((method) => method === biometric)
    && (record.biometricKey === undefined || (biometric && typeof record.biometricKey === 'string'
      && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(record.biometricKey)))
    && record.attempts && Number.isSafeInteger(record.attempts.failures)
    && record.attempts.failures >= 0 && record.attempts.failures < PIN_ATTEMPT_LIMIT
    && Number.isSafeInteger(record.attempts.pauses) && record.attempts.pauses >= 0
    && Number.isSafeInteger(record.attempts.until) && record.attempts.until >= 0) {
    return { kind: 'pin', salt: record.salt, hash: record.hash, biometric: biometric ?? null,
      biometricKey: record.biometricKey, preferences,
      attempts: { failures: record.attempts.failures, pauses: record.attempts.pauses, until: record.attempts.until } };
  }
  throw new Error('Invalid quick unlock record');
}
