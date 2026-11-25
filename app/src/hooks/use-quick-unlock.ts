import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { authenticateBiometricKey, createBiometricKey, readBiometricCapability, removeBiometricKey } from '@/lib/unlock/biometrics';
import {
  DEFAULT_LOCK_PREFERENCES, canAttemptPin, createPinRecord, emptyAttempts, nextFailedAttempt, shouldLockAfterExit, verifyPin,
  type Biometric, type LockPreferences, type PinRecord, type UnlockRecord,
} from '@/lib/unlock/pin';
import { loadUnlockRecord, saveUnlockRecord, unlockStorageKey } from '@/lib/unlock/storage';

type PinResult = 'verified' | 'incorrect' | 'paused' | 'unavailable';
export type QuickUnlockPhase = 'loading' | 'unconfigured' | 'locked' | 'unlocked' | 'unavailable' | 'unsupported';
type AccountState = {
  email: string;
  key: string;
  phase: QuickUnlockPhase;
  record: UnlockRecord | null;
};
type SensitiveChange = 'changePin' | 'disablePin' | 'disableBiometrics' | 'enableBiometrics' | 'relaxLock';
type Verification = { action: SensitiveChange; expiresAt: number; record: PinRecord };
const VERIFICATION_MS = 2 * 60_000;

