import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeedingMethod = 'breast_milk' | 'formula' | 'combination' | 'solids';
export type Hardest = 'shortNaps' | 'nightWakings' | 'whenToFeed' | 'nappies' | 'sharing';
export type ReminderLead = '5' | '15' | '30' | 'onlyWhenAsked';
export type NapPlace = 'cot' | 'contact' | 'onTheMove' | 'changes';
export type Carer = 'partner' | 'grandparents' | 'nanny' | 'justMe';
export type Dummy = 'yes' | 'no' | 'sometimes';
export type WeightUnit = 'kg' | 'lb';

/**
 * Everything onboarding asks. Only the parent's name and the baby's name, birthday, feeding method
 * and wake time go to the server (see the API plan); the rest stays on this phone.
 */
export type OnboardingAnswers = {
  babyName: string;
  parentName: string;
  /** YYYY-MM-DD */
  birthDate: string | null;
  feeding: FeedingMethod | null;
  hardest: Hardest[];
  /** HH:mm, 24-hour */
  wakeTime: string | null;
  remindersAllowed: boolean | null;
  reminderLead: ReminderLead | null;
  sleepYesterdayHours: number | null;
  napPlace: NapPlace | null;
  weightGrams: number | null;
  weightUnit: WeightUnit;
  carers: Carer[];
  dummy: Dummy | null;
  /** Set once the baby is saved, so editing later updates it instead of adding another. */
  babyId: string | null;
  /** The step to resume at. */
  lastStep: string | null;
};

export const emptyAnswers = (weightUnit: WeightUnit): OnboardingAnswers => ({
  babyName: '',
  parentName: '',
  birthDate: null,
  feeding: null,
  hardest: [],
  wakeTime: null,
  remindersAllowed: null,
  reminderLead: null,
  sleepYesterdayHours: null,
  napPlace: null,
  weightGrams: null,
  weightUnit,
  carers: [],
  dummy: null,
  babyId: null,
  lastStep: null,
});

/** Per account, so a second person signing in on this phone starts fresh. */
const key = (userId: number) => `nappa.onboarding.${userId}`;

export async function loadAnswers(userId: number): Promise<Partial<OnboardingAnswers> | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as Partial<OnboardingAnswers>) : null;
  } catch {
    return null;
  }
}

export async function saveAnswers(userId: number, answers: OnboardingAnswers): Promise<void> {
  await AsyncStorage.setItem(key(userId), JSON.stringify(answers)).catch(() => {});
}
