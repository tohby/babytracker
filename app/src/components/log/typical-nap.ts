import { ageParts } from '@/lib/onboarding/age';

/**
 * Typical single-nap length by age, in minutes (common paediatric guidance; varies a lot between babies).
 * Used for the "Typical nap at 7 months" bar on the sleep timer.
 */
export function typicalNapMinutes(birthDate: string | null, now = new Date()): { min: number; max: number } {
  if (!birthDate) return { min: 45, max: 90 };
  const { months } = ageParts(birthDate, now);
  if (months < 3) return { min: 30, max: 120 };
  if (months < 6) return { min: 45, max: 120 };
  if (months < 12) return { min: 60, max: 90 };
  return { min: 60, max: 150 };
}
