import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { useBabies } from '@/hooks/use-babies';
import type { Baby } from '@/lib/onboarding/endpoints';

const KEY = 'nappa.currentBaby';
let selected: string | null = null;
const listeners = new Set<() => void>();
AsyncStorage.getItem(KEY)
  .then((v) => {
    selected = v;
    listeners.forEach((l) => l());
  })
  .catch(() => {});

/** Remember which baby the app shows (Figma G09 Child switcher). */
export function selectBaby(id: string) {
  selected = id;
  AsyncStorage.setItem(KEY, id).catch(() => {});
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The baby the app is showing: the one picked in the child switcher, else the first. */
export function useCurrentBaby(): { baby: Baby | null; babies: Baby[]; loading: boolean; failed: boolean } {
  const { babies, loading, failed } = useBabies();
  const id = useSyncExternalStore(subscribe, () => selected);
  const list = babies ?? [];
  return { baby: list.find((b) => b.id === id) ?? list[0] ?? null, babies: list, loading, failed };
}
