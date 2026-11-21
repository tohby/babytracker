import { initialPrediction } from '@/lib/onboarding/initial-prediction';
import { resumeStep } from '@/lib/onboarding/steps';

const now = Date.parse('2026-11-21T09:00:00Z');
const minute = 60_000;

it('uses the last wake and the age-based wake window for the first prediction', () => {
  const lastWake = now - 30 * minute;
  expect(initialPrediction('2026-04-12', lastWake, now)).toMatchObject({
    state: 'predicted',
    awakeSince: lastWake,
    windowStart: lastWake + 150 * minute,
    windowEnd: lastWake + 180 * minute,
  });
});

it('does not predict for a baby younger than eight weeks', () => {
  expect(initialPrediction('2026-11-01', now - 20 * minute, now)).toEqual({ state: 'too-young' });
});

it('returns to required baby details for older drafts without a guardian acknowledgement', () => {
  expect(resumeStep('prediction', false)).toBe('about');
  expect(resumeStep('rhythm', true)).toBe('feeding');
  expect(resumeStep('reminders', true)).toBe('reminders');
});
