import { act, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { createRoot } from 'test-renderer';

import { useQuickUnlock, type QuickUnlockController } from '../use-quick-unlock';
import { authenticateBiometricKey, createBiometricKey, removeBiometricKey } from '@/lib/unlock/biometrics';
import { createPinRecord, PIN_ATTEMPT_LIMIT } from '@/lib/unlock/pin';
import { loadUnlockRecord, saveUnlockRecord } from '@/lib/unlock/storage';

jest.mock('expo-crypto', () => {
  const { createHash, randomBytes } = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: async (_algorithm: string, value: string) => createHash('sha256').update(value).digest('hex'),
    getRandomBytesAsync: async (length: number) => randomBytes(length),
  };
});
jest.mock('@/lib/unlock/biometrics', () => ({
  authenticateBiometricKey: jest.fn(),
  createBiometricKey: jest.fn(),
  removeBiometricKey: jest.fn(async () => {}),
  readBiometricCapability: jest.fn(async () => ({ available: true, method: 'faceId' })),
}));
jest.mock('@/lib/unlock/storage', () => ({
  loadUnlockRecord: jest.fn(),
  saveUnlockRecord: jest.fn(),
  unlockStorageKey: async (email: string) => email,
}));

const email = 'qa@example.test';
const marker = '20000000-0000-4000-8000-000000000000';
const defaultPin = '1238';
let current: QuickUnlockController;
let root: ReturnType<typeof createRoot>;
let event: (state: AppStateStatus) => void;
let records: Map<string, NonNullable<Awaited<ReturnType<typeof loadUnlockRecord>>>>;

function Probe({ account }: { account: string }) {
  const controller = useQuickUnlock(account);
  useEffect(() => { current = controller; }, [controller]);
  return null;
}

async function mount(account = email) {
  await act(async () => { root.render(<Probe account={account} />); });
}

function appState(state: AppStateStatus) {
  AppState.currentState = state;
  event(state);
}

beforeEach(() => {
  jest.clearAllMocks();
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    event = listener;
    return { remove: jest.fn() };
  });
  records = new Map();
  jest.mocked(loadUnlockRecord).mockImplementation(async (key) => records.get(key) ?? null);
  jest.mocked(saveUnlockRecord).mockImplementation(async (key, record) => { records.set(key, record); });
  root = createRoot();
});

afterEach(async () => {
  await act(async () => root.unmount());
  jest.restoreAllMocks();
});

it('requires PIN verification to change a PIN, relax locking, or remove protection', async () => {
  await mount();
  expect(current.phase).toBe('unconfigured');
  await act(async () => { expect(await current.setPin(defaultPin)).toBe(true); });
  const preferences = { autoLockMinutes: 15, lockOnExit: false } as const;
  await act(async () => {
    expect(await current.applyChange('disablePin')).toBe('verificationRequired');
    expect(await current.setPreferences(preferences)).toBe(false);
    expect(await current.verifyChange(defaultPin, 'relaxLock')).toBe('verified');
    expect(await current.applyChange('relaxLock', { preferences })).toBe('saved');
    expect(await current.verifyChange(defaultPin, 'changePin')).toBe('verified');
    expect(await current.applyChange('changePin', { pin: '2840' })).toBe('saved');
  });
  expect(current.preferences).toEqual(preferences);
  await act(async () => current.lock());
  await act(async () => {
    expect(await current.attemptPin(defaultPin)).toBe('incorrect');
    expect(await current.attemptPin('2840')).toBe('verified');
    expect(await current.verifyChange('2840', 'disablePin')).toBe('verified');
    expect(await current.applyChange('disablePin')).toBe('saved');
  });
  expect(current.pinEnabled).toBe(false);
  expect(current.preferences).toEqual(preferences);
});

it('tries biometrics automatically once and disregards success interrupted by backgrounding', async () => {
  records.set(email, { ...await createPinRecord(defaultPin, 'faceId'), biometricKey: marker });
  let finishPrompt!: (result: 'success') => void;
  jest.mocked(authenticateBiometricKey).mockImplementationOnce(() => new Promise<'success'>((resolve) => { finishPrompt = resolve; }));
  await mount();
  expect(current.phase).toBe('locked');
  await act(async () => {
    const pending = current.attemptBiometrics('Unlock', true);
    expect(await current.attemptBiometrics('Unlock', true)).toBe('ignored');
    appState('background');
    appState('active');
    finishPrompt('success');
    expect(await pending).toBe('fallback');
    expect(await current.attemptBiometrics('Unlock', true)).toBe('ignored');
  });
  expect(authenticateBiometricKey).toHaveBeenCalledTimes(1);
  expect(current.phase).toBe('locked');
  await act(async () => { expect(await current.attemptPin(defaultPin)).toBe('verified'); });
  expect(current.phase).toBe('unlocked');
});

