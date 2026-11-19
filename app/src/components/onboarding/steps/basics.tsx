import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ageLabel } from '@/components/onboarding/age-label';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectRow } from '@/components/onboarding/select-row';
import type { StepProps } from '@/components/onboarding/steps/types';
import { WheelGroup, WheelPicker } from '@/components/onboarding/wheel-picker';
import { Icon, type IconName } from '@/components/ui/icon';
import { Mascot } from '@/components/ui/mascot';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getDeviceLocale } from '@/i18n';
import { ageInDays } from '@/lib/onboarding/age';
import type { FeedingMethod, Hardest } from '@/lib/onboarding/answers';
import { formatNumber } from '@/lib/format';

/** Figma "Section opener": Nappa says what comes next. */
export function GetToKnowStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, next } = useOnboarding();
  return (
    <OnboardingScreen
      progress={progress}
      message={t('getToKnow.message', { baby: answers.babyName })}
      actions={<PrimaryButton label={t('letsGo')} onPress={() => next(step)} />}>
      <View className="items-center pt-xl">
        <Mascot pose="thinking" size={220} />
      </View>
    </OnboardingScreen>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

/** Day, month and year in the order this locale writes dates (D M Y, M D Y, Y M D). */
function dateFieldOrder(locale: string): ('day' | 'month' | 'year')[] {
  const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2026, 10, 17));
  const order = parts.map((p) => p.type).filter((type): type is 'day' | 'month' | 'year' => type === 'day' || type === 'month' || type === 'year');
  return order.length === 3 ? order : ['day', 'month', 'year'];
}

/**
 * Figma "Birthday on a wheel". Allows up to 6 years back and 30 days ahead (a due date), the same
 * range the API accepts.
 */
export function BirthdayStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const locale = getDeviceLocale().formatLocale;
  const today = new Date();
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  const min = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());

  const initial = answers.birthDate?.split('-').map(Number) ?? [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  const [year, setYear] = useState(initial[0]);
  const [month, setMonth] = useState(initial[1]);
  const [day, setDay] = useState(initial[2]);

  // Keep the date real and inside the range when a column changes.
  const clampedDay = Math.min(day, daysIn(year, month));
  let date = new Date(year, month - 1, clampedDay);
  if (date > max) date = max;
  if (date < min) date = min;
  const iso = toIso(date.getFullYear(), date.getMonth() + 1, date.getDate());

  const monthNames = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, i) => format.format(new Date(2026, i, 1)));
  }, [locale]);

  const columns = {
    day: (
      <WheelPicker
        key="day"
        accessibilityLabel={t('birthday.day')}
        items={Array.from({ length: daysIn(year, month) }, (_, i) => ({ value: i + 1, label: formatNumber(i + 1) }))}
        value={date.getDate()}
        onChange={setDay}
      />
    ),
    month: (
      <WheelPicker
        key="month"
        flex={1.3}
        accessibilityLabel={t('birthday.month')}
        items={monthNames.map((label, i) => ({ value: i + 1, label }))}
        value={date.getMonth() + 1}
        onChange={setMonth}
      />
    ),
    year: (
      <WheelPicker
        key="year"
        flex={1.3}
        accessibilityLabel={t('birthday.year')}
        items={Array.from({ length: max.getFullYear() - min.getFullYear() + 1 }, (_, i) => {
          const y = min.getFullYear() + i;
          return { value: y, label: formatNumber(y, { useGrouping: false }) };
        })}
        value={date.getFullYear()}
        onChange={setYear}
      />
    ),
  };

  const born = date <= today;
  return (
    <OnboardingScreen
      progress={progress}
      message={t('birthday.message', { baby: answers.babyName })}
      actions={
        <PrimaryButton
          label={t('continue')}
          onPress={() => {
            update({ birthDate: iso });
            next(step, { edit });
          }}
        />
      }>
      <WheelGroup>{dateFieldOrder(locale).map((field) => columns[field])}</WheelGroup>
      <Chip>
        {born && ageInDays(iso) >= 0
          ? t('birthday.age', { baby: answers.babyName, age: ageLabel(t, iso) })
          : t('birthday.notBornYet', { baby: answers.babyName })}
      </Chip>
    </OnboardingScreen>
  );
}

/** Small orange note under a picker (Figma birthday / sleep chips). */
export function Chip({ children, icon = 'star' }: { children: string; icon?: IconName }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-sm self-center rounded-full bg-orange-100 px-lg py-sm">
      <Icon name={icon} color={colors['color/icon/primary']} size={16} />
      <Text variant="label" className="shrink">
        {children}
      </Text>
    </View>
  );
}

const FEEDING: { value: FeedingMethod; icon: IconName; danger?: boolean }[] = [
  { value: 'breast_milk', icon: 'heart', danger: true },
  { value: 'formula', icon: 'bottle' },
  { value: 'combination', icon: 'drop' },
  { value: 'solids', icon: 'star' },
];

/** Figma "Single select": how the baby is fed. Saved to the baby (feeding_method). */
export function FeedingStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  return (
    <OnboardingScreen
      progress={progress}
      message={t('feeding.message', { baby: answers.babyName })}
      actions={<PrimaryButton label={t('continue')} disabled={!answers.feeding} onPress={() => next(step, { edit })} />}>
      <View accessibilityRole="radiogroup" className="gap-sm">
        {FEEDING.map((option) => (
          <SelectRow
            key={option.value}
            icon={option.icon}
            iconTone={option.danger ? 'danger' : 'default'}
            title={t(`feeding.${option.value}.title`)}
            subtitle={t(`feeding.${option.value}.subtitle`)}
            selected={answers.feeding === option.value}
            onPress={() => update({ feeding: option.value })}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const HARDEST: { value: Hardest; icon: IconName; danger?: boolean }[] = [
  { value: 'shortNaps', icon: 'moon-filled' },
  { value: 'nightWakings', icon: 'moon-filled' },
  { value: 'whenToFeed', icon: 'bottle' },
  { value: 'nappies', icon: 'nappy' },
  { value: 'sharing', icon: 'heart', danger: true },
];

/** Figma "Multi select". Stays on the phone. */
export function HardestStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const toggle = (value: Hardest) =>
    update({ hardest: answers.hardest.includes(value) ? answers.hardest.filter((v) => v !== value) : [...answers.hardest, value] });
  const count = answers.hardest.length;
  return (
    <OnboardingScreen
      progress={progress}
      message={t('hardest.message')}
      actions={
        <PrimaryButton label={count ? t('continueCount', { count }) : t('continue')} onPress={() => next(step, { edit })} />
      }>
      <View className="gap-sm">
        {HARDEST.map((option) => (
          <SelectRow
            key={option.value}
            multi
            icon={option.icon}
            iconTone={option.danger ? 'danger' : 'default'}
            title={t(`hardest.${option.value}`)}
            selected={answers.hardest.includes(option.value)}
            onPress={() => toggle(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

