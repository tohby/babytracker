import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, AppState, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceTile } from '@/components/onboarding/choice-tile';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { IconTile } from '@/components/ui/icon-tile';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Keypad, PinDot } from '@/components/unlock/keypad';
import type { QuickUnlockController } from '@/hooks/use-quick-unlock';
import { useSession } from '@/hooks/use-session';
import { formatCountdown } from '@/lib/format';
import { loadAnswers } from '@/lib/onboarding/answers';
import { authenticateBiometric, readBiometricCapability } from '@/lib/unlock/biometrics';
import { PIN_ATTEMPT_LIMIT, PIN_LENGTH, type Biometric } from '@/lib/unlock/pin';

function UnlockLayout({ onBack, children }: { onBack?: () => void; children: ReactNode }) {
  const { t } = useTranslation('unlock');
  return (
    <SafeAreaView className="flex-1 bg-background-surface" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <View className="h-[52px] items-start px-page pt-xs">
          {onBack && <IconButton icon="back" variant="ghost" label={t('back')} onPress={onBack} />}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Heading({ title, detail, large = false }: { title: string; detail: string; large?: boolean }) {
  return (
    <View className="w-full gap-sm">
      <Text accessibilityRole="header" variant={large ? 'title-large' : 'title-medium'} className="text-center">{title}</Text>
      <Text variant="body-small" tone="secondary" className="text-center">{detail}</Text>
    </View>
  );
}

function LinkAction({ label, prefix, onPress, disabled }: { label: string; prefix?: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} className="min-h-[44px] w-full items-center justify-center py-sm">
      {prefix ? (
        <View className="flex-row flex-wrap justify-center gap-xs">
          <Text variant="label-small" tone="secondary" className="shrink text-center">{prefix}</Text>
          <Text variant="label-small" tone="link" className="shrink text-center">{label}</Text>
        </View>
      ) : <Text variant="label-small" tone="link" className="text-center">{label}</Text>}
    </Pressable>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" className="min-h-[24px] w-full flex-row items-center justify-center gap-sm">
      <Icon name="alert-circle" size={20} tone="color/status/error" />
      <Text variant="label-small" tone="error" className="shrink">{message}</Text>
    </View>
  );
}

function PinScreen({ title, detail, error, pause, onBack, onPin, onBiometric, biometric, footer }: {
  title: string;
  detail: string;
  error?: string;
  pause?: string;
  onBack?: () => void;
  onPin: (pin: string) => void | Promise<void>;
  onBiometric?: () => void;
  biometric?: Biometric | null;
  footer: ReactNode;
}) {
  const { t } = useTranslation('unlock');
  const digitsRef = useRef('');
  const completing = useRef(false);
  const [digits, setDigits] = useState('');
  const [busy, setBusy] = useState(false);
  const onDigit = (digit: string) => {
    if (completing.current || pause) return;
    const next = digitsRef.current + digit;
    digitsRef.current = next;
    setDigits(next);
    if (next.length !== PIN_LENGTH) return;
    completing.current = true;
    setBusy(true);
    void (async () => {
      try { await onPin(next); }
      finally {
        digitsRef.current = '';
        completing.current = false;
        setDigits('');
        setBusy(false);
      }
    })();
  };
  const onDelete = () => {
    if (completing.current) return;
    digitsRef.current = digitsRef.current.slice(0, -1);
    setDigits(digitsRef.current);
  };

  return (
    <UnlockLayout onBack={onBack}>
      <View className="grow items-center justify-center gap-lg px-page py-md">
        <IconTile icon="lock" tone="brand" size="L" />
        <Heading title={title} detail={detail} />
        <View accessible accessibilityLabel={t('enteredDigits', { count: digits.length })} className="flex-row gap-lg pt-sm">
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <PinDot key={index} state={error && digits.length === 0 ? 'error' : index < digits.length ? 'filled' : 'empty'} />
          ))}
        </View>
        {pause ? (
          <View className="min-h-[56px] w-full">
            <View className="flex-row items-center gap-sm rounded-md bg-status-warning-subtle p-md">
              <Icon name="clock" size={20} tone="color/status/warning" />
              <Text variant="caption" className="flex-1">{pause}</Text>
            </View>
          </View>
        ) : error ? <ErrorMessage message={error} /> : <View className="h-[24px]" />}
      </View>
      <Keypad disabled={busy || !!pause} paused={!!pause} onDigit={onDigit} onDelete={onDelete} biometric={pause ? null : biometric} onBiometric={onBiometric} />
      <View className="gap-xs px-page pb-xs pt-sm">{footer}</View>
    </UnlockLayout>
  );
}

