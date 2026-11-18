import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useSession } from '@/hooks/use-session';
import { getFormatPrefs } from '@/lib/format';
import { emptyAnswers, loadAnswers, saveAnswers, type OnboardingAnswers } from '@/lib/onboarding/answers';
import { onboardingApi } from '@/lib/onboarding/endpoints';
import { FIRST_STEP, STEPS, isStepId, nextStep, type StepId } from '@/lib/onboarding/steps';

type Onboarding = {
  answers: OnboardingAnswers;
  update: (changes: Partial<OnboardingAnswers>) => void;
  /** Where to resume. */
  resumeStep: StepId;
  /** Go to the step after `from` (or `to`). In edit mode (from "at a glance") goes back instead. */
  next: (from: StepId, options?: { to?: StepId; edit?: boolean }) => void;
};

const OnboardingContext = createContext<Onboarding | null>(null);

/**
 * Onboarding answers, kept on this phone after every change so leaving the app resumes where it was.
 * The chapter reached is also saved to the API (`PUT /onboarding`), best effort.
 */
export function OnboardingProvider({ children, sample }: { children: ReactNode; sample?: Partial<OnboardingAnswers> }) {
  const { user } = useSession();
  const userId = user?.id ?? 0;
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAnswers(userId).then((saved) => {
      if (cancelled) return;
      const base = emptyAnswers(getFormatPrefs().weightUnit);
      setAnswers(sample ? { ...base, ...sample } : { ...base, ...saved, parentName: saved?.parentName ?? user?.name ?? '' });
    });
    return () => {
      cancelled = true;
    };
    // Load once per account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const update = useCallback(
    (changes: Partial<OnboardingAnswers>) => {
      setAnswers((current) => {
        if (!current) return current;
        const next = { ...current, ...changes };
        if (!sample) saveAnswers(userId, next);
        return next;
      });
    },
    [userId, sample],
  );

  const next = useCallback(
    (from: StepId, options: { to?: StepId; edit?: boolean } = {}) => {
      if (options.edit) {
        router.back();
        return;
      }
      const to = options.to ?? nextStep(from);
      if (!to) return;
      update({ lastStep: to });
      const fromChapter = STEPS.find((s) => s.id === from)?.chapter;
      const toChapter = STEPS.find((s) => s.id === to)?.chapter;
      if (toChapter && toChapter !== fromChapter) onboardingApi.saveProgress(toChapter).catch(() => {});
      router.push({ pathname: '/onboarding/[step]', params: { step: to } });
    },
    [update],
  );

  const value = useMemo<Onboarding | null>(
    () =>
      answers
        ? {
            answers,
            update,
            next,
            resumeStep: isStepId(answers.lastStep) ? answers.lastStep : FIRST_STEP,
          }
        : null,
    [answers, update, next],
  );

  // Wait for the saved answers so the first screen shows them.
  if (!value) return null;
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): Onboarding {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return value;
}
