import { createContext, useContext } from 'react';

/**
 * Bottom padding a tabbed screen's scroll content needs to clear the floating chrome: bar height + 24
 * (plus the timer mini bar when one is docked). Provided by the tab layout.
 */
export const TabBarInsetContext = createContext(24);

export function useTabBarInset(): number {
  return useContext(TabBarInsetContext);
}