function BiometricHero({ title, detail, icon, action, secondary, onBack, onAction, onSecondary, busy, warning, error }: {
  title: string;
  detail: string;
  icon: IconName;
  action: string;
  secondary: string;
  onBack?: () => void;
  onAction: () => void;
  onSecondary: () => void;
  busy?: boolean;
  warning?: boolean;
  error?: string;
}) {
  return (
    <UnlockLayout onBack={onBack}>
      <View className="grow items-center justify-center gap-xl px-page py-md">
        <View className={`size-[140px] items-center justify-center rounded-[40px] ${warning ? 'bg-status-warning-subtle' : 'bg-background-surface-muted'}`}>
          <Icon name={icon} size={64} tone={warning ? 'color/status/warning' : 'color/icon/primary'} />
        </View>
        <Heading title={title} detail={detail} large />
        {error && <ErrorMessage message={error} />}
      </View>
      <View className="gap-xs px-page pb-xs pt-md">
        <Button label={action} onPress={onAction} loading={busy} wrap />
        <LinkAction label={secondary} onPress={onSecondary} disabled={busy} />
      </View>
    </UnlockLayout>
  );
}

function BiometricOff({ method, onUsePin, busy }: { method: Biometric | null; onUsePin: () => void; busy?: boolean }) {
  const { t } = useTranslation('unlock');
  const label = method ? t(`biometric.${method}.name`) : null;
  return (
    <BiometricHero
      title={label ? t('bioOffTitle', { method: label }) : t('bioOffTitleUnknown')}
      detail={label ? t('bioOffBody', { method: label }) : t('bioOffBodyUnknown')}
      icon={method === 'faceId' ? 'face-id-warning' : method ? 'fingerprint' : 'lock'}
      action={t('openSettings')}
      secondary={t('usePinInstead')}
      onBack={busy ? undefined : onUsePin}
      onAction={() => {
        const settings = Platform.OS === 'android'
          ? Linking.sendIntent('android.settings.SECURITY_SETTINGS').catch(() => Linking.openSettings())
          : Linking.openSettings();
        void settings.catch(() => {});
      }}
      onSecondary={onUsePin}
      busy={busy}
      warning
    />
  );
}

