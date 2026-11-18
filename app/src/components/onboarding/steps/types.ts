import type { StepId } from '@/lib/onboarding/steps';

export type StepProps = {
  step: StepId;
  /** Opened from "at a glance" to change one answer: Continue goes back there. */
  edit: boolean;
  progress: number;
};
