import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, AppState, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
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
import { formatCountdown } from '@/lib/format';
import { readBiometricCapability } from '@/lib/unlock/biometrics';
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

export function LinkAction({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      className="min-h-[44px] w-full items-center justify-center rounded-full py-sm active:bg-state-pressed-surface">
      <Text variant="label-small" tone="link" className="text-center">{label}</Text>
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

export function PinScreen({ title, detail, error, pause, onBack, onPin, onBiometric, biometric, footer }: {
  title: string;
  detail: string;
  error?: string;
  pause?: string;
  onBack?: () => void;
  onPin: (pin: string) => void | Promise<void>;
  onBiometric?: () => void;
  biometric?: Biometric | null;
  footer?: ReactNode;
}) {
  const { t } = useTranslation('unlock');
  const digitsRef = useRef('');
  const completing = useRef(false);
  const [digits, setDigits] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' && !completing.current) {
        digitsRef.current = '';
        setDigits('');
      }
    });
    return () => subscription.remove();
  }, []);
  const onDigit = (digit: string) => {
    if (completing.current || pause) return;
    const next = digitsRef.current + digit;
    digitsRef.current = next;
    setDigits(next);
    void Haptics.selectionAsync().catch(() => {});
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
    if (completing.current || pause || !digitsRef.current) return;
    digitsRef.current = digitsRef.current.slice(0, -1);
    setDigits(digitsRef.current);
    void Haptics.selectionAsync().catch(() => {});
  };

  return (
    <UnlockLayout onBack={busy ? undefined : onBack}>
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

function BiometricHero({ title, detail, icon, action, secondary, onBack, onAction, onSecondary, busy, warning, error, secondaryButton, extra }: {
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
  /** Show `secondary` as a secondary button (an equal choice) rather than a link. */
  secondaryButton?: boolean;
  extra?: ReactNode;
}) {
  return (
    <UnlockLayout onBack={onBack}>
      <Animated.View entering={FadeIn.duration(160).reduceMotion(ReduceMotion.System)} className="grow items-center justify-center gap-xl px-page py-md">
        <View className={`size-[140px] items-center justify-center rounded-[40px] ${warning ? 'bg-status-warning-subtle' : 'bg-background-surface-muted'}`}>
          <Icon name={icon} size={64} tone={warning ? 'color/status/warning' : 'color/icon/primary'} />
        </View>
        <Heading title={title} detail={detail} large />
        {error && <ErrorMessage message={error} />}
      </Animated.View>
      <View className="gap-xs px-page pb-xs pt-md">
        <Button label={action} onPress={onAction} loading={busy} wrap />
        {secondaryButton
          ? <Button label={secondary} hierarchy="secondary" onPress={onSecondary} disabled={busy} wrap className="mt-sm" />
          : <LinkAction label={secondary} onPress={onSecondary} disabled={busy} />}
        {extra}
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
    setFailed(false);
    try {
      const saved = await controller.setPin(firstPin.current, biometric
        ? { method: biometric, prompt: t(`biometric.${biometric}.prompt`) }
        : undefined);
      if (saved) firstPin.current = '';
      else setFailed(true);
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
  const skipSetup = async () => {
    if (savingPin.current) return;
    savingPin.current = true;
    setSaving(true);
    try {
      await controller.skip();
    } catch {
      setFailed(true);
    } finally {
      savingPin.current = false;
      setSaving(false);
    }
  };
  const enable = async () => {
    if (!method || savingPin.current) return;
    const next = await readBiometricCapability();
    if (next.available && next.method === method) await save(method);
    else {
      setDeniedMethod(next.method);
      setStage('off');
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
          <LinkAction label={t('notNow')} disabled={saving} onPress={() => { void skipSetup(); }} />
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
        error={failed ? t('biometricSetupFailure') : undefined}
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
      footer={
        <>
          <LinkAction label={t(confirming ? 'startOver' : 'whyPin')}
            onPress={confirming ? startOver : () => Alert.alert(t('whyPin'), t('whyPinBody'), [{ text: t('closeExplanation') }])}
            disabled={saving} />
          {!confirming && !setupRequired && !capability &&
            <LinkAction label={t('notNow')} disabled={saving} onPress={() => { void skipSetup(); }} />}
        </>
      }
    />
  );
}

/**
 * The lock screen. Nothing is prompted automatically: with Face ID / fingerprint set up the user
 * first picks Face ID, PIN or an email code; otherwise the PIN pad opens. Every state offers
 * Switch account, which forgets this account on the phone (see `forgetAccount`).
 */
export function QuickUnlockGate({ controller, onRecover, onEmailUnlock, onPasswordUnlock, onSwitchAccount }: {
  controller: QuickUnlockController;
  /** Forgot PIN: verify the email, then set a new PIN. */
  onRecover: () => void;
  /** Unlock with an email code and keep the PIN. */
  onEmailUnlock: () => void;
  /** Unlock with the account password and keep the PIN. Only for accounts that have a password. */
  onPasswordUnlock?: () => void;
  onSwitchAccount: () => Promise<void>;
}) {
  const { t } = useTranslation('unlock');
  const { attemptBiometrics, attemptPin, biometric, biometricReady, attempts, phase, retryStorage } = controller;
  const [pinSelected, setPinSelected] = useState(false);
  const [biometricIssue, setBiometricIssue] = useState<'unavailable' | 'fallback' | null>(null);
  const [pinError, setPinError] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const paused = attempts.until > now;
  const showChooser = !!biometric && biometricReady && !pinSelected && phase === 'locked';
  useEffect(() => {
    if (!paused) return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [paused]);

  const usePin = () => {
    controller.stopAutomaticPrompt();
    setPinSelected(true);
  };

  const promptBiometrics = useCallback(async () => {
    if (!biometric) return;
    setBiometricIssue(null);
    const result = await attemptBiometrics(t(`biometric.${biometric}.prompt`));
    // Cancelled or failed: stay on the chosen screen and say what's still possible.
    if (result === 'unavailable' || result === 'fallback') setBiometricIssue(result);
    if (result === 'unavailable') setPinSelected(true);
  }, [attemptBiometrics, biometric, t]);

  const switchAccount = () => {
    Alert.alert(t('switchTitle'), t('switchBody'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('switchConfirm'), style: 'destructive', onPress: () => {
        setSwitching(true);
        void onSwitchAccount().finally(() => setSwitching(false));
      } },
    ]);
  };
  const passwordLink = onPasswordUnlock && <LinkAction label={t('usePassword')} onPress={onPasswordUnlock} disabled={switching} />;
  const switchLink = <LinkAction label={t('switchAccount')} onPress={switchAccount} disabled={switching} />;

  if (phase === 'unavailable' || phase === 'loading') {
    return (
      <BiometricHero icon="lock" title={t('lockedTitle')} detail={t('storageFailure')}
        action={t('retry')} secondary={t('useEmail')} onAction={retryStorage} onSecondary={onRecover} extra={switchLink} />
    );
  }

  if (showChooser && biometric) {
    return (
      <BiometricHero
        title={t('lockedTitle')}
        detail={t('chooseMethodBody')}
        icon={biometric === 'faceId' || biometric === 'face' ? 'face-id' : 'fingerprint'}
        action={t(`biometric.${biometric}.prompt`)}
        secondary={t('usePin')}
        secondaryButton
        busy={switching}
        error={biometricIssue === 'fallback' ? t('biometricFallback') : undefined}
        onAction={() => { void promptBiometrics(); }}
        onSecondary={usePin}
        extra={<>
          {passwordLink}
          <LinkAction label={t('useEmailCode')} onPress={onEmailUnlock} disabled={switching} />
          {switchLink}
        </>}
      />
    );
  }

  const canUseBiometrics = biometricReady && biometricIssue !== 'unavailable' && !!biometric;
  return (
    <PinScreen
      title={paused ? t('pauseTitle') : t('enterTitle')}
      detail={paused ? t('pauseBody') : t('enterBody')}
      pause={paused ? t('pauseMessage', { time: formatCountdown(Math.ceil((attempts.until - now) / 1000)) }) : undefined}
      error={pinError ? t('pinUnavailable') : !paused && attempts.failures > 0
        ? t('wrong', { count: PIN_ATTEMPT_LIMIT - attempts.failures }) : undefined}
      // Back to the method choice when there is one.
      onBack={canUseBiometrics && pinSelected ? () => { setBiometricIssue(null); setPinSelected(false); } : undefined}
      onPin={async (pin) => {
        const result = await attemptPin(pin);
        setPinError(result === 'unavailable');
        setNow(Date.now());
      }}
      biometric={canUseBiometrics ? biometric : null}
      onBiometric={() => { void promptBiometrics(); }}
      footer={
        <>
          {biometric && !biometricReady && <Text variant="caption" tone="secondary" className="text-center">{t('reconnectAfterUnlock')}</Text>}
          {biometricReady && biometricIssue && <Text variant="caption" tone="secondary" className="text-center">
            {t(biometricIssue === 'unavailable' ? 'biometricUnavailable' : 'biometricFallback')}
          </Text>}
          {paused && canUseBiometrics &&
            <LinkAction label={t(`biometric.${biometric}.prompt`)} onPress={() => { void promptBiometrics(); }} />}
          <LinkAction label={t('forgotPin')} onPress={onRecover} />
          {passwordLink}
          {switchLink}
        </>
      }
    />
  );
}
