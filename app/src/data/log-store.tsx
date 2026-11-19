import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { timerSideMs, type LogEvent, type RunningTimer, type Side } from '@/data/log-events';

const STORAGE_KEY = 'nappa.log.v1';

type Stored = { events: LogEvent[]; timer: RunningTimer | null };

export type NewEvent = Omit<LogEvent, 'id' | 'pendingSync' | 'createdAt' | 'updatedAt'>;

type LogStore = {
  ready: boolean;
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

const newId = () => `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Local-first log: events and the running timer, saved on this phone (AsyncStorage) after every change.
 * Everything is `pendingSync` until the M2 events API exists.
 */
export function LogStoreProvider({ children, loggedBy }: { children: ReactNode; loggedBy: string }) {
  const [state, setState] = useState<Stored>({ events: [], timer: null });
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(JSON.parse(raw) as Stored);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const add = useCallback(
    (input: NewEvent) => {
      const now = new Date().toISOString();
      const event: LogEvent = { ...input, loggedBy: input.loggedBy || loggedBy, id: newId(), pendingSync: true, createdAt: now, updatedAt: now };
      setState((s) => ({ ...s, events: [...s.events, event] }));
      return event;
    },
    [loggedBy],
  );

  const update = useCallback((id: string, patch: Partial<NewEvent>) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === id ? { ...e, ...patch, pendingSync: true, updatedAt: new Date().toISOString() } : e)),
    }));
  }, []);

  const remove = useCallback((id: string) => {
    let removed: LogEvent | undefined;
    setState((s) => {
      removed = s.events.find((e) => e.id === id);
      return { ...s, events: s.events.filter((e) => e.id !== id) };
    });
    return () => {
      if (removed) {
        const back = removed;
        setState((s) => ({ ...s, events: [...s.events, back] }));
      }
    };
  }, []);

  const startTimer = useCallback<LogStore['startTimer']>((kind, babyId, opts) => {
    const startedAt = opts?.startedAt ?? new Date().toISOString();
    setState((s) => ({
      ...s,
      timer: {
        kind,
        babyId,
        startedAt,
        pausedMs: 0,
        ...(kind === 'nursing' ? { side: opts?.side, sideStartedAt: opts?.side ? startedAt : undefined, sideMs: { left: 0, right: 0 } } : {}),
      },
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState((s) => {
      if (!s.timer || s.timer.pausedAt) return s;
      const now = Date.now();
      const sideMs = s.timer.kind === 'nursing' ? timerSideMs(s.timer, now) : s.timer.sideMs;
      return { ...s, timer: { ...s.timer, pausedAt: new Date(now).toISOString(), sideMs, sideStartedAt: undefined } };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setState((s) => {
      if (!s.timer?.pausedAt) return s;
      const now = Date.now();
      return {
        ...s,
        timer: {
          ...s.timer,
          pausedAt: undefined,
          pausedMs: s.timer.pausedMs + (now - Date.parse(s.timer.pausedAt)),
          sideStartedAt: s.timer.side ? new Date(now).toISOString() : undefined,
        },
      };
    });
  }, []);

  const switchSide = useCallback((side: Side) => {
    setState((s) => {
      if (!s.timer || s.timer.kind !== 'nursing') return s;
      const now = Date.now();
      const sideMs = timerSideMs(s.timer, now);
      return { ...s, timer: { ...s.timer, side, sideMs, sideStartedAt: s.timer.pausedAt ? undefined : new Date(now).toISOString() } };
    });
  }, []);

  const stopTimer = useCallback(
    (extra?: Partial<NewEvent>) => {
      const timer = state.timer;
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
      const event = add(base);
      setState((s) => ({ ...s, timer: null }));
      return event;
    },
    [state.timer, add, loggedBy],
  );

  const discardTimer = useCallback(() => setState((s) => ({ ...s, timer: null })), []);

  const value = useMemo<LogStore>(
    () => ({ ready, events: state.events, timer: state.timer, add, update, remove, startTimer, pauseTimer, resumeTimer, switchSide, stopTimer, discardTimer }),
    [ready, state, add, update, remove, startTimer, pauseTimer, resumeTimer, switchSide, stopTimer, discardTimer],
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
