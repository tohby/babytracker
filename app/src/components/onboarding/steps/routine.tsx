import * as Notifications from 'expo-notifications';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectRow } from '@/components/onboarding/select-row';
import { Chip } from '@/components/onboarding/steps/basics';
import type { StepProps } from '@/components/onboarding/steps/types';
import { WheelGroup, WheelPicker } from '@/components/onboarding/wheel-picker';
import { AppIcon, Mascot } from '@/components/ui/mascot';
import { GlassCard } from '@/components/ui/glass-card';
import { Icon, type IconName } from '@/components/ui/icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getDeviceLocale } from '@/i18n';
import { wakeWindow } from '@/lib/onboarding/age';
import type { ReminderLead } from '@/lib/onboarding/answers';
import { formatDuration, formatNumber, formatTime, getFormatPrefs } from '@/lib/format';

const pad = (n: number) => String(n).padStart(2, '0');

/** "AM" / "PM" in this locale. */
function dayPeriods(locale: string): [string, string] {
  const label = (hour: number) =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true }).formatToParts(new Date(2026, 0, 1, hour)).find((p) => p.type === 'dayPeriod')?.value;
  return [label(9) ?? 'AM', label(21) ?? 'PM'];
}

/** Figma "Wake time": hour, minutes (15-minute steps) and AM/PM, or 24-hour where the phone uses it. */
export function WakeTimeStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const locale = getDeviceLocale().formatLocale;
  const twelveHour = getFormatPrefs().hour12 ?? true;
  const [h0, m0] = (answers.wakeTime ?? '07:00').split(':').map(Number);
  const [hour, setHour] = useState(h0);
  const [minute, setMinute] = useState(Math.round(m0 / 15) * 15 % 60);
  const [am, pm] = useMemo(() => dayPeriods(locale), [locale]);

  const isPm = hour >= 12;
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return (
    <OnboardingScreen
      progress={progress}
      message={t('wakeTime.message', { baby: answers.babyName })}
      actions={
        <PrimaryButton
          label={t('continue')}
          onPress={() => {
            update({ wakeTime: `${pad(hour)}:${pad(minute)}` });
            next(step, { edit });
          }}
        />
      }>
      <WheelGroup>
        {twelveHour ? (
          <WheelPicker
            accessibilityLabel={t('wakeTime.hour')}
            items={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: formatNumber(i + 1) }))}
            value={hour12}
            onChange={(h) => setHour((h % 12) + (isPm ? 12 : 0))}
          />
        ) : (
          <WheelPicker
            accessibilityLabel={t('wakeTime.hour')}
            items={Array.from({ length: 24 }, (_, i) => ({ value: i, label: formatNumber(i, { minimumIntegerDigits: 2 }) }))}
            value={hour}
            onChange={setHour}
          />
        )}
        <WheelPicker
          accessibilityLabel={t('wakeTime.minute')}
          items={[0, 15, 30, 45].map((m) => ({ value: m, label: formatNumber(m, { minimumIntegerDigits: 2 }) }))}
          value={minute}
          onChange={setMinute}
        />
        {twelveHour ? (
          <WheelPicker
            accessibilityLabel={t('wakeTime.period')}
            items={[
              { value: false, label: am },
              { value: true, label: pm },
            ]}
            value={isPm}
            onChange={(toPm) => setHour((hour % 12) + (toPm ? 12 : 0))}
          />
        ) : null}
      </WheelGroup>
      <Chip icon="clock">{t('wakeTime.hint')}</Chip>
    </OnboardingScreen>
  );
}

/** "1.5–2 hours" from minutes. */
function hoursRange(t: ReturnType<typeof useTranslation<'onboarding'>>['t'], min: number, max: number) {
  const hours = (m: number) => formatNumber(m / 60, { maximumFractionDigits: 1 });
  return t('hoursRange', { min: hours(min), max: hours(max) });
}

