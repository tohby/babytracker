import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { BrowserPicker } from '@/components/onboarding/browser-picker';
import { ChoiceTile } from '@/components/onboarding/choice-tile';
import { FlowLink, FlowNotice, FlowScreen, FlowTitle } from '@/components/onboarding/flow-screen';
import { MascotStage } from '@/components/onboarding/mascot-stage';
import { StepFooter } from '@/components/onboarding/step-footer';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useSession } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getDeviceLocale } from '@/i18n';
import { ageLabel } from '@/lib/age-label';
import { formatDate, formatDuration, formatTime } from '@/lib/format';
import type { Carer, FeedingMethod, OnboardingAnswers, Reminder } from '@/lib/onboarding/answers';
import { onboardingApi } from '@/lib/onboarding/endpoints';
import { initialPrediction } from '@/lib/onboarding/initial-prediction';
import { stepIndex, type StepId } from '@/lib/onboarding/steps';
import { saveReminderPreferences, scheduleReminder } from '@/lib/reminders';

const MINUTE = 60_000;
const feedingIcons: Record<FeedingMethod, IconName> = { breast_milk: 'heart-outline', formula: 'bottle', combination: 'drop', solids: 'log-solids' };
const carerIcons: Record<Carer, IconName> = { partner: 'family', grandparents: 'user-plus', nanny: 'user-plus', justMe: 'check' };
const reminderIcons: Record<Reminder, IconName> = { nap: 'moon', feed: 'bottle', sync: 'cloud-check' };
const reminders: Reminder[] = ['nap', 'feed', 'sync'];
const wakeOffsets = { now: 0, halfHour: 30, hour: 60 } as const;
type WakeChoice = keyof typeof wakeOffsets | 'earlier';

function birthdayValue(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, '0')).join('-');
}

function Picker({ value, onChange, mode, minimum, maximum }: {
  value: Date;
  onChange: (value: Date) => void;
  mode: 'date' | 'time';
  minimum?: Date;
  maximum: Date;
}) {
  const { theme } = useUniwind();
  return (
    <DateTimePicker
      mode={mode}
      value={value}
      onChange={(event, date) => { if (event.type === 'set' && date) onChange(date); }}
      minimumDate={minimum}
      maximumDate={maximum}
      display="spinner"
      themeVariant={theme === 'dark' ? 'dark' : 'light'}
    />
  );
}

function Row({ icon, label, onPress, selected }: { icon?: IconName; label: string; onPress: () => void; selected?: boolean }) {
  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'checkbox'}
      accessibilityState={selected === undefined ? undefined : { checked: selected }}
      onPress={onPress}
      className={`min-h-control-lg flex-row items-center gap-md border bg-background-surface px-lg py-md ${selected === undefined ? 'rounded-md' : 'rounded-xl'} ${selected ? 'border-2 border-primary-default' : 'border-border-default'}`}>
      {icon && <Icon name={icon} size={20} />}
      <Text className="flex-1" variant="label-large">{label}</Text>
      {selected === undefined ? <Icon name="chevron-down" size={18} tone="color/icon/secondary" /> :
        <View className={`size-[24px] items-center justify-center rounded-[7px] border-2 ${selected ? 'border-primary-default bg-primary-default' : 'border-border-strong'}`}>
          {selected && <Icon name="check" size={16} tone="color/icon/on-primary" />}
        </View>}
    </Pressable>
  );
}

