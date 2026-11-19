import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ageLabel } from '@/components/onboarding/age-label';
import { MascotFace } from '@/components/onboarding/chat-row';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import type { StepProps } from '@/components/onboarding/steps/types';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Mascot } from '@/components/ui/mascot';
import { Button } from '@/components/ui/button';
import { StatusBanner } from '@/components/ui/status-banner';
import { Text } from '@/components/ui/text';
import { Elevation } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useSession } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getDeviceLocale } from '@/i18n';
import { ApiError } from '@/lib/api';
import { authApi } from '@/lib/auth/endpoints';
import { dailyRhythm, type RhythmItem } from '@/lib/onboarding/age';
import type { Dummy, OnboardingAnswers } from '@/lib/onboarding/answers';
import { onboardingApi } from '@/lib/onboarding/endpoints';
import type { StepId } from '@/lib/onboarding/steps';
import { formatDate, formatDuration, formatTime, formatWeight } from '@/lib/format';

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Save the parent's name and the baby (create once, update after). Only these fields leave the phone. */
async function saveToServer(answers: OnboardingAnswers, currentName: string | null) {
  const user = answers.parentName !== (currentName ?? '')
    ? (await onboardingApi.updateProfile({ name: answers.parentName || null })).data
    : null;
  const body = {
    name: answers.babyName,
    birth_date: answers.birthDate ?? todayIso(),
    timezone: getDeviceLocale().timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    feeding_method: answers.feeding,
    usual_wake_time: answers.wakeTime,
  };
  let babyId = answers.babyId;
  if (babyId) {
    try {
      await onboardingApi.updateBaby(babyId, body);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
      babyId = null; // Deleted elsewhere: add it again.
    }
  }
  if (!babyId) babyId = (await onboardingApi.createBaby(body)).data.id;
  return { user, babyId };
}

/** Figma "Ada at a glance": every answer so far; tap a line to change it. Saves to the API on "Looks right". */
export function GlanceStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const { user, updateUser } = useSession();
  const colors = useThemeColors();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const edit = (to: StepId) => router.push({ pathname: '/onboarding/[step]', params: { step: to, edit: '1' } });
  const carers = answers.carers.filter((c) => c !== 'justMe');
  const rows: { icon: IconName; label: string; value: string; to: StepId; danger?: boolean }[] = [
    { icon: 'bottle', label: t('glance.feeding'), value: answers.feeding ? t(`feeding.${answers.feeding}.title`) : t('glance.notSet'), to: 'feeding' },
    {
      icon: 'clock',
      label: t('glance.wakes'),
      value: answers.wakeTime ? formatTime(timeToday(answers.wakeTime)) : t('glance.notSet'),
      to: 'wake-time',
    },
    { icon: 'moon-filled', label: t('glance.naps'), value: answers.napPlace ? t(`napPlace.${answers.napPlace}.title`) : t('glance.notSet'), to: 'nap-place' },
    {
      icon: 'growth',
      label: t('glance.weight'),
      value: answers.weightGrams ? formatWeight(answers.weightGrams, answers.weightUnit) : t('glance.notSet'),
      to: 'weight',
    },
    {
      icon: 'heart',
      danger: true,
      label: t('glance.carers'),
      value: carers.length
        ? t('carers.summaryOthers', { count: carers.length, name: answers.parentName || t('carers.summaryJustMe') })
        : t('carers.summaryJustMe'),
      to: 'carers',
    },
  ];

  const confirm = async () => {
    setSaving(true);
    setFailed(false);
    try {
      const saved = await saveToServer(answers, user?.name ?? null);
      if (saved.user) updateUser(saved.user);
      update({ babyId: saved.babyId });
      next(step);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScreen
      progress={progress}
      message={t('glance.message', { baby: answers.babyName })}
      actions={<Button label={t('glance.submit')} onPress={confirm} loading={saving} />}>
      {failed ? <StatusBanner type="error" title={t('saveError.title')} detail={t('saveError.detail')} /> : null}
      <Card>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('glance.edit', { item: answers.babyName })}
          onPress={() => edit('birthday')}
          className="flex-row items-center gap-md px-lg pb-md pt-lg">
          <View className="size-[56px] items-center justify-center overflow-hidden rounded-full bg-primary-subtle">
            <Mascot pose="feeding" size={52} />
          </View>
          <View className="flex-1 gap-xs">
            <Text variant="title-large">{answers.babyName}</Text>
            <Text tone="secondary">{answers.birthDate ? ageLabel(t, answers.birthDate) : t('glance.notSet')}</Text>
          </View>
        </Pressable>
        <View className="mx-lg h-px bg-border-default" />
        {rows.map((row) => (
          <Pressable
            key={row.to}
            accessibilityRole="button"
            accessibilityLabel={`${row.label}, ${row.value}`}
            accessibilityHint={t('glance.edit', { item: row.label })}
            onPress={() => edit(row.to)}
            className="min-h-[52px] flex-row items-center gap-md px-lg py-md active:opacity-60">
            <Icon name={row.icon} color={row.danger ? colors['color/status/error'] : colors['color/icon/primary']} size={20} />
            <Text tone="secondary" className="flex-1">
              {row.label}
            </Text>
            <Text>{row.value}</Text>
          </Pressable>
        ))}
      </Card>
      <Text variant="caption" className="text-center">
        {t('glance.hint')}
      </Text>
    </OnboardingScreen>
  );
}

