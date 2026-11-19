import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { LogType } from '@/constants/log-types';
import type { LogEvent } from '@/data/log-events';

/** Filter groups as shown in `Sheet content/Timeline filter`. */
export const FILTER_GROUPS = {
  sleep: ['sleep'],
  feeds: ['feed', 'nursing'],
  nappies: ['nappy'],
  pumping: ['pumping'],
  solids: ['solids'],
  medicine: ['medicine'],
  growth: ['growth'],
  activities: ['bath', 'tummy', 'activity'],
} as const satisfies Record<string, readonly LogType[]>;

export type FilterGroup = keyof typeof FILTER_GROUPS;
export const ALL_GROUPS = Object.keys(FILTER_GROUPS) as FilterGroup[];

type Filter = { groups: FilterGroup[]; onlyMe: boolean };
type Ctx = { filter: Filter; setFilter: (f: Filter) => void; apply: (events: LogEvent[], me: string) => LogEvent[] };

const TimelineFilterContext = createContext<Ctx | null>(null);

export function filterEvents(events: LogEvent[], filter: Filter, me: string): LogEvent[] {
  const types = new Set<LogType>(filter.groups.flatMap((g) => FILTER_GROUPS[g]));
  return events.filter((e) => types.has(e.type) && (!filter.onlyMe || e.loggedBy === me));
}

/** Shared between the Timeline tab and its filter sheet (V2-E03). */
export function TimelineFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<Filter>({ groups: ALL_GROUPS, onlyMe: false });
  const value = useMemo(() => ({ filter, setFilter, apply: (events: LogEvent[], me: string) => filterEvents(events, filter, me) }), [filter]);
  return <TimelineFilterContext.Provider value={value}>{children}</TimelineFilterContext.Provider>;
}

export function useTimelineFilter(): Ctx {
  const v = useContext(TimelineFilterContext);
  if (!v) throw new Error('useTimelineFilter must be used inside TimelineFilterProvider');
  return v;
}
