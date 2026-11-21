import { CryptoDigestAlgorithm, digestStringAsync, getRandomBytesAsync } from 'expo-crypto';

export const PIN_LENGTH = 4;
export const PIN_ATTEMPT_LIMIT = 5;
export const BACKGROUND_LOCK_MS = 60_000;
const FIRST_PAUSE_MS = 30_000;

export type Biometric = 'faceId' | 'touchId' | 'fingerprint';
export type PinAttempts = { failures: number; pauses: number; until: number };
export type PinRecord = {
  kind: 'pin';
  salt: string;
  hash: string;
  biometric: Biometric | null;
  attempts: PinAttempts;
};
export type UnlockRecord = PinRecord | { kind: 'skipped' } | { kind: 'reset' };
export const emptyAttempts: PinAttempts = { failures: 0, pauses: 0, until: 0 };

export async function createPinRecord(pin: string, biometric: Biometric | null): Promise<PinRecord> {
  if (!/^\d{4}$/.test(pin)) throw new Error('Expected four PIN digits');
  const salt = Array.from(await getRandomBytesAsync(16), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { kind: 'pin', salt, hash: await hashPin(salt, pin), biometric, attempts: emptyAttempts };
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
  // Keep timestamps representable even if the same device accrues years of pauses.
  const duration = FIRST_PAUSE_MS * 2 ** attempts.pauses;
  return { failures: 0, pauses: attempts.pauses + 1, until: Math.min(now + duration, Number.MAX_SAFE_INTEGER) };
}

export function parseUnlockRecord(raw: string): UnlockRecord {
  const record = JSON.parse(raw) as Partial<PinRecord> | { kind: 'skipped' | 'reset' } | null;
  if (record?.kind === 'skipped') return { kind: 'skipped' };
  if (record?.kind === 'reset') return { kind: 'reset' };
  if (record?.kind === 'pin' && typeof record.salt === 'string' && /^[a-f0-9]{32}$/.test(record.salt)
    && typeof record.hash === 'string' && /^[a-f0-9]{64}$/.test(record.hash)
    && ([null, 'faceId', 'touchId', 'fingerprint'] as const).some((method) => method === record.biometric)
    && record.attempts && Number.isSafeInteger(record.attempts.failures)
    && record.attempts.failures >= 0 && record.attempts.failures < PIN_ATTEMPT_LIMIT
    && Number.isSafeInteger(record.attempts.pauses) && record.attempts.pauses >= 0
    && Number.isSafeInteger(record.attempts.until) && record.attempts.until >= 0) {
    return { kind: 'pin', salt: record.salt, hash: record.hash, biometric: record.biometric ?? null,
      attempts: { failures: record.attempts.failures, pauses: record.attempts.pauses, until: record.attempts.until } };
  }
  throw new Error('Invalid quick unlock record');
}
