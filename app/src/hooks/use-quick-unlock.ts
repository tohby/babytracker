import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { authenticateBiometric, readBiometricCapability } from '@/lib/unlock/biometrics';
import {
  BACKGROUND_LOCK_MS, canAttemptPin, createPinRecord, emptyAttempts, nextFailedAttempt, verifyPin,
  type Biometric, type UnlockRecord,
} from '@/lib/unlock/pin';
import { loadUnlockRecord, saveUnlockRecord, unlockStorageKey } from '@/lib/unlock/storage';

type PinResult = 'unlocked' | 'incorrect' | 'paused' | 'unavailable';
export type QuickUnlockPhase = 'loading' | 'unconfigured' | 'locked' | 'unlocked' | 'unavailable' | 'unsupported';
type AccountState = {
  email: string;
  key: string;
  phase: QuickUnlockPhase;
  record: UnlockRecord | null;
};

export function useQuickUnlock(accountEmail: string | null) {
  const email = accountEmail?.trim().toLowerCase() || '';
  const [previousEmail, setPreviousEmail] = useState(email);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [reload, setReload] = useState(0);
  const scope = useRef<symbol | null>(null);
  const operation = useRef<symbol | null>(null);
  const pendingWrite = useRef<Promise<void>>(Promise.resolve());
  const promptAttempted = useRef(false);
  const backgroundedAt = useRef<number | null>(null);
  const lockGeneration = useRef(0);
  if (previousEmail !== email) {
    // Drop the old unlocked state synchronously, including sign-out followed by sign-in as the same account.
    setPreviousEmail(email);
    setAccount(null);
  }
  const current = account?.email === email ? account : null;
  const phase: QuickUnlockPhase = Platform.OS === 'web' ? 'unsupported' : current?.phase ?? 'loading';
  const pin = current?.record?.kind === 'pin' ? current.record : null;

  useEffect(() => {
    const identity = Symbol();
    scope.current = identity;
    operation.current = null;
    promptAttempted.current = false;
    backgroundedAt.current = null;
    if (!email || Platform.OS === 'web') return;
    void (async () => {
      let key = '';
      try {
        key = await unlockStorageKey(email);
        await pendingWrite.current.catch(() => {});
        const record = await loadUnlockRecord(key);
        if (scope.current === identity) setAccount({ email, key, record,
          phase: record?.kind === 'pin' ? 'locked' : record?.kind === 'skipped' ? 'unlocked' : 'unconfigured' });
      } catch {
        if (scope.current === identity) setAccount({ email, key, record: null, phase: 'unavailable' });
      }
    })();
    return () => {
      scope.current = null;
    };
  }, [email, reload]);

  useEffect(() => {
    if (!email || Platform.OS === 'web') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const lock = () => {
      lockGeneration.current += 1;
      setAccount((old) => old?.email === email && old.phase === 'unlocked' && old.record?.kind === 'pin'
        ? { ...old, phase: 'locked' }
        : old);
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' && backgroundedAt.current === null) {
        backgroundedAt.current = Date.now();
        timer = setTimeout(lock, BACKGROUND_LOCK_MS);
      }
      if (state === 'active') {
        clearTimeout(timer);
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since !== null && Date.now() - since >= BACKGROUND_LOCK_MS) lock();
      }
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [email]);

  useEffect(() => {
    if (phase === 'unlocked') promptAttempted.current = false;
  }, [phase]);

  const write = useCallback(async (record: UnlockRecord, phase: QuickUnlockPhase, attempt?: symbol, generation = lockGeneration.current) => {
    if (!current?.key) throw new Error('Quick unlock storage unavailable');
    const identity = scope.current;
    const active = () => scope.current === identity && (!attempt || operation.current === attempt);
    const writeResult = pendingWrite.current.catch(() => {}).then(async () => {
      if (active()) await saveUnlockRecord(current.key, record);
    });
    pendingWrite.current = writeResult;
    await writeResult;
    if (active()) {
      const lockImmediately = phase === 'unlocked' && record.kind === 'pin' && (
        lockGeneration.current !== generation
        || (backgroundedAt.current !== null && Date.now() - backgroundedAt.current >= BACKGROUND_LOCK_MS)
      );
      setAccount({ ...current, record, phase: lockImmediately ? 'locked' : phase });
    }
  }, [current]);

  const setPin = useCallback(async (value: string, method: Biometric | null) => {
    if (phase !== 'unconfigured') throw new Error('Quick unlock setup is unavailable');
    const identity = scope.current;
    const generation = lockGeneration.current;
    const record = await createPinRecord(value, method);
    if (scope.current === identity) await write(record, 'unlocked', undefined, generation);
  }, [phase, write]);

  const skip = useCallback(async () => {
    if (phase !== 'unconfigured' || current?.record?.kind === 'reset') return;
    await write({ kind: 'skipped' }, 'unlocked');
  }, [current, phase, write]);

  /** Call only after the API has verified an email code for this account. */
  const requireNewPin = useCallback(async () => {
    if (phase !== 'locked' && phase !== 'unavailable') throw new Error('No PIN to recover');
    const recovery = Symbol();
    operation.current = recovery;
    try {
      await write({ kind: 'reset' }, 'unconfigured', recovery);
    } finally {
      if (operation.current === recovery) operation.current = null;
    }
  }, [phase, write]);

  const attemptPin = useCallback(async (value: string): Promise<PinResult> => {
    if (!pin || phase !== 'locked' || operation.current) return 'unavailable';
    const now = Date.now();
    if (!canAttemptPin(pin.attempts, now)) return 'paused';
    const attempt = Symbol();
    operation.current = attempt;
    const identity = scope.current;
    const generation = lockGeneration.current;
    try {
      const correct = await verifyPin(value, pin);
      const attempts = correct ? emptyAttempts : nextFailedAttempt(pin.attempts, now);
      if (scope.current !== identity || operation.current !== attempt) return 'unavailable';
      await write({ ...pin, attempts }, correct ? 'unlocked' : 'locked', attempt, generation);
      return correct ? 'unlocked' : canAttemptPin(attempts, now) ? 'incorrect' : 'paused';
    } catch {
      if (scope.current === identity && operation.current === attempt && current) setAccount({ ...current, phase: 'unavailable' });
      return 'unavailable';
    } finally {
      if (operation.current === attempt) operation.current = null;
    }
  }, [current, phase, pin, write]);

  const attemptBiometrics = useCallback(async (prompt: string, cancel: string, automatic = false) => {
    if (!pin?.biometric || phase !== 'locked' || operation.current || !canAttemptPin(pin.attempts, Date.now())) return 'cancelled';
    if (automatic && promptAttempted.current) return 'cancelled';
    promptAttempted.current = true;
    const attempt = Symbol();
    operation.current = attempt;
    const identity = scope.current;
    const generation = lockGeneration.current;
    try {
      const capability = await readBiometricCapability();
      if (scope.current !== identity || operation.current !== attempt) return 'cancelled';
      if (!capability.available || capability.method !== pin.biometric) return 'unavailable';
      const result = await authenticateBiometric(prompt, cancel);
      if (result === 'success' && scope.current === identity && operation.current === attempt) {
        await write({ ...pin, attempts: emptyAttempts }, 'unlocked', attempt, generation);
      }
      return result;
    } catch {
      if (scope.current === identity && operation.current === attempt && current) setAccount({ ...current, phase: 'unavailable' });
      return 'unavailable';
    } finally {
      if (operation.current === attempt) operation.current = null;
    }
  }, [current, phase, pin, write]);

  return {
    phase,
    setupRequired: current?.record?.kind === 'reset',
    biometric: pin?.biometric ?? null,
    attempts: pin?.attempts ?? emptyAttempts,
    setPin,
    skip,
    requireNewPin,
    attemptPin,
    attemptBiometrics,
    retryStorage: () => {
      setAccount(null);
      setReload((version) => version + 1);
    },
  };
}

export type QuickUnlockController = ReturnType<typeof useQuickUnlock>;