export function useQuickUnlock(accountEmail: string | null) {
  const email = accountEmail?.trim().toLowerCase() || '';
  const [previousEmail, setPreviousEmail] = useState(email);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [privacyCover, setPrivacyCover] = useState(() => AppState.currentState === 'background' || AppState.currentState === 'inactive');
  const [reload, setReload] = useState(0);
  const live = useRef<AccountState | null>(null);
  const scope = useRef<symbol | null>(null);
  const operation = useRef<symbol | null>(null);
  const pendingWrite = useRef<Promise<void>>(Promise.resolve());
  const promptAttempted = useRef(false);
  const backgroundedAt = useRef<number | null>(null);
  const generation = useRef(0);
  const verification = useRef<Verification | null>(null);
  const verificationVersion = useRef(0);
  if (previousEmail !== email) {
    setPreviousEmail(email);
    setAccount(null);
  }
  const current = account?.email === email ? account : null;
  const phase: QuickUnlockPhase = Platform.OS === 'web' ? 'unsupported' : current?.phase ?? 'loading';
  const pin = current?.record?.kind === 'pin' ? current.record : null;

  const publish = useCallback((state: AccountState | null) => {
    live.current = state;
    setAccount(state);
  }, []);

  useEffect(() => {
    const identity = Symbol();
    scope.current = identity;
    live.current = null;
    promptAttempted.current = false;
    verification.current = null;
    backgroundedAt.current = AppState.currentState === 'background' ? Date.now() : null;
    if (email && Platform.OS !== 'web') {
      void (async () => {
        let key = '';
        try {
          key = await unlockStorageKey(email);
          await pendingWrite.current.catch(() => {});
          const record = await loadUnlockRecord(key);
          if (scope.current === identity) publish({ email, key, record,
            phase: record?.kind === 'pin' ? 'locked' : record?.kind === 'skipped' ? 'unlocked' : 'unconfigured' });
        } catch {
          if (scope.current === identity) publish({ email, key, record: null, phase: 'unavailable' });
        }
      })();
    }
    return () => { scope.current = null; };
  }, [email, publish, reload]);

  const cancelVerification = useCallback(() => {
    verificationVersion.current++;
    verification.current = null;
  }, []);

  const lock = useCallback(() => {
    generation.current++;
    cancelVerification();
    const state = live.current;
    if (state?.email !== email || state.phase !== 'unlocked' || state.record?.kind !== 'pin') return;
    promptAttempted.current = false;
    publish({ ...state, phase: 'locked' });
  }, [cancelVerification, email, publish]);

  useLayoutEffect(() => {
    if (Platform.OS === 'web') return;
    const checkLock = (elapsed: number) => {
      const record = live.current?.record;
      if (record?.kind === 'pin' && shouldLockAfterExit(record.preferences, elapsed)) lock();
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'inactive' || state === 'background') setPrivacyCover(true);
      if (state === 'background' && backgroundedAt.current === null) {
        backgroundedAt.current = Date.now();
        generation.current++;
        cancelVerification();
        checkLock(0);
      }
      if (state === 'active') {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since !== null) checkLock(Date.now() - since);
        // The lock decision and removal of the cover are committed together.
        setPrivacyCover(false);
      }
    });
    return () => subscription.remove();
  }, [cancelVerification, lock]);

  // A native prompt or secure-storage write may outlive a screen, background transition, or account.
  const run = useCallback(async <T,>(work: (transaction: {
    state: AccountState;
    isCurrent: () => boolean;
    canAuthenticate: () => boolean;
    write: (record: UnlockRecord, nextPhase?: QuickUnlockPhase) => Promise<boolean>;
  }) => Promise<T>): Promise<T | undefined> => {
    const state = live.current;
    const identity = scope.current;
    if (!identity || !state?.key || state.email !== email || operation.current || backgroundedAt.current !== null) return;
    const token = Symbol();
    const started = generation.current;
    operation.current = token;
    const isCurrent = () => scope.current === identity && operation.current === token;
    const canAuthenticate = () => isCurrent() && generation.current === started;
    const write = async (record: UnlockRecord, nextPhase = state.phase) => {
      if (!isCurrent()) return false;
      const writeResult = saveUnlockRecord(state.key, record);
      pendingWrite.current = writeResult;
      await writeResult;
      const oldKey = state.record?.kind === 'pin' ? state.record.biometricKey : undefined;
      const newKey = record.kind === 'pin' ? record.biometricKey : undefined;
      if (oldKey && oldKey !== newKey) void removeBiometricKey(oldKey).catch(() => {});
      if (!isCurrent()) return true;
      const staleUnlock = record.kind === 'pin' && nextPhase === 'unlocked' && !canAuthenticate();
      // Keep a previously unlocked session if it returned inside its grace period, but
      // never use an interrupted verification to open a previously locked session.
      const remainUnlocked = state.phase === 'unlocked' && live.current?.phase === 'unlocked';
      const lockWhileAway = record.kind === 'pin' && backgroundedAt.current !== null
        && shouldLockAfterExit(record.preferences, Date.now() - backgroundedAt.current);
      publish({ ...state, record, phase: (staleUnlock && !remainUnlocked) || lockWhileAway ? 'locked' : nextPhase });
      return true;
    };
    try {
      return await work({ state, isCurrent, canAuthenticate, write });
    } finally {
      if (operation.current === token) operation.current = null;
    }
  }, [email, publish]);

  const verify = useCallback(async (value: string, action?: SensitiveChange): Promise<PinResult> => {
    return await run(async ({ state, canAuthenticate, write }): Promise<PinResult> => {
      const record = state.record;
      if (record?.kind !== 'pin' || state.phase !== (action ? 'unlocked' : 'locked')) return 'unavailable';
      verification.current = null;
      const version = verificationVersion.current;
      const now = Date.now();
      if (!canAttemptPin(record.attempts, now)) return 'paused';
      const correct = await verifyPin(value, record);
      const attempts = correct ? emptyAttempts : nextFailedAttempt(record.attempts, now);
      const updated = { ...record, attempts };
      if (!await write(updated, correct && !action && canAuthenticate() ? 'unlocked' : state.phase)) return 'unavailable';
      if (!canAuthenticate() || (action && verificationVersion.current !== version)) return 'unavailable';
      if (!correct) return canAttemptPin(attempts, now) ? 'incorrect' : 'paused';
      if (action) verification.current = { action, record: updated, expiresAt: Date.now() + VERIFICATION_MS };
      return 'verified';
    }).catch(() => 'unavailable' as const) ?? 'unavailable';
  }, [run]);

  const attemptPin = useCallback((value: string) => verify(value), [verify]);

  // The lock screen only prompts when the user picks Face ID / fingerprint; `automatic` is kept
  // for callers that want a one-time prompt per lock.
  const attemptBiometrics = useCallback(async (prompt: string, automatic = false) => {
    return await run(async ({ state, canAuthenticate, write }) => {
      const record = state.record;
      if (state.phase !== 'locked' || record?.kind !== 'pin' || !record.biometricKey
        || (automatic && promptAttempted.current)) return 'ignored';
      promptAttempted.current = true;
      const result = await authenticateBiometricKey(record.biometricKey, prompt);
      if (!canAuthenticate()) return 'fallback';
      if (result === 'success') {
        return await write({ ...record, attempts: emptyAttempts }, 'unlocked') && canAuthenticate() ? 'success' : 'fallback';
      }
      if (result === 'unavailable') {
        // A deleted or invalidated marker must be re-enrolled with the backup PIN.
        await write({ ...record, biometricKey: undefined });
      }
      return result;
    }).catch(() => 'fallback' as const) ?? 'ignored';
  }, [run]);

  const setPin = async (value: string, biometric?: { method: Biometric; prompt: string }) => {
    const result = await run(async ({ state, canAuthenticate, write }) => {
      if (state.phase !== 'unconfigured' && !(state.phase === 'unlocked' && state.record?.kind === 'skipped')) return;
      const version = verificationVersion.current;
      const canSetPin = () => canAuthenticate() && verificationVersion.current === version;
      const record = { ...await createPinRecord(value, null), preferences: state.record?.preferences ?? DEFAULT_LOCK_PREFERENCES };
      if (!canSetPin()) return;
      const key = biometric ? await createBiometricKey(biometric.prompt) : null;
      let saved = false;
      try {
        if (!canSetPin() || (biometric && !key)) return;
        saved = await write({ ...record, biometric: biometric?.method ?? null, biometricKey: key ?? undefined }, 'unlocked');
        return saved;
      } finally {
        if (key && !saved) void removeBiometricKey(key).catch(() => {});
      }
    });
    return result === true;
  };

  const applyChange = async (change: SensitiveChange, input?: {
    pin?: string;
    biometric?: { method: Biometric; prompt: string };
    preferences?: LockPreferences;
  }) => {
    const result = await run(async ({ state, canAuthenticate, write }) => {
      const record = state.record;
      const grant = verification.current;
      verification.current = null;
      if (state.phase !== 'unlocked' || record?.kind !== 'pin' || grant?.record !== record
        || grant.action !== change || Date.now() >= grant.expiresAt) return 'verificationRequired';
      const version = verificationVersion.current;
      const canApply = () => canAuthenticate() && verificationVersion.current === version;
      if (change === 'changePin' && input?.pin) {
        const updated = await createPinRecord(input.pin, null);
        if (canApply()) return await write({ ...record, salt: updated.salt, hash: updated.hash }) ? 'saved' : 'failed';
      }
      if (change === 'disablePin') return await write({ kind: 'skipped', preferences: record.preferences }) ? 'saved' : 'failed';
      if (change === 'disableBiometrics') return await write({ ...record, biometric: null, biometricKey: undefined }) ? 'saved' : 'failed';
      if (change === 'relaxLock' && input?.preferences) return await write({ ...record, preferences: input.preferences }) ? 'saved' : 'failed';
      if (change === 'enableBiometrics' && input?.biometric) {
        const { method, prompt } = input.biometric;
        const capability = await readBiometricCapability();
        if (!canApply() || !capability.available || capability.method !== method) return 'biometricFailed';
        const key = await createBiometricKey(prompt);
        if (!key) return 'biometricFailed';
        let saved = false;
        try {
          if (!canApply()) return 'biometricFailed';
          saved = await write({ ...record, biometric: method, biometricKey: key });
          return saved ? 'saved' : 'failed';
        } finally {
          if (!saved) void removeBiometricKey(key).catch(() => {});
        }
      }
      return 'failed';
    }).catch(() => 'failed' as const);
    return result ?? 'failed';
  };

  const setPreferences = async (preferences: LockPreferences) => {
    const result = await run(async ({ state, write }) => {
      const record = state.record;
      if (state.phase !== 'unlocked' || record?.kind !== 'pin') return false;
      const previous = record.preferences;
      const previousDelay = previous.lockOnExit ? 0 : previous.autoLockMinutes;
      const nextDelay = preferences.lockOnExit ? 0 : preferences.autoLockMinutes;
      if ((previous.lockOnExit && !preferences.lockOnExit) || nextDelay > previousDelay) return false;
      verification.current = null;
      return await write({ ...record, preferences });
    });
    return result === true;
  };

  const skip = async () => {
    const saved = await run(async ({ state, write }) => state.phase === 'unconfigured' && state.record?.kind !== 'reset'
      ? await write({ kind: 'skipped' }, 'unlocked') : false);
    if (!saved) throw new Error('Quick unlock setup is unavailable');
  };

  /**
   * Called only after the server verifies an email code or the password for this account: that proves
   * ownership, so the session opens and the existing PIN (and its attempt count) is kept, reset.
   */
  const unlockWithEmail = async () => {
    const saved = await run(async ({ state, write }) => state.phase === 'locked' && state.record?.kind === 'pin'
      ? await write({ ...state.record, attempts: emptyAttempts }, 'unlocked') : false);
    if (!saved) throw new Error('Email unlock is unavailable');
  };

  /** Called only after the server verifies the email code for this account. */
  const requireNewPin = async () => {
    const saved = await run(async ({ state, write }) => state.phase === 'locked' || state.phase === 'unavailable'
      ? await write({ kind: 'reset', preferences: state.record?.preferences }, 'unconfigured') : false);
    if (!saved) throw new Error('PIN recovery is unavailable');
  };

  return {
    phase,
    privacyCover,
    setupRequired: current?.record?.kind === 'reset',
    pinEnabled: pin !== null,
    biometric: pin?.biometric ?? null,
    biometricReady: !!pin?.biometricKey,
    attempts: pin?.attempts ?? emptyAttempts,
    preferences: current?.record?.preferences ?? DEFAULT_LOCK_PREFERENCES,
    setPin,
    skip,
    requireNewPin,
    unlockWithEmail,
    attemptPin,
    attemptBiometrics,
    verifyChange: (value: string, action: SensitiveChange) => verify(value, action),
    applyChange,
    setPreferences,
    cancelVerification,
    lock,
    stopAutomaticPrompt: () => { promptAttempted.current = true; },
    retryStorage: () => {
      scope.current = null;
      publish(null);
      setReload((version) => version + 1);
    },
  };
}

export type QuickUnlockController = ReturnType<typeof useQuickUnlock>;
export const QuickUnlockContext = createContext<(QuickUnlockController & { recoverPin: () => void }) | null>(null);

export function useQuickUnlockSettings() {
  const controller = useContext(QuickUnlockContext);
  if (!controller) throw new Error('Quick unlock settings require a controller');
  return controller;
}