/** Figma "Insight · wake windows". */
export function WakeWindowsStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, next } = useOnboarding();
  const colors = useThemeColors();
  const window = wakeWindow(answers.birthDate ?? new Date().toISOString().slice(0, 10));
  return (
    <OnboardingScreen
      progress={progress}
      message={t('wakeWindows.message')}
      actions={<PrimaryButton label={t('wakeWindows.submit')} onPress={() => next(step)} />}>
      <GlassCard>
        <View className="gap-md p-xl">
          <View className="size-[40px] items-center justify-center rounded-full bg-orange-100">
            <Icon name="clock" color={colors['icon/primary']} size={20} />
          </View>
          <Text variant="heading">
            {t('wakeWindows.title', { baby: answers.babyName, range: hoursRange(t, window.min, window.max) })}
          </Text>
          <Text tone="muted">{t('wakeWindows.body', { baby: answers.babyName })}</Text>
          <View className="h-[8px] flex-row overflow-hidden rounded-full" accessibilityElementsHidden>
            <View className="flex-[3] bg-accent-primary" />
            <View className="flex-[1] bg-lavender-500" />
            <View className="flex-[1] bg-lavender-100" />
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption">{t('wakeWindows.awake')}</Text>
            <Text variant="caption">{t('wakeWindows.sweetSpot')}</Text>
            <Text variant="caption">{t('wakeWindows.overtired')}</Text>
          </View>
        </View>
      </GlassCard>
      <View className="items-center">
        <Mascot pose="thinking" size={140} />
      </View>
    </OnboardingScreen>
  );
}

/**
 * Figma "Reminder promise": a lock-screen preview, then the system permission prompt.
 * Reminders themselves arrive with the nap predictions; this only asks for permission.
 */
export function RemindersStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const [asking, setAsking] = useState(false);
  const window = wakeWindow(answers.birthDate ?? new Date().toISOString().slice(0, 10));

  const allow = async () => {
    setAsking(true);
    const { granted } = await Notifications.requestPermissionsAsync().catch(() => ({ granted: false }));
    setAsking(false);
    update({ remindersAllowed: granted });
    next(step, granted ? {} : { to: 'sleep-opener' });
  };

  return (
    <OnboardingScreen
      progress={progress}
      message={t('reminders.message', { baby: answers.babyName })}
      actions={
        <>
          <PrimaryButton label={t('reminders.allow')} onPress={allow} loading={asking} />
          <TextButton
            label={t('notNow')}
            onPress={() => {
              update({ remindersAllowed: false });
              next(step, { to: 'sleep-opener' });
            }}
          />
        </>
      }>
      {/* A picture of a lock screen: always the dark "inverse" surface. */}
      <View accessible accessibilityLabel={`${t('reminders.previewTitle')}. ${t('reminders.previewBody', { baby: answers.babyName, awake: formatDuration(window.max * 60_000 - 15 * 60_000) })}`} className="gap-xl overflow-hidden rounded-card bg-surface-inverse px-lg pb-2xl pt-2xl">
        <Text variant="display" tone="onInverse" className="text-center">
          {formatTime(new Date())}
        </Text>
        <View className="flex-row items-start gap-md rounded-tile bg-white p-md">
          <AppIcon size={36} />
          <View className="flex-1 gap-xs">
            <View className="flex-row justify-between">
              <Text variant="label">{t('reminders.previewTitle')}</Text>
              <Text variant="caption" tone="muted">
                {t('reminders.previewTime')}
              </Text>
            </View>
            <Text variant="caption">
              {t('reminders.previewBody', { baby: answers.babyName, awake: formatDuration(window.max * 60_000 - 15 * 60_000) })}
            </Text>
          </View>
        </View>
      </View>
      <Text className="text-center">{t('reminders.promise')}</Text>
    </OnboardingScreen>
  );
}

const LEADS: { value: ReminderLead; icon: IconName }[] = [
  { value: '5', icon: 'clock' },
  { value: '15', icon: 'clock' },
  { value: '30', icon: 'clock' },
  { value: 'onlyWhenAsked', icon: 'moon-filled' },
];

/** Figma "Reminder timing". Stays on the phone until reminders are built. */
export function ReminderTimingStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const selected = answers.reminderLead ?? '15';
  return (
    <OnboardingScreen
      progress={progress}
      message={t('reminderTiming.message')}
      actions={
        <PrimaryButton
          label={t('continue')}
          onPress={() => {
            update({ reminderLead: selected });
            next(step, { edit });
          }}
        />
      }>
      <View accessibilityRole="radiogroup" className="gap-sm">
        {LEADS.map((option) => (
          <SelectRow
            key={option.value}
            icon={option.icon}
            title={t(`reminderTiming.${option.value}.title`)}
            subtitle={t(`reminderTiming.${option.value}.subtitle`)}
            selected={selected === option.value}
            onPress={() => update({ reminderLead: option.value })}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
