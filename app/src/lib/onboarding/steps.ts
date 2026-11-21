// Keep the server's existing chapters compatible with older app builds.
export const STEPS = [
  { id: 'about', chapter: 'baby_basics' },
  { id: 'feeding', chapter: 'baby_basics' },
  { id: 'wake-time', chapter: 'routine_reminders' },
  { id: 'carers', chapter: 'growth_care' },
  { id: 'reminders', chapter: 'routine_reminders' },
  { id: 'prediction', chapter: 'building_plan' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export const FIRST_STEP: StepId = 'about';

export function isStepId(value: unknown): value is StepId {
  return STEPS.some((step) => step.id === value);
}

export function stepIndex(id: StepId) {
  return STEPS.findIndex((step) => step.id === id);
}

export function resumeStep(value: string | null, hasRequiredDetails: boolean): StepId {
  if (!hasRequiredDetails) return FIRST_STEP;
  return isStepId(value) ? value : 'feeding';
}