const LOAD_STEPS = ['step1', 'step2', 'step3', 'step4'] as const;
const PAUSE_AT = 70;

/**
 * Figma "Personalising" + "Mid-load question": a short progress moment that asks about dummies
 * part-way through (kept on the phone), then moves on by itself.
 */
export function PersonalisingStep({ step }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const colors = useThemeColors();
  const [percent, setPercent] = useState(0);
  const waiting = percent >= PAUSE_AT && answers.dummy === null;

  useEffect(() => {
    if (waiting) return;
    if (percent >= 100) {
      const done = setTimeout(() => next(step), 400);
      return () => clearTimeout(done);
    }
    const tick = setTimeout(() => setPercent((p) => Math.min(100, p + 1)), 45);
    return () => clearTimeout(tick);
  }, [percent, waiting, next, step]);

  return (
    <OnboardingScreen centered>
      <View className="items-center gap-lg">
        <Mascot pose="standing" size={150} />
        <Text variant="display-light" accessibilityLiveRegion="polite">
          {`${percent}%`}
        </Text>
        <Text variant="heading" className="text-center">
          {t('personalising.title', { baby: answers.babyName })}
        </Text>
      </View>
      <Card>
        <View className="gap-md p-lg">
          {LOAD_STEPS.map((key, i) => {
            const start = i * 25;
            const local = Math.max(0, Math.min(100, (percent - start) * 4));
            const state = local >= 100 ? 'done' : local > 0 ? 'active' : 'pending';
            return (
              <View key={key} className="flex-row items-center gap-md">
                <View
                  className={`size-[24px] items-center justify-center rounded-full ${
                    state === 'done' ? 'bg-primary-default' : state === 'active' ? 'border-2 border-primary-default' : 'border-2 border-border-default'
                  }`}>
                  {state === 'done' ? <Icon name="check" color={colors['color/text/on-primary']} size={14} /> : null}
                </View>
                <Text tone={state === 'pending' ? 'secondary' : 'primary'} className="flex-1">
                  {t(`personalising.${key}`, { baby: answers.babyName })}
                </Text>
                {state === 'active' ? <Text variant="label-large">{`${local}%`}</Text> : null}
              </View>
            );
          })}
        </View>
      </Card>
      {waiting ? (
        <View
          style={{ boxShadow: Elevation.card }}
          accessibilityViewIsModal
          className="items-center gap-md rounded-2xl border border-border-default bg-background-surface p-xl">
          <MascotFace size={44} />
          <Text variant="heading" className="text-center" accessibilityRole="header">
            {t('personalising.dummyQuestion', { baby: answers.babyName })}
          </Text>
          <Text variant="label-large" tone="secondary" className="text-center">
            {t('personalising.dummyDetail')}
          </Text>
          <View accessibilityRole="radiogroup" className="w-full flex-row gap-sm">
            {(['yes', 'no', 'sometimes'] as Dummy[]).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: false }}
                onPress={() => update({ dummy: value })}
                className="min-h-[48px] flex-1 items-center justify-center rounded-full border-[1.5px] border-primary-default bg-primary-subtle active:opacity-70">
                <Text variant="label-large">{t(`personalising.${value}`)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Text variant="label-large" tone="secondary" className="text-center">
          {t('personalising.hint')}
        </Text>
      )}
    </OnboardingScreen>
  );
}

const BAR_HEIGHTS = [0.22, 0.3, 0.38, 0.48, 0.6, 0.74, 1];

