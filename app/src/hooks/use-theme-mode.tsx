import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, View } from 'react-native';
import { Uniwind } from 'uniwind';

import {
  DEFAULT_THEME_MODE,
  isThemeMode,
  nextAutoSwitch,
  resolveTheme,
  type AppliedTheme,
  type ThemeMode,
} from '@/lib/theme-schedule';

const STORAGE_KEY = 'nappa.themeMode';

/** Safety net while the app is open: catches a clock, timezone or DST change the boundary timer missed. */
const RECHECK_MS = 60_000;

/** If a scheduled switch lands while a finger is on the screen, try again this long after it lifts. */
const AFTER_TOUCH_MS = 400;

type ThemeModeContextValue = {
  /** What the user picked: light, dark or auto. */
  mode: ThemeMode;
  /** What is on screen right now. In Auto this follows the clock. */
  applied: AppliedTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/**
 * Owns the Light / Dark / Auto setting.
 *
 * - Restores the saved mode before rendering its children. The splash screen stays up until the first screen
 *   renders, so the wrong theme never flashes.
 * - Applies it through Uniwind, which also sets the native colour scheme: status bar, keyboard, alerts and
 *   Liquid Glass follow.
 * - In Auto, switches at the schedule boundary while the app is open, re-checks every minute and whenever the app
 *   comes back to the foreground (covers device time, timezone and daylight-saving changes).
 * - A switch the schedule triggers waits until no finger is on the screen; a tap on the control applies at once.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [applied, setApplied] = useState<AppliedTheme>(() => resolveTheme(DEFAULT_THEME_MODE, new Date()));
  const [loaded, setLoaded] = useState(false);
  const touches = useRef(0);
  const pending = useRef<AppliedTheme | null>(null);

  const apply = useCallback((next: AppliedTheme) => {
    Uniwind.setTheme(next);
    setApplied(next);
  }, []);

  /** Scheduled switches: wait for the user's finger to lift so nothing changes under a gesture. */
  const applyWhenIdle = useCallback(
    (next: AppliedTheme) => {
      if (touches.current > 0) {
        pending.current = next;
        return;
      }
      pending.current = null;
      if (Uniwind.currentTheme !== next) apply(next);
    },
    [apply],
  );

  // Restore the saved mode once, before children render (the splash stays up meanwhile).
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .catch(() => null)
      .then((saved) => {
        if (cancelled) return;
        const restored = isThemeMode(saved) ? saved : DEFAULT_THEME_MODE;
        setModeState(restored);
        apply(resolveTheme(restored, new Date()));
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // Auto: follow the clock while the app is open.
  useEffect(() => {
    if (!loaded || mode !== 'auto') return;
    const check = () => applyWhenIdle(resolveTheme('auto', new Date()));

    let boundary: ReturnType<typeof setTimeout>;
    const armBoundary = () => {
      clearTimeout(boundary);
      // +1s so we land just after the boundary, not a hair before it.
      const ms = nextAutoSwitch(new Date()).getTime() - Date.now() + 1_000;
      boundary = setTimeout(() => {
        check();
        armBoundary();
      }, ms);
    };

    check();
    armBoundary();
    const interval = setInterval(check, RECHECK_MS);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // The clock or timezone may have changed while we were in the background.
        check();
        armBoundary();
      }
    });
    return () => {
      clearTimeout(boundary);
      clearInterval(interval);
      appState.remove();
    };
  }, [loaded, mode, applyWhenIdle]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      pending.current = null;
      apply(resolveTheme(next, new Date()));
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
        // Not fatal: the choice still applies now, it just won't survive a restart.
      });
    },
    [apply],
  );

  const value = useMemo(() => ({ mode, applied, setMode }), [mode, applied, setMode]);

  if (!loaded) return null;

  return (
    <ThemeModeContext.Provider value={value}>
      {/* Counts fingers on the screen without taking part in touch handling. */}
      <View
        style={{ flex: 1 }}
        onTouchStart={() => {
          touches.current += 1;
        }}
        onTouchEnd={() => {
          touches.current = Math.max(0, touches.current - 1);
          if (touches.current === 0 && pending.current) {
            const next = pending.current;
            setTimeout(() => applyWhenIdle(next), AFTER_TOUCH_MS);
          }
        }}
        onTouchCancel={() => {
          touches.current = 0;
        }}>
        {children}
      </View>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error('useThemeMode must be used inside ThemeModeProvider');
  return value;
}
