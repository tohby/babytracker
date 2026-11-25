import {
  BACKGROUND_LOCK_MS,
  canAttemptPin,
  createPinRecord,
  emptyAttempts,
  DEFAULT_LOCK_PREFERENCES,
  shouldLockAfterExit,
  nextFailedAttempt,
  parseUnlockRecord,
  PIN_ATTEMPT_LIMIT,
  serializeUnlockRecord,
  verifyPin,
} from '../pin';

jest.mock('expo-crypto', () => {
  const { createHash, randomBytes } = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: async (_algorithm: string, value: string) => createHash('sha256').update(value).digest('hex'),
    getRandomBytesAsync: async (length: number) => randomBytes(length),
  };
});

describe('device PIN', () => {
  it('stores a separately salted hash and accepts a leading zero', async () => {
    const record = await createPinRecord('0123', 'faceId');
    const other = await createPinRecord('0123', null);
    expect(record.hash).toHaveLength(64);
    expect(record.hash).not.toBe(other.hash);
    expect(record).not.toHaveProperty('pin');
    expect(await verifyPin('0123', record)).toBe(true);
    expect(await verifyPin('0103', record)).toBe(false);
    await expect(createPinRecord('12345', null)).rejects.toThrow();
  });

  it('pauses at five tries and doubles the next pause even after reading it back', async () => {
    const record = await createPinRecord('0123', null);
    let attempts = emptyAttempts;
    for (let i = 0; i < PIN_ATTEMPT_LIMIT; i++) attempts = nextFailedAttempt(attempts, 1_000);
    expect(attempts.until).toBe(31_000);
    expect(canAttemptPin(attempts, 30_999)).toBe(false);
    const saved = parseUnlockRecord(JSON.stringify({ ...record, attempts }));
    if (saved.kind !== 'pin') throw new Error('expected a PIN record');
    expect(canAttemptPin(saved.attempts, 31_000)).toBe(true);
    attempts = saved.attempts;
    for (let i = 0; i < PIN_ATTEMPT_LIMIT; i++) attempts = nextFailedAttempt(attempts, 31_000);
    expect(attempts.until).toBe(91_000);
  });

  it('keeps malformed records locked and lasts 60 seconds in the background', () => {
    expect(() => parseUnlockRecord('{"kind":"pin"}')).toThrow();
    expect(parseUnlockRecord('{"kind":"reset"}')).toEqual({ kind: 'reset' });
    expect(BACKGROUND_LOCK_MS).toBe(60_000);
  });
  it('restores the legacy default and persists the selected lock policy', async () => {
    const record = await createPinRecord('0123', null);
    const { preferences: _preferences, ...legacy } = record;
    expect(parseUnlockRecord(JSON.stringify(legacy))).toMatchObject({ preferences: DEFAULT_LOCK_PREFERENCES });
    const preferences = { autoLockMinutes: 15, lockOnExit: true };
    expect(parseUnlockRecord(JSON.stringify({ ...record, preferences }))).toMatchObject({ preferences });
    expect(() => parseUnlockRecord(JSON.stringify({ ...record, preferences: { autoLockMinutes: 2, lockOnExit: false } }))).toThrow();
  });

  it('locks at the grace period boundary or immediately on exit', () => {
    expect(shouldLockAfterExit(DEFAULT_LOCK_PREFERENCES, 59_999)).toBe(false);
    expect(shouldLockAfterExit(DEFAULT_LOCK_PREFERENCES, 60_000)).toBe(true);
    expect(shouldLockAfterExit({ autoLockMinutes: 15, lockOnExit: true }, 0)).toBe(true);
    expect(shouldLockAfterExit({ autoLockMinutes: 0, lockOnExit: false }, 0)).toBe(true);
    expect(shouldLockAfterExit({ autoLockMinutes: 15, lockOnExit: false }, -1)).toBe(true);
  });

  it('keeps rollback builds on PIN unlock when the record uses enrollment-bound biometrics', async () => {
    const record = { ...await createPinRecord('0123', 'face'), biometricKey: '20000000-0000-4000-8000-000000000000' };
    const saved = serializeUnlockRecord(record);
    expect(JSON.parse(saved)).toMatchObject({ biometric: null, preferredBiometric: 'face' });
    expect(parseUnlockRecord(saved)).toEqual(record);
  });

});
