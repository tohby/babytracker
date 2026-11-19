import { randomUUID } from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { loadLocal, migrateLegacy, saveLocalEventSync, saveLocalTimerSync } from '@/data/log-database';
import { timerSideMs, type LogEvent, type RunningTimer, type Side } from '@/data/log-events';
import { onSyncForeground, syncLogs } from '@/data/log-network';

type Stored = { events: LogEvent[]; timer: RunningTimer | null };

export type NewEvent = Omit<LogEvent, 'id' | 'pendingSync' | 'createdAt' | 'updatedAt'>;

type LogStore = {
  ready: boolean;
  lastSyncSucceeded: boolean;
  events: LogEvent[];
  timer: RunningTimer | null;
  add: (event: NewEvent) => LogEvent;
  update: (id: string, patch: Partial<NewEvent>) => void;
  /** Removes the event and returns a function that puts it back (the toast's Undo). */
  remove: (id: string) => () => void;
  startTimer: (kind: RunningTimer['kind'], babyId: string, opts?: { startedAt?: string; side?: Side }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  switchSide: (side: Side) => void;
  /** Ends the timer and saves the event it describes. */
  stopTimer: (extra?: Partial<NewEvent>) => LogEvent | null;
  discardTimer: () => void;
};

const Ctx = createContext<LogStore | null>(null);

const newId = randomUUID;

/** Local-first log backed by account-scoped SQLite rows and an outbox. */
export function LogStoreProvider({ children, loggedBy, account }: { children: ReactNode; loggedBy: string; account: string | null }) {
  const [state, setState] = useState<Stored>({ events: [], timer: null });
  const [ready, setReady] = useState(false);
  const [lastSyncSucceeded, setLastSyncSucceeded] = useState(false);
  const activeAccount = useRef(account);
  const stateRef = useRef(state);
  useEffect(() => { activeAccount.current = account; stateRef.current = state; }, [account, state]);
  useEffect(() => () => { activeAccount.current = null; }, []);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    (async () => {
      await migrateLegacy(account);
      const local = await loadLocal(account);
      if (cancelled) return;
      stateRef.current = local;
      setState(local);
      setReady(true);
    })().catch((error) => { if (!cancelled) console.error('Log storage unavailable', error); });
    return () => { cancelled = true; };
  }, [account]);

  useEffect(() => {
    if (!ready || !account) return;
    const refresh = () => { syncLogs(account, (next) => { if (activeAccount.current === account) { stateRef.current = next; setState(next); } })
      .then((success) => { if (activeAccount.current === account) setLastSyncSucceeded(success); }).catch(() => {}); };
    const unsubscribe = onSyncForeground(refresh);
    const interval = setInterval(refresh, 30_000);
    refresh();
    return () => { unsubscribe(); clearInterval(interval); };
  }, [ready, account]);

  const persistTimer = useCallback((timer: RunningTimer | null) => {
    if (!account || !ready) return;
    saveLocalTimerSync(account, timer);
    stateRef.current = { ...stateRef.current, timer };
    setState((current) => ({ ...current, timer }));
  }, [account, ready]);

  const add = useCallback(
    (input: NewEvent) => {
      const now = new Date().toISOString();
      const event: LogEvent = { ...input, loggedBy: input.loggedBy || loggedBy, id: newId(), pendingSync: true, createdAt: now, updatedAt: now };
      if (!account || !ready) throw new Error('Log storage is not ready');
      saveLocalEventSync(account, event);
      stateRef.current = { ...stateRef.current, events: [...stateRef.current.events, event] };
      setState((s) => ({ ...s, events: [...s.events, event] }));
      setLastSyncSucceeded(false);
      syncLogs(account, (next) => { if (activeAccount.current === account) { stateRef.current = next; setState(next); } }).then((success) => { if (activeAccount.current === account) setLastSyncSucceeded(success); }).catch(() => {});
      return event;
    },
    [loggedBy, account, ready],
  );

  const update = useCallback((id: string, patch: Partial<NewEvent>) => {
    const original = stateRef.current.events.find((event) => event.id === id);
    if (!original || !account || !ready) return;
    const updated = { ...original, ...patch, pendingSync: true, updatedAt: new Date().toISOString() };
    saveLocalEventSync(account, updated);
    stateRef.current = { ...stateRef.current, events: stateRef.current.events.map((event) => event.id === id ? updated : event) };
    setState((s) => ({
      ...s,
      events: s.events.map((event) => (event.id === id ? updated : event)),
    }));
    setLastSyncSucceeded(false);
    syncLogs(account, (next) => { if (activeAccount.current === account) { stateRef.current = next; setState(next); } }).then((success) => { if (activeAccount.current === account) setLastSyncSucceeded(success); }).catch(() => {});
  }, [account, ready]);

  const remove = useCallback((id: string) => {
    const removed = stateRef.current.events.find((event) => event.id === id);
    if (!removed || !account || !ready) return () => {};
    saveLocalEventSync(account, { ...removed, deletedAt: new Date().toISOString(), pendingSync: true });
    stateRef.current = { ...stateRef.current, events: stateRef.current.events.filter((event) => event.id !== id) };
    setState((s) => ({ ...s, events: s.events.filter((event) => event.id !== id) }));
    setLastSyncSucceeded(false);
    syncLogs(account, (next) => { if (activeAccount.current === account) { stateRef.current = next; setState(next); } }).then((success) => { if (activeAccount.current === account) setLastSyncSucceeded(success); }).catch(() => {});
    return () => {
      const back = { ...removed, deletedAt: undefined, pendingSync: true, updatedAt: new Date().toISOString() };
      saveLocalEventSync(account, back);
      stateRef.current = { ...stateRef.current, events: [...stateRef.current.events.filter((event) => event.id !== id), back] };
      setState((s) => ({ ...s, events: [...s.events.filter((event) => event.id !== id), back] }));
      setLastSyncSucceeded(false);
      syncLogs(account, (next) => { if (activeAccount.current === account) { stateRef.current = next; setState(next); } }).then((success) => { if (activeAccount.current === account) setLastSyncSucceeded(success); }).catch(() => {});
    };
  }, [account, ready]);

  const startTimer = useCallback<LogStore['startTimer']>((kind, babyId, opts) => {
    const startedAt = opts?.startedAt ?? new Date().toISOString();
    persistTimer({
        kind,
        babyId,
        startedAt,
        pausedMs: 0,
        ...(kind === 'nursing' ? { side: opts?.side, sideStartedAt: opts?.side ? startedAt : undefined, sideMs: { left: 0, right: 0 } } : {}),
    });
  }, [persistTimer]);

  const pauseTimer = useCallback(() => {
      const timer = stateRef.current.timer;
      if (!timer || timer.pausedAt) return;
      const now = Date.now();
      const sideMs = timer.kind === 'nursing' ? timerSideMs(timer, now) : timer.sideMs;
      persistTimer({ ...timer, pausedAt: new Date(now).toISOString(), sideMs, sideStartedAt: undefined });
  }, [persistTimer]);

  const resumeTimer = useCallback(() => {
      const timer = stateRef.current.timer;
      if (!timer?.pausedAt) return;
      const now = Date.now();
      persistTimer({
          ...timer,
          pausedAt: undefined,
          pausedMs: timer.pausedMs + (now - Date.parse(timer.pausedAt)),
          sideStartedAt: timer.side ? new Date(now).toISOString() : undefined,
      });
  }, [persistTimer]);

  const switchSide = useCallback((side: Side) => {
      const timer = stateRef.current.timer;
      if (!timer || timer.kind !== 'nursing') return;
      const now = Date.now();
      const sideMs = timerSideMs(timer, now);
      persistTimer({ ...timer, side, sideMs, sideStartedAt: timer.pausedAt ? undefined : new Date(now).toISOString() });
  }, [persistTimer]);

  const stopTimer = useCallback(
    (extra?: Partial<NewEvent>) => {
      const timer = stateRef.current.timer;
      if (!timer) return null;
      const now = Date.now();
      const sides = timerSideMs(timer, now);
      const base: NewEvent = {
        babyId: timer.babyId,
        type: timer.kind === 'sleep' ? 'sleep' : timer.kind,
        startAt: timer.startedAt,
        endAt: new Date(timer.pausedAt ? Date.parse(timer.pausedAt) : now).toISOString(),
        loggedBy,
        ...(timer.kind === 'nursing' ? { nursing: { leftMs: sides.left, rightMs: sides.right, lastSide: timer.side ?? 'left' } } : {}),
        ...extra,
      };
      if (!account || !ready) throw new Error('Log storage is not ready');
      const createdAt = new Date().toISOString();
      const event: LogEvent = { ...base, id: newId(), pendingSync: true, createdAt, updatedAt: createdAt };
      saveLocalEventSync(account, event, true);
      stateRef.current = { ...stateRef.current, events: [...stateRef.current.events, event], timer: null };
      setState((current) => ({ ...current, events: [...current.events, event], timer: null }));
      setLastSyncSucceeded(false);
      syncLogs(account, (next) => { if (activeAccount.current === account) { stateRef.current = next; setState(next); } }).then((success) => { if (activeAccount.current === account) setLastSyncSucceeded(success); }).catch(() => {});
      return event;
    },
    [account, ready, loggedBy],
  );

  const discardTimer = useCallback(() => persistTimer(null), [persistTimer]);

  const value = useMemo<LogStore>(
    () => ({ ready, lastSyncSucceeded, events: state.events, timer: state.timer, add, update, remove, startTimer, pauseTimer, resumeTimer, switchSide, stopTimer, discardTimer }),
    [ready, lastSyncSucceeded, state, add, update, remove, startTimer, pauseTimer, resumeTimer, switchSide, stopTimer, discardTimer],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLogStore(): LogStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLogStore must be used inside LogStoreProvider');
  return v;
}

/** This baby's events, newest first. */
export function useBabyEvents(babyId: string | undefined): LogEvent[] {
  const { events } = useLogStore();
  return useMemo(
    () => (babyId ? events.filter((e) => e.babyId === babyId).sort((a, b) => Date.parse(b.startAt) - Date.parse(a.startAt)) : []),
    [events, babyId],
  );
}
