import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getFormatPrefs, setFormatPrefs, type FormatPrefs } from '@/lib/format';

const KEY = 'nappa.formatPrefs';

type Ctx = { prefs: FormatPrefs; update: (patch: Partial<FormatPrefs>) => void };
const FormatPrefsContext = createContext<Ctx | null>(null);

/**
 * Units, clock and nappy/diaper wording (Figma H04), each separate from the language. Starts from the phone's
 * region; choices are saved on this phone and applied to every formatter. Children re-render on change.
 */
export function FormatPrefsProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<FormatPrefs>>({});
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setOverrides(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    setFormatPrefs(overrides);
  }, [overrides]);
  const update = useCallback((patch: Partial<FormatPrefs>) => {
    setOverrides((o) => {
      const next = { ...o, ...patch };
      setFormatPrefs(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);
  // Applied synchronously too, so the first render after a change already formats with it.
  setFormatPrefs(overrides);
  const value = useMemo(() => ({ prefs: getFormatPrefs(), update }), [update, overrides]); // eslint-disable-line react-hooks/exhaustive-deps
  return <FormatPrefsContext.Provider value={value}>{children}</FormatPrefsContext.Provider>;
}

export function useFormatPrefs(): Ctx {
  const v = useContext(FormatPrefsContext);
  if (!v) throw new Error('useFormatPrefs must be used inside FormatPrefsProvider');
  return v;
}
