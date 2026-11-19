import type { IconName } from '@/components/ui/icon';

/** The four destinations, in order. Same tabs, same order on every platform. */
export const TABS = [
  { name: 'today', icon: 'home', label: 'nav.today', tabIcon: require('@/assets/tab-icons/home.png') },
  { name: 'timeline', icon: 'timeline', label: 'nav.timeline', tabIcon: require('@/assets/tab-icons/timeline.png') },
  { name: 'insights', icon: 'insights', label: 'nav.insights', tabIcon: require('@/assets/tab-icons/insights.png') },
  { name: 'family', icon: 'family', label: 'nav.family', tabIcon: require('@/assets/tab-icons/family.png') },
] as const satisfies readonly { name: string; icon: IconName; label: string; tabIcon: number }[];

export type TabName = (typeof TABS)[number]['name'];
