import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { useSession } from '@/hooks/use-session';
import { emptyAnswers, loadAnswers, saveAnswers, type OnboardingAnswers } from '@/lib/onboarding/answers';
import { onboardingApi } from '@/lib/onboarding/endpoints';
import { STEPS, resumeStep, stepIndex, type StepId } from '@/lib/onboarding/steps';

type Onboarding = {
  answers: OnboardingAnswers;
  update: (changes: Partial<OnboardingAnswers>) => Promise<void>;
  resumeStep: StepId;
  next: (from: StepId, changes?: Partial<OnboardingAnswers>) => Promise<void>;
  preview: boolean;
};

const OnboardingContext = createContext<Onboarding | null>(null);

export function OnboardingProvider({ children, sample }: { children: ReactNode; sample?: Partial<OnboardingAnswers> }) {
  const { user } = useSession();
  const userId = user?.id ?? 0;
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const latest = useRef<OnboardingAnswers | null>(null);
  const writes = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let current = true;
    void loadAnswers(userId).then((saved) => {
      if (!current) return;
      const restored = { ...emptyAnswers, ...(sample ?? saved) };
      latest.current = restored;
      setAnswers(restored);
    });
    return () => { current = false; };
  }, [sample, userId]);

  const update = useCallback((changes: Partial<OnboardingAnswers>) => {
    if (!latest.current) return Promise.resolve();
    const next = { ...latest.current, ...changes };
    latest.current = next;
    setAnswers(next);
    if (sample) return Promise.resolve();
    const write = writes.current.catch(() => {}).then(() => saveAnswers(userId, next));
    writes.current = write;
    return write;
  }, [sample, userId]);

  const next = async (from: StepId, changes: Partial<OnboardingAnswers> = {}) => {
    const step = STEPS[stepIndex(from) + 1];
    if (!step) return;
    await update({ ...changes, lastStep: step.id });
    if (!sample) void onboardingApi.saveProgress(step.chapter).catch(() => {});
    router.push({ pathname: '/onboarding/[step]', params: { step: step.id } });
  };

  if (!answers) return null;
  return (
    <OnboardingContext.Provider value={{
      answers, update, next, preview: Boolean(sample),
      resumeStep: resumeStep(answers.lastStep, Boolean(answers.babyName && answers.birthDate && answers.guardian)),
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('OnboardingProvider is missing');
  return value;
}