export function QuickUnlockSetup({ controller, onBack }: { controller: QuickUnlockController; onBack?: () => void }) {
  const { t } = useTranslation('unlock');
  const [checking, setChecking] = useState(true);
  const [stage, setStage] = useState<'choose' | 'create' | 'confirm' | 'enable' | 'off'>('create');
  const [capability, setCapability] = useState<Biometric | null>(null);
  const [deniedMethod, setDeniedMethod] = useState<Biometric | null>(null);
  const [withBiometrics, setWithBiometrics] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const firstPin = useRef('');
  const savingPin = useRef(false);
  const { setupRequired } = controller;
  const back = setupRequired ? undefined : onBack;

  useEffect(() => {
    let mounted = true;
    void readBiometricCapability().then(({ method, available }) => {
      if (!mounted) return;
      const supported = available ? method : null;
      setCapability(supported);
      setWithBiometrics(supported !== null);
      setStage(supported && !setupRequired ? 'choose' : 'create');
      setChecking(false);
    });
    return () => { mounted = false; };
  }, [setupRequired]);

  const method = withBiometrics ? capability : null;
  const methodName = method ? t(`biometric.${method}.name`) : null;
  const save = async (biometric: Biometric | null) => {
    if (savingPin.current) return;
    savingPin.current = true;
    setSaving(true);
    try {
      await controller.setPin(firstPin.current, biometric);
      firstPin.current = '';
    } catch {
      setFailed(true);
      if (stage === 'off') setStage('confirm');
    } finally {
      savingPin.current = false;
      setSaving(false);
    }
  };
  const startOver = () => {
    firstPin.current = '';
    setMismatch(false);
    setFailed(false);
    setStage('create');
  };
  const enable = async () => {
    if (!method || saving) return;
    setSaving(true);
    setFailed(false);
    const next = await readBiometricCapability();
    const result = next.available && next.method === method
      ? await authenticateBiometric(t(`biometric.${method}.prompt`), t('cancelPrompt'))
      : 'unavailable';
    if (result === 'success') await save(method);
    else {
      setSaving(false);
      if (result === 'unavailable') {
        setDeniedMethod(next.method);
        setStage('off');
      }
    }
  };

  if (checking) return <View className="flex-1 items-center justify-center bg-background-surface"><Spinner /></View>;
  if (stage === 'choose' && capability) {
    const label = capability === 'fingerprint' ? t('biometric.fingerprint.label') : t(`biometric.${capability}.name`);
    return (
      <UnlockLayout onBack={back}>
        <View className="grow gap-xl px-page pt-lg">
          <View className="gap-sm">
            <Text variant="caption" tone="tertiary" className="uppercase tracking-[0.96px]">{t('optional')}</Text>
            <Text variant="title-large" accessibilityRole="header">{t('chooseTitle')}</Text>
            <Text variant="body-small" tone="secondary">{t('chooseBody')}</Text>
          </View>
          <View className="flex-row gap-md" accessibilityRole="radiogroup">
            <ChoiceTile label={label} description={t(`biometric.${capability}.description`)} icon={capability === 'faceId' ? 'face-id-key' : 'fingerprint'} selected={withBiometrics} onPress={() => setWithBiometrics(true)} />
            <ChoiceTile label={t('pinOnly')} description={t('pinOnlyDetail')} icon="lock" selected={!withBiometrics} onPress={() => setWithBiometrics(false)} />
          </View>
          <View className="flex-row items-center gap-sm rounded-md bg-background-surface-muted p-md">
            <Icon name="info" size={20} />
            <Text variant="caption" tone="secondary" className="flex-1">{t('chooseBackup', { method: t(`biometric.${capability}.name`) })}</Text>
          </View>
          {failed && <ErrorMessage message={t('saveFailure')} />}
        </View>
        <View className="gap-xs px-page pb-xs pt-md">
          <Button label={withBiometrics ? t(`biometric.${capability}.select`) : t('setUpPin')} disabled={saving} onPress={() => { setFailed(false); setStage('create'); }} wrap />
          <LinkAction label={t('notNow')} disabled={saving} onPress={() => {
            setSaving(true);
            void controller.skip().catch(() => { setFailed(true); setSaving(false); });
          }} />
        </View>
      </UnlockLayout>
    );
  }
  if (stage === 'off') return <BiometricOff method={deniedMethod} onUsePin={() => { void save(null); }} busy={saving} />;
  if (stage === 'enable' && method) {
    return (
      <BiometricHero
        title={t(`biometric.${method}.title`)}
        detail={t(`biometric.${method}.body`)}
        icon={method === 'faceId' ? 'face-id' : 'fingerprint'}
        action={t(`biometric.${method}.action`)}
        secondary={t('usePinOnly')}
        busy={saving}
        error={failed ? t('saveFailure') : undefined}
        onBack={saving ? undefined : () => setStage('confirm')}
        onAction={() => { void enable(); }}
        onSecondary={() => { void save(null); }}
      />
    );
  }
  const confirming = stage === 'confirm';
  return (
    <PinScreen
      key={stage}
      title={t(confirming ? 'confirmTitle' : 'createTitle')}
      detail={confirming ? t('confirmBody') : methodName ? t('createBackup', { method: methodName }) : t('createBody')}
      error={failed ? t('saveFailure') : confirming && mismatch ? t('mismatch') : undefined}
      onBack={saving ? undefined : confirming ? startOver : capability && !setupRequired ? () => setStage('choose') : back}
      onPin={async (value) => {
        setFailed(false);
        if (!confirming) { firstPin.current = value; setStage('confirm'); return; }
        if (value !== firstPin.current) { setMismatch(true); return; }
        setMismatch(false);
        if (method) setStage('enable');
        else await save(null);
      }}
      footer={<LinkAction label={t(confirming ? 'startOver' : 'whyPin')} onPress={confirming ? startOver : () => Alert.alert(t('whyPin'), t('whyPinBody'), [{ text: t('closeExplanation') }])} disabled={saving} />}
    />
  );
}