it('uses PIN after enrollment changes and requires verification to reconnect biometrics', async () => {
  records.set(email, { ...await createPinRecord(defaultPin, 'faceId'), biometricKey: marker });
  jest.mocked(authenticateBiometricKey).mockResolvedValueOnce('unavailable');
  await mount();
  await act(async () => { expect(await current.attemptBiometrics('Unlock', true)).toBe('unavailable'); });
  expect(current.biometricReady).toBe(false);
  expect(removeBiometricKey).toHaveBeenCalledWith(marker);
  const biometric = { method: 'faceId', prompt: 'Unlock' } as const;
  jest.mocked(createBiometricKey).mockResolvedValueOnce(marker);
  await act(async () => {
    expect(await current.attemptPin(defaultPin)).toBe('verified');
    expect(await current.applyChange('enableBiometrics', { biometric })).toBe('verificationRequired');
    expect(await current.verifyChange(defaultPin, 'enableBiometrics')).toBe('verified');
    expect(await current.applyChange('enableBiometrics', { biometric })).toBe('saved');
  });
  expect(current.biometricReady).toBe(true);
  await act(async () => {
    expect(await current.applyChange('disableBiometrics')).toBe('verificationRequired');
    expect(await current.verifyChange(defaultPin, 'disableBiometrics')).toBe('verified');
    expect(await current.applyChange('disableBiometrics')).toBe('saved');
  });
  expect(current.biometric).toBeNull();
  expect(current.pinEnabled).toBe(true);
});

it('relocks at the configured delay and invalidates settings verification on shorter exits', async () => {
  let clock = 100_000;
  jest.spyOn(Date, 'now').mockImplementation(() => clock);
  records.set(email, await createPinRecord(defaultPin, null));
  await mount();
  await act(async () => {
    expect(await current.attemptPin(defaultPin)).toBe('verified');
    expect(await current.verifyChange(defaultPin, 'disablePin')).toBe('verified');
    appState('background');
    clock += 59_999;
    appState('active');
    expect(await current.applyChange('disablePin')).toBe('verificationRequired');
  });
  expect(current.phase).toBe('unlocked');
  await act(async () => appState('background'));
  expect(current.privacyCover).toBe(true);
  clock += 60_000;
  await act(async () => appState('active'));
  expect(current.privacyCover).toBe(false);
  expect(current.phase).toBe('locked');
});

it('cannot issue a delayed verification grant after leaving Security settings', async () => {
  records.set(email, await createPinRecord(defaultPin, null));
  await mount();
  await act(async () => { await current.attemptPin(defaultPin); });
  let finishWrite!: () => void;
  let writing!: () => void;
  const reachedStorage = new Promise<void>((resolve) => { writing = resolve; });
  jest.mocked(saveUnlockRecord).mockImplementationOnce(() => new Promise<void>((resolve) => {
    finishWrite = resolve;
    writing();
  }));

  await act(async () => {
    const result = current.verifyChange(defaultPin, 'disablePin');
    await reachedStorage;
    current.cancelVerification();
    finishWrite();
    expect(await result).toBe('unavailable');
    expect(await current.applyChange('disablePin')).toBe('verificationRequired');
  });
  expect(current.pinEnabled).toBe(true);
});

it('keeps the account locked when recovery starts during a correct PIN submission', async () => {
  records.set(email, await createPinRecord(defaultPin, null));
  await mount();
  let finishWrite!: () => void;
  let writing!: () => void;
  const reachedStorage = new Promise<void>((resolve) => { writing = resolve; });
  jest.mocked(saveUnlockRecord).mockImplementationOnce(() => new Promise<void>((resolve) => {
    finishWrite = resolve;
    writing();
  }));

  await act(async () => {
    const result = current.attemptPin(defaultPin);
    await reachedStorage;
    current.lock();
    finishWrite();
    expect(await result).toBe('unavailable');
  });
  expect(current.phase).toBe('locked');
});

it('persists incorrect attempts across relaunch and preserves lock settings during email recovery', async () => {
  const preferences = { autoLockMinutes: 5, lockOnExit: true } as const;
  records.set(email, { ...await createPinRecord(defaultPin, null), preferences });
  await mount();
  await act(async () => {
    for (let guess = 0; guess < PIN_ATTEMPT_LIMIT; guess++) await current.attemptPin('0000');
  });
  await act(async () => root.unmount());
  root = createRoot();
  await mount();
  await act(async () => { expect(await current.attemptPin(defaultPin)).toBe('paused'); });
  await act(async () => { await current.requireNewPin(); });
  expect(current.setupRequired).toBe(true);
  await act(async () => {
    await expect(current.skip()).rejects.toThrow();
    expect(await current.setPin('2840')).toBe(true);
    appState('background');
    appState('active');
  });
  expect(current.preferences).toEqual(preferences);
  expect(current.phase).toBe('locked');
});

it('unlocks after email verification, keeps the PIN and clears failed attempts', async () => {
  records.set(email, { ...await createPinRecord(defaultPin, null) });
  await mount();
  await act(async () => {
    await current.attemptPin('0000');
    await current.attemptPin('0000');
  });
  expect(current.attempts.failures).toBe(2);
  await act(async () => { await current.unlockWithEmail(); });
  expect(current.phase).toBe('unlocked');
  expect(current.setupRequired).toBe(false);
  expect(current.attempts.failures).toBe(0);
  await act(async () => { current.lock(); });
  await act(async () => { expect(await current.attemptPin(defaultPin)).toBe('verified'); });
  expect(authenticateBiometricKey).not.toHaveBeenCalled();
});

it('refuses email unlock when no PIN is configured', async () => {
  await mount();
  expect(current.phase).toBe('unconfigured');
  await act(async () => { await expect(current.unlockWithEmail()).rejects.toThrow(); });
  expect(current.phase).toBe('unconfigured');
});
