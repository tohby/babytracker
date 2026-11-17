export type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

/** Which greeting fits the given time. The text comes from `home:greeting.<period>`. */
export function getGreetingPeriod(now: Date = new Date()): GreetingPeriod {
  const hour = now.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