export function QuickUnlockGate({ controller, onRecover, displayName, babyName }: {
  controller: QuickUnlockController;
  onRecover: () => void;
  displayName?: string | null;
  babyName?: string | null;
}) {
  const { t } = useTranslation('unlock');
  const { user } = useSession();
  const userId = user?.id;
  const [cachedBaby, setCachedBaby] = useState<{ userId: number; name: string } | null>(null);
  const { attemptBiometrics, attemptPin, biometric, attempts, phase, retryStorage } = controller;
  const [now, setNow] = useState(() => Date.now());
  const [denied, setDenied] = useState<{ method: Biometric | null } | null>(null);
  const paused = attempts.until > now;
  const name = babyName ?? (cachedBaby?.userId === userId ? cachedBaby?.name : null);

  useEffect(() => {
    if (!userId || babyName) return;
    let active = true;
    void loadAnswers(userId).then((answers) => {
      if (active && answers?.babyName) setCachedBaby({ userId, name: answers.babyName });
    });
    return () => { active = false; };
  }, [babyName, userId]);

  useEffect(() => {
    if (!paused) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [paused]);

  const promptBiometrics = useCallback(async (automatic: boolean) => {
    if (!biometric) return;
    const result = await attemptBiometrics(t(`biometric.${biometric}.prompt`), t('cancelPrompt'), automatic);
    if (result === 'unavailable') {
      const { method } = await readBiometricCapability();
      setDenied({ method });
    }
  }, [attemptBiometrics, biometric, t]);

  useEffect(() => {
    if (phase !== 'locked' || !biometric || paused || denied) return;
    const initialPrompt = requestAnimationFrame(() => {
      if (AppState.currentState === 'active' || AppState.currentState === null) void promptBiometrics(true);
    });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void promptBiometrics(true);
    });
    return () => {
      cancelAnimationFrame(initialPrompt);
      subscription.remove();
    };
  }, [biometric, denied, paused, phase, promptBiometrics]);

  if (phase === 'unavailable' || phase === 'loading') {
    return (
      <BiometricHero
        icon="lock"
        title={t('enterTitleWithoutName')}
        detail={t('storageFailure')}
        action={t('retry')}
        secondary={t('useEmail')}
        onAction={retryStorage}
        onSecondary={onRecover}
      />
    );
  }
  if (denied && !paused) return <BiometricOff method={denied.method} onUsePin={() => setDenied(null)} />;
  return (
    <PinScreen
      title={paused ? t('pauseTitle') : displayName ? t('enterTitle', { name: displayName }) : t('enterTitleWithoutName')}
      detail={paused ? t('pauseBody') : name ? t('enterBody', { name }) : t('enterBodyWithoutName')}
      pause={paused ? t('pauseMessage', { time: formatCountdown(Math.ceil((attempts.until - now) / 1000)) }) : undefined}
      error={!paused && attempts.failures > 0 ? t('wrong', { count: PIN_ATTEMPT_LIMIT - attempts.failures }) : undefined}
      onPin={async (pin) => { await attemptPin(pin); setNow(Date.now()); }}
      biometric={biometric}
      onBiometric={() => { void promptBiometrics(false); }}
      footer={paused ? (
        <>
          <Button label={t('useEmail')} hierarchy="secondary" onPress={onRecover} wrap />
          <LinkAction label={t('forgotPin')} onPress={onRecover} />
        </>
      ) : <LinkAction prefix={t('forgotPin')} label={t('useEmail')} onPress={onRecover} />}
    />
  );
}