function Segmented<T extends string>({ entries, selection, label, onChange }: {
  entries: readonly T[]; selection: T; label: (value: T) => string; onChange: (value: T) => void;
}) {
  return (
    <View className="flex-1 flex-row gap-xs rounded-full border border-border-default p-xs">
      {entries.map((entry) => (
        <Pressable key={entry} accessibilityRole="radio" accessibilityState={{ checked: selection === entry }} onPress={() => onChange(entry)}
          className={`min-h-[34px] flex-1 items-center justify-center rounded-full py-xs ${selection === entry ? 'bg-state-selected' : ''}`}>
          <Text variant="label-small">{label(entry)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Setup({ step }: { step: StepId }) {
  const { t } = useTranslation('onboarding');
  const { answers, next, update, preview } = useOnboarding();
  const { user, updateUser } = useSession();
  const { prefs, update: updateFormat } = useFormatPrefs();
  const colors = useThemeColors();
  const [now] = useState(() => new Date());
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const wakeChoice: WakeChoice | null = answers.wakeChoice ?? (answers.lastWakeAt === null ? null : 'earlier');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [how, setHow] = useState(false);
  const [twins, setTwins] = useState(false);
  const pending = useRef(false);
  const stepNumber = stepIndex(step) + 1;
  const optional = stepNumber >= 3 && stepNumber <= 5;
  const name = answers.babyName.trim();
  const minBirth = new Date(now.getFullYear() - 6, now.getMonth(), now.getDate());
  const maxBirth = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  const birthday = answers.birthDate ? new Date(`${answers.birthDate}T12:00:00`) : now;
  const prediction = initialPrediction(answers.birthDate, answers.lastWakeAt, now.getTime());

  const store = (patch: Partial<OnboardingAnswers>) => {
    void update(patch).catch(() => setFailed(true));
  };

  const openPicker = (mode: 'date' | 'time') => {
    const value = mode === 'date' ? birthday : new Date(answers.lastWakeAt ?? now.getTime());
    const change = (date: Date) => {
      if (mode === 'date') {
        store({ birthDate: birthdayValue(date) });
        return;
      }
      const adjusted = new Date(now);
      adjusted.setHours(date.getHours(), date.getMinutes(), 0, 0);
      if (adjusted.getTime() > now.getTime()) adjusted.setDate(adjusted.getDate() - 1);
      store({ lastWakeAt: adjusted.getTime(), wakeChoice: 'earlier' });
    };
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode, value, ...(mode === 'date' ? { minimumDate: minBirth, maximumDate: maxBirth } : {}),
        onChange: (event, date) => { if (event.type === 'set' && date) change(date); },
      });
    } else if (Platform.OS === 'web') {
      setPicker(mode);
    } else {
      setPicker((open) => open === mode ? null : mode);
    }
  };

  const run = async (skip = false) => {
    if (pending.current || preview) return;
    pending.current = true;
    setFailed(false);
    setBusy(true);
    try {
      if (step === 'prediction') {
        if (!answers.birthDate || !user) return;
        const body = {
          name,
          birth_date: answers.birthDate,
          timezone: getDeviceLocale().timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          feeding_method: answers.feeding,
        };
        const existing = (await onboardingApi.listBabies()).data;
        // Recover a previous create if the request succeeded before a network interruption.
        const baby = existing.find((item) => item.id === answers.babyId) ?? existing.find((item) => item.role === 'owner');
        const saved = baby ? (await onboardingApi.updateBaby(baby.id, body)).data : (await onboardingApi.createBaby(body)).data;
        await update({ babyId: saved.id });
        const progress = (await onboardingApi.complete()).data;
        if (answers.reminders.includes('nap') && prediction.state === 'predicted') {
          void scheduleReminder(prediction.windowStart - 5 * MINUTE, 'nap', name).catch(() => {});
        }
        updateUser({ ...user, onboarding: { last_step: progress.last_step, completed: true } });
        return;
      }
      if (step === 'reminders') {
        let enabled: Reminder[] = [];
        if (!skip && Platform.OS !== 'web') {
          const current = await Notifications.getPermissionsAsync();
          if (current.granted || (current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted)) enabled = answers.reminders;
        }
        await saveReminderPreferences(enabled);
        await next(step, { reminders: enabled });
        return;
      }
      await next(step, skip ? step === 'wake-time' ? { lastWakeAt: null, wakeChoice: null } : { carers: [] } : {});
    } catch {
      setFailed(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      const previous = ['about', 'feeding', 'wake-time', 'carers', 'reminders'][stepNumber - 2];
      if (previous) router.replace({ pathname: '/onboarding/[step]', params: { step: previous } });
    }
  };

  let content: ReactNode;
  let notice: string | undefined;
  let ready = true;
  switch (step) {
    case 'about':
      ready = Boolean(name && answers.birthDate && answers.guardian);
      content = (
        <View className="gap-xl">
          <FlowTitle title={t('about.title')} subtitle={t('about.subtitle')} />
          <View className="gap-lg">
            <View className="gap-sm">
              <Text variant="label-large">{t('about.name')}</Text>
              <TextInput accessibilityLabel={t('about.name')} placeholder={t('about.nameExample')}
                placeholderTextColor={colors['color/text/tertiary']} value={answers.babyName} maxLength={100}
                onChangeText={(babyName) => store({ babyName })} autoCapitalize="words"
                className="min-h-control-lg rounded-md border border-border-default px-lg font-outfit-regular text-text-primary" />
            </View>
            <View className="gap-sm">
              <Text variant="label-large">{t('about.birthday')}</Text>
              <Row icon="calendar" label={answers.birthDate ? formatDate(birthday, { day: 'numeric', month: 'long', year: 'numeric' }) : t('about.birthday')} onPress={() => openPicker('date')} />
              {picker === 'date' && (Platform.OS === 'web'
                ? <BrowserPicker mode="date" value={answers.birthDate ?? ''} minimum={birthdayValue(minBirth)} maximum={birthdayValue(maxBirth)} onChange={(birthDate) => store({ birthDate })} label={t('about.birthday')} />
                : <><Picker mode="date" value={birthday} minimum={minBirth} maximum={maxBirth} onChange={(date) => store({ birthDate: birthdayValue(date) })} />
                  <FlowLink label={t('about.done')} onPress={() => {
                    if (!answers.birthDate) store({ birthDate: birthdayValue(birthday) });
                    setPicker(null);
                  }} />
                </>)}
              <Text variant="caption" tone="secondary">{t('about.birthdayHint')}</Text>
            </View>
          </View>
          <Row selected={answers.guardian} label={name ? t('about.guardian', { name }) : t('about.guardianGeneric')} onPress={() => store({ guardian: !answers.guardian })} />
          <View className="items-start ps-lg">
            <FlowLink label={t('about.twins')} onPress={() => setTwins(!twins)} />
          </View>
          {twins && <FlowNotice>{t('about.twinsUnavailable')}</FlowNotice>}
        </View>
      );
      break;
    case 'feeding': {
      ready = Boolean(answers.feeding);
      const region = getLocales()[0]?.regionCode;
      const unitsLabel = (unit: 'ml' | 'oz' | 'kg' | 'lb') => t(`feeding.${unit}`);
      content = (
        <View className="gap-xl">
          <FlowTitle title={t('feeding.title', { name })} subtitle={t('feeding.subtitle')} />
          <View className="gap-md">
            {([['breast_milk', 'formula'], ['combination', 'solids']] as const).map((row) => (
              <View key={row[0]} className="flex-row gap-md">
                {row.map((feeding) => <ChoiceTile key={feeding} label={t(`feeding.${feeding}.title`)} description={t(`feeding.${feeding}.detail`)} icon={feedingIcons[feeding]} selected={answers.feeding === feeding} onPress={() => store({ feeding })} />)}
              </View>
            ))}
          </View>
          <View className="gap-sm">
            <Text variant="label-small" tone="secondary">{region ? t('feeding.units', { region: region === 'GB' ? t('feeding.uk') : region }) : t('feeding.unitsNoRegion')}</Text>
            <View className="flex-row gap-md">
              <Segmented entries={['ml', 'oz'] as const} selection={prefs.volumeUnit} label={unitsLabel} onChange={(volumeUnit) => updateFormat({ volumeUnit })} />
              <Segmented entries={['kg', 'lb'] as const} selection={prefs.weightUnit} label={unitsLabel} onChange={(weightUnit) => updateFormat({ weightUnit })} />
            </View>
          </View>
        </View>
      );
      break;
    }
    case 'wake-time':
      ready = answers.lastWakeAt !== null;
      notice = t('wake.hint');
      content = (
        <View className="gap-xl">
          <FlowTitle badge={t('optional')} title={t('wake.title', { name })} subtitle={t('wake.subtitle')} />
          <View className="gap-md">
            {([['now', 'halfHour'], ['hour', 'earlier']] as const).map((row) => (
              <View key={row[0]} className="flex-row gap-md">
                {row.map((choice) => {
                  const at = choice === 'earlier' ? answers.lastWakeAt : now.getTime() - wakeOffsets[choice] * MINUTE;
                  const detail = at === null || (choice === 'earlier' && wakeChoice !== 'earlier') ? t('wake.choose') : t('wake.around', { time: formatTime(at) });
                  return <ChoiceTile key={choice} label={t(`wake.${choice}`)} description={detail} icon="clock" selected={wakeChoice === choice} onPress={() => {
                    if (choice === 'earlier') openPicker('time');
                    else {
                      setPicker(null);
                      store({ lastWakeAt: Date.now() - wakeOffsets[choice] * MINUTE, wakeChoice: choice });
                    }
                  }} />;
                })}
              </View>
            ))}
          </View>
          {picker === 'time' && (Platform.OS === 'web'
            ? <BrowserPicker mode="time" label={t('wake.choose')} onChange={(time) => {
              const [hours, minutes] = time.split(':').map(Number);
              if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return;
              const date = new Date(now);
              date.setHours(hours, minutes, 0, 0);
              if (date > now) date.setDate(date.getDate() - 1);
              store({ lastWakeAt: date.getTime(), wakeChoice: 'earlier' });
            }} />
            : <Picker mode="time" value={new Date(answers.lastWakeAt ?? now.getTime())} maximum={now} onChange={(date) => {
              if (date.getTime() > now.getTime()) date.setDate(date.getDate() - 1);
              store({ lastWakeAt: date.getTime(), wakeChoice: 'earlier' });
            }} />)}
        </View>
      );
      break;
    case 'carers':
      content = (
        <View className="gap-xl">
          <FlowTitle badge={t('optional')} title={t('carers.title', { name })} subtitle={t('carers.subtitle')} />
          <View className="gap-md">
            {(Object.keys(carerIcons) as Carer[]).map((carer) => {
              const selected = answers.carers.includes(carer);
              return <ChoiceTile key={carer} label={t(`carers.${carer}.title`)} description={t(`carers.${carer}.detail`, { name })} compact multiple icon={carerIcons[carer]} selected={selected} onPress={() =>
                store({ carers: selected ? answers.carers.filter((value) => value !== carer) : carer === 'justMe' ? [carer] : [...answers.carers.filter((value) => value !== 'justMe'), carer] })
              } />;
            })}
          </View>
        </View>
      );
      break;
    case 'reminders':
      ready = answers.reminders.length > 0;
      notice = t('reminders.hint');
      content = (
        <View className="gap-xl">
          <FlowTitle badge={t('optional')} title={t('reminders.title')} subtitle={t('reminders.subtitle')} />
          <View className="gap-md">
            {reminders.map((reminder) => {
              const selected = answers.reminders.includes(reminder);
              return <ChoiceTile key={reminder} label={t(`reminders.${reminder}.title`)} description={t(`reminders.${reminder}.detail`)} compact multiple icon={reminderIcons[reminder]}
                iconClassName={reminder === 'nap' ? 'bg-feature-sleep' : reminder === 'feed' ? 'bg-feature-feed' : undefined}
                selected={selected} onPress={() => store({ reminders: selected ? answers.reminders.filter((item) => item !== reminder) : [...answers.reminders, reminder] })} />;
            })}
          </View>
        </View>
      );
      break;
    case 'prediction':
      content = (
        <View className="gap-xl">
          <MascotStage pose="swaddled">
            {prediction.state === 'predicted' ? <>
              <View className="flex-row items-center gap-md">
                <View className="size-[40px] items-center justify-center rounded-sm bg-feature-sleep"><Icon name="sparkle" size={18} /></View>
                <View className="flex-1">
                  <Text variant="caption" tone="secondary">{prediction.windowStart > now.getTime() ? t('prediction.next', { remaining: formatDuration(prediction.windowStart - now.getTime()) }) : t('intro.nap.card')}</Text>
                  <Text variant="title-large">{t('prediction.range', { start: formatTime(prediction.windowStart), end: formatTime(prediction.windowEnd) })}</Text>
                </View>
              </View>
              <View className="mt-md flex-row gap-sm">
                {answers.lastWakeAt !== null && <View className="flex-1 rounded-md bg-background-surface-muted p-md">
                  <Text variant="caption" tone="secondary">{t('prediction.awake')}</Text>
                  <Text variant="label-large">{formatTime(prediction.awakeSince)}</Text>
                </View>}
                {answers.birthDate && <View className="flex-1 rounded-md bg-background-surface-muted p-md">
                  <Text variant="caption" tone="secondary">{t('prediction.age')}</Text>
                  <Text variant="label-large">{ageLabel(answers.birthDate, now)}</Text>
                </View>}
              </View>
            </> : <Text variant="label-large">{t(prediction.state === 'too-young' ? 'prediction.tooYoung' : 'prediction.learning')}</Text>}
          </MascotStage>
          <FlowTitle badge={t('prediction.badge', { name }).toLocaleUpperCase()} title={t('prediction.title')} subtitle={t(answers.lastWakeAt === null ? 'prediction.subtitleAge' : 'prediction.subtitle', { name })} />
          {how && <FlowNotice>{t('prediction.howDetail')}</FlowNotice>}
        </View>
      );
      break;
  }

  return (
    <FlowScreen onBack={step !== 'prediction' ? goBack : undefined} progress={step !== 'prediction' ? stepNumber : undefined}
      footer={<>
        {notice && <FlowNotice>{notice}</FlowNotice>}
        {failed && <FlowNotice error>{t('saveError')}</FlowNotice>}
        <Button wrap label={t(step === 'prediction' ? 'prediction.today' : step === 'reminders' ? 'reminders.allow' : 'continue')} loading={busy} disabled={!ready || preview} onPress={() => void run()} />
        {step === 'prediction' ? <View className="min-h-[40px] justify-center"><FlowLink label={t('prediction.how')} onPress={() => setHow(!how)} /></View> :
          <StepFooter step={stepNumber} omitLabel={optional ? t(step === 'reminders' ? 'notNow' : 'skip') : undefined} onOmit={() => void run(true)} />}
      </>}>
      {content}
    </FlowScreen>
  );
}