/** Figma "Plan reveal". The date is two weeks from today; the bars are illustrative. */
export function PlanRevealStep({ step }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, next } = useOnboarding();
  const target = new Date();
  target.setDate(target.getDate() + 14);
  const date = formatDate(target, { day: 'numeric', month: 'short' });
  return (
    <OnboardingScreen
      centered
      actions={<Button label={t('planReveal.submit', { baby: answers.babyName })} onPress={() => next(step)} />}>
      <View className="items-center gap-sm">
        <Text variant="label-large">{t('planReveal.eyebrow', { baby: answers.babyName })}</Text>
        <Text variant="title-large" className="text-center" accessibilityRole="header">
          {t('planReveal.title', { date })}
        </Text>
      </View>
      <Card>
        <View className="gap-md p-lg" accessible accessibilityLabel={t('planReveal.caption', { baby: answers.babyName })}>
          <View className="items-end">
            <View className="rounded-full bg-primary-default px-md py-xs">
              <Text variant="caption" tone="on-primary" numberOfLines={1}>
                {date}
              </Text>
            </View>
          </View>
          <View className="h-[120px] flex-row items-end gap-sm">
            {BAR_HEIGHTS.map((h, i) => (
              <View
                key={i}
                className={`flex-1 rounded-[8px] ${i === BAR_HEIGHTS.length - 1 ? 'bg-primary-default' : 'bg-primary-subtle'}`}
                style={{ height: `${Math.round(h * 100)}%` }}
              />
            ))}
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption">{t('planReveal.today')}</Text>
            <Text variant="caption">{t('planReveal.week2')}</Text>
            <Text variant="caption">{t('planReveal.week3')}</Text>
          </View>
          <Text variant="caption">{t('planReveal.caption', { baby: answers.babyName })}</Text>
        </View>
      </Card>
      <View className="items-center">
        <Mascot pose="happy" size={150} />
      </View>
    </OnboardingScreen>
  );
}

function timeToday(hhmmOrMinutes: string | number): Date {
  const minutes = typeof hhmmOrMinutes === 'number' ? hhmmOrMinutes : hhmmOrMinutes.split(':').map(Number).reduce((h, m) => h * 60 + m);
  const d = new Date();
  d.setHours(Math.floor(minutes / 60) % 24, minutes % 60, 0, 0);
  return d;
}

function rhythmRow(t: ReturnType<typeof useTranslation<'onboarding'>>['t'], item: RhythmItem): { icon: IconName; title: string; subtitle: string } {
  switch (item.kind) {
    case 'wake':
      return { icon: 'clock', title: t('rhythm.wake.title'), subtitle: t('rhythm.wake.subtitle') };
    case 'nap':
      return {
        icon: 'moon-filled',
        title: item.catnap ? t('rhythm.catnap') : t('rhythm.nap', { count: item.index }),
        subtitle: t('rhythm.about', { duration: formatDuration(item.minutes * 60_000) }),
      };
    case 'bathFeed':
      return { icon: 'bottle', title: t('rhythm.bathFeed.title'), subtitle: t('rhythm.bathFeed.subtitle') };
    case 'bedtime':
      return { icon: 'star', title: t('rhythm.bedtime.title'), subtitle: t('rhythm.bedtime.subtitle') };
  }
}

/** Figma "Daily rhythm": a first day plan from the wake time and age. "Start my plan" finishes onboarding. */
export function RhythmStep({ progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers } = useOnboarding();
  const { updateUser } = useSession();
  const colors = useThemeColors();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const items = dailyRhythm(answers.wakeTime ?? '07:00', answers.birthDate ?? todayIso());
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextIndex = items.findIndex((item) => item.at > nowMinutes);

  const finish = async () => {
    setSaving(true);
    setFailed(false);
    try {
      await onboardingApi.complete();
      // The updated user flips the layout guard from onboarding to Home.
      updateUser((await authApi.me()).data);
    } catch {
      setFailed(true);
      setSaving(false);
    }
  };

  return (
    <OnboardingScreen
      progress={progress}
      message={t('rhythm.message')}
      actions={<Button label={t('rhythm.submit')} onPress={finish} loading={saving} />}>
      {failed ? <StatusBanner type="error" title={t('saveError.title')} detail={t('saveError.detail')} /> : null}
      <Card>
        <View className="py-sm">
          {items.map((item, i) => {
            const row = rhythmRow(t, item);
            return (
              <View key={i} className="min-h-[56px] flex-row items-center gap-md px-lg py-sm">
                <Text tone="secondary" className="w-[64px]">
                  {formatTime(timeToday(item.at))}
                </Text>
                <View className="size-[36px] items-center justify-center rounded-full bg-primary-subtle">
                  <Icon name={row.icon} color={colors['color/icon/primary']} size={18} />
                </View>
                <View className="flex-1 gap-xs">
                  <Text>{row.title}</Text>
                  <Text variant="caption" tone="secondary">
                    {row.subtitle}
                  </Text>
                </View>
                {i === nextIndex ? (
                  <View className="rounded-full bg-primary-subtle px-md py-xs">
                    <Text variant="caption">{t('rhythm.next')}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </Card>
    </OnboardingScreen>
  );
}
