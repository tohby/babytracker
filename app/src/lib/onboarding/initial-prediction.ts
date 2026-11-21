import { predictNextNap, type Prediction } from '@/lib/prediction';
import { wakeWindow } from '@/lib/onboarding/age';

const MINUTE = 60_000;

export function initialPrediction(birthday: string | null, lastWakeAt: number | null, now: number, usualWakeTime: string | null = null): Prediction {
  const ageBased = predictNextNap([], birthday, now, usualWakeTime);
  if (!birthday || lastWakeAt === null || lastWakeAt > now || ageBased.state === 'too-young') return ageBased;
  const range = wakeWindow(birthday, new Date(now));
  const typicalWakeWindowMs = { min: range.min * MINUTE, max: range.max * MINUTE };
  const windowStart = lastWakeAt + typicalWakeWindowMs.min;
  const windowEnd = windowStart + 30 * MINUTE;
  if (windowEnd < now) return ageBased;
  return { state: 'predicted', windowStart, windowEnd, awakeSince: lastWakeAt,
    wakeWindowMs: typicalWakeWindowMs.min, lastNapMs: null, basis: 'age', typicalWakeWindowMs };
}
