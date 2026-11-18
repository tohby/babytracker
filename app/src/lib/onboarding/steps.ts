/**
 * Onboarding steps in order (Figma "Onboarding screen" page). `chapter` matches the API's
 * `onboarding_steps` (config/nappa.php), saved so progress survives a reinstall.
 *
 * Left out for now: "Proof chart" (placeholder claim), "Connect Apple Health" (no HealthKit yet)
 * and the paywall, gift and offer screens (no in-app purchases yet).
 */
export const STEPS = [
  { id: 'baby-name', chapter: 'meet_nappa' },
  { id: 'parent-name', chapter: 'meet_nappa' },
  { id: 'reward', chapter: 'meet_nappa' },
  { id: 'get-to-know', chapter: 'baby_basics' },
  { id: 'birthday', chapter: 'baby_basics' },
  { id: 'feeding', chapter: 'baby_basics' },
  { id: 'hardest', chapter: 'baby_basics' },
  { id: 'wake-time', chapter: 'routine_reminders' },
  { id: 'wake-windows', chapter: 'routine_reminders' },
  { id: 'reminders', chapter: 'routine_reminders' },
  { id: 'reminder-timing', chapter: 'routine_reminders' },
  { id: 'sleep-opener', chapter: 'sleep' },
  { id: 'sleep-need', chapter: 'sleep' },
  { id: 'sleep-yesterday', chapter: 'sleep' },
  { id: 'nap-place', chapter: 'sleep' },
  { id: 'weight', chapter: 'growth_care' },
  { id: 'carers', chapter: 'growth_care' },
  { id: 'glance', chapter: 'building_plan' },
  { id: 'personalising', chapter: 'building_plan' },
  { id: 'plan-reveal', chapter: 'building_plan' },
  { id: 'rhythm', chapter: 'building_plan' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export const FIRST_STEP: StepId = 'baby-name';

export function isStepId(value: unknown): value is StepId {
  return STEPS.some((s) => s.id === value);
}

export function stepIndex(id: StepId): number {
  return STEPS.findIndex((s) => s.id === id);
}

export function nextStep(id: StepId): StepId | null {
  return STEPS[stepIndex(id) + 1]?.id ?? null;
}

/** 0–1 for the progress bar. */
export function progressOf(id: StepId): number {
  return (stepIndex(id) + 1) / STEPS.length;
}
