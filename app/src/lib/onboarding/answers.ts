import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeedingMethod = 'breast_milk' | 'formula' | 'combination' | 'solids';
export type Carer = 'partner' | 'grandparents' | 'nanny' | 'justMe';
export type WakeChoice = 'now' | 'halfHour' | 'hour' | 'earlier';
export type Reminder = 'nap' | 'feed' | 'sync';

export type OnboardingAnswers = {
  babyName: string;
  /** YYYY-MM-DD, local calendar date. */
  birthDate: string | null;
  guardian: boolean;
  feeding: FeedingMethod | null;
  /** Timestamp of the last wake, used for the first prediction on this phone. */
  lastWakeAt: number | null;
  wakeChoice: WakeChoice | null;
  carers: Carer[];
  reminders: Reminder[];
  babyId: string | null;
  lastStep: string | null;
};

export const emptyAnswers: OnboardingAnswers = {
  babyName: '',
  birthDate: null,
  guardian: false,
  feeding: null,
  lastWakeAt: null,
  wakeChoice: null,
  carers: [],
  reminders: ['nap', 'sync'],
  babyId: null,
  lastStep: null,
};

const key = (userId: number) => `nappa.onboarding.${userId}`;

export async function loadAnswers(userId: number): Promise<Partial<OnboardingAnswers> | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? JSON.parse(raw) as Partial<OnboardingAnswers> : null;
  } catch {
    return null;
  }
}

export function saveAnswers(userId: number, answers: OnboardingAnswers): Promise<void> {
  return AsyncStorage.setItem(key(userId), JSON.stringify(answers));
}
