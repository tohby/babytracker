import { useEffect, useState } from 'react';

/** Seconds left until `until` (epoch ms), ticking while it runs; 0 when passed or null. */
export function useCountdown(until: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!until) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= until) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [until]);

  return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}
