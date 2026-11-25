import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StackScreen } from '@/components/screen';
import { Banner } from '@/components/ui/banner';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { LinkAction, PinScreen } from '@/components/unlock/quick-unlock';
import { useQuickUnlockSettings } from '@/hooks/use-quick-unlock';
import { useSession } from '@/hooks/use-session';
import { formatCountdown } from '@/lib/format';
import { readBiometricCapability } from '@/lib/unlock/biometrics';
import { AUTO_LOCK_MINUTES, PIN_ATTEMPT_LIMIT, type LockPreferences } from '@/lib/unlock/pin';

type Change = Parameters<ReturnType<typeof useQuickUnlockSettings>['verifyChange']>[1];
type Flow =
  | { step: 'verify'; change: Change; preferences?: LockPreferences }
  | { step: 'create' | 'confirm'; intent: 'enablePin' | 'enableBiometrics' | 'changePin' };

export default function SecurityScreen() {
  const { t } = useTranslation('settings');
  const { t: tu } = useTranslation('unlock');
  const security = useQuickUnlockSettings();
  const { user } = useSession();
  const hasPassword = user?.has_password !== false;
  const { preferences, pinEnabled, biometric, biometricReady, attempts, cancelVerification } = security;
  const [capability, setCapability] = useState<Awaited<ReturnType<typeof readBiometricCapability>> | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [error, setError] = useState<'failed' | 'biometricFailed' | 'mismatch' | 'pinUnavailable' | null>(null);
  const [choosingDelay, setChoosingDelay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [offerPinOnly, setOfferPinOnly] = useState(false);
  const firstPin = useRef('');
  const pending = useRef(false);
  const paused = flow?.step === 'verify' && attempts.until > now;

  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const request = ++revision;
      const result = await readBiometricCapability();
      if (active && request === revision) setCapability(result);
    };
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNow(Date.now());
        void refresh();
      }
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!paused) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [paused]);

  useFocusEffect(useCallback(() => cancelVerification, [cancelVerification]));

  const finish = () => {
    firstPin.current = '';
    cancelVerification();
    setOfferPinOnly(false);
    setError(null);
    setFlow(null);
  };

  const perform = async (work: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch {
      setError('failed');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const beginVerification = (change: Change, preferences?: LockPreferences) => {
    setError(null);
    setNow(Date.now());
    setFlow({ step: 'verify', change, preferences });
  };

  const enable = capability?.available && capability.method
    ? { method: capability.method, prompt: tu(`biometric.${capability.method}.prompt`) }
    : undefined;
  const method = biometric ?? capability?.method;
  const methodLabel = method ? tu(`biometric.${method}.name`) : t('security.biometrics');
  const delayLabel = (minutes: LockPreferences['autoLockMinutes']) => minutes === 0
    ? t('security.immediately')
    : t('security.afterMinutes', { count: minutes });
  const hasBiometrics = !!biometric && biometricReady;
  const changePreferences = (next: LockPreferences) => {
    setChoosingDelay(false);
    if (next.lockOnExit === preferences.lockOnExit && next.autoLockMinutes === preferences.autoLockMinutes) return;
    if ((preferences.lockOnExit && !next.lockOnExit) || (!next.lockOnExit && next.autoLockMinutes > preferences.autoLockMinutes)) {
      beginVerification('relaxLock', next);
    } else {
      void perform(async () => { if (!await security.setPreferences(next)) setError('failed'); });
    }
  };

  const complete = (result: Awaited<ReturnType<typeof security.applyChange>>, change: Change) => {
    if (result === 'saved') finish();
    else {
      beginVerification(change, flow?.step === 'verify' ? flow.preferences : undefined);
      setError(result === 'biometricFailed' ? 'biometricFailed' : 'failed');
    }
  };

  // Account sign-in: works on every platform, independent of this phone's app lock.
  const signInGroup = (
    <ListGroup>
      <ListRow
        title={t(hasPassword ? 'security.changePassword' : 'security.setPassword')}
        subtitle={t(hasPassword ? 'security.passwordDetail' : 'security.passwordDetailSet')}
        leading={<IconTile icon="lock" tone="neutral" />}
        trailing={{ kind: 'chevron' }}
        disabled={busy}
        onPress={() => router.push('/settings/password')}
      />
    </ListGroup>
  );

  if (security.phase === 'unsupported') {
    return (
      <StackScreen title={t('security.title')}>
        <Text variant="label-large">{t('security.signIn')}</Text>
        {signInGroup}
        <Banner type="info" message={t('security.deviceOnly')} />
      </StackScreen>
    );
  }

  if (flow?.step === 'verify') {
    const { change, preferences: proposed } = flow;
    return (
      <PinScreen
        key={change}
        title={t('security.verifyTitle')}
        detail={t(`security.verify.${change}`, { method: methodLabel })}
        onBack={busy ? undefined : finish}
        pause={paused ? tu('pauseMessage', { time: formatCountdown(Math.ceil((attempts.until - now) / 1000)) }) : undefined}
        error={error ? t(`security.error.${error}`) : attempts.failures > 0
          ? tu('wrong', { count: PIN_ATTEMPT_LIMIT - attempts.failures }) : undefined}
        onPin={(value) => perform(async () => {
          const result = await security.verifyChange(value, change);
          setNow(Date.now());
          if (result !== 'verified') {
            if (result === 'unavailable') setError('pinUnavailable');
            return;
          }
          if (change === 'changePin') {
            setFlow({ step: 'create', intent: 'changePin' });
          } else {
            complete(await security.applyChange(change, { biometric: enable, preferences: proposed }), change);
          }
        })}
        footer={<LinkAction label={tu('forgotPin')} onPress={security.recoverPin} disabled={busy} />}
      />
    );
  }

  if (flow) {
    const { step, intent } = flow;
    const confirming = step === 'confirm';
    const save = async (withBiometrics: boolean) => {
      if (intent === 'changePin') {
        complete(await security.applyChange('changePin', { pin: firstPin.current }), 'changePin');
      } else if (withBiometrics && !enable) {
        setOfferPinOnly(true);
        setError('biometricFailed');
      } else if (await security.setPin(firstPin.current, withBiometrics ? enable : undefined)) {
        finish();
      } else {
        setOfferPinOnly(withBiometrics);
        setError(withBiometrics ? 'biometricFailed' : 'failed');
      }
    };
    return (
      <PinScreen
        key={step}
        title={tu(confirming ? 'confirmTitle' : intent === 'changePin' ? 'newPinTitle' : 'createTitle')}
        detail={confirming ? tu('confirmBody') : intent === 'enableBiometrics'
          ? tu('createBackup', { method: methodLabel }) : tu('createBody')}
        onBack={busy ? undefined : confirming ? () => {
          firstPin.current = '';
          setError(null);
          setOfferPinOnly(false);
          setFlow({ step: 'create', intent });
        } : finish}
        error={error ? t(`security.error.${error}`) : undefined}
        onPin={(value) => perform(async () => {
          if (!confirming) {
            firstPin.current = value;
            setFlow({ step: 'confirm', intent });
          } else if (firstPin.current !== value) {
            setOfferPinOnly(false);
            setError('mismatch');
          } else {
            await save(intent === 'enableBiometrics');
          }
        })}
        footer={offerPinOnly && <LinkAction label={tu('usePinOnly')} onPress={() => { void perform(() => save(false)); }} disabled={busy} />}
      />
    );
  }

  return (
    <StackScreen title={t('security.title')}>
      <Text variant="body-small" tone="secondary">{t('security.intro')}</Text>
      {error && <Banner type="warning" message={t(`security.error.${error}`)} />}
      <Text variant="label-large">{t('security.appLock')}</Text>
      <ListGroup>
        <ListRow
          title={t('security.pin')}
          subtitle={hasBiometrics ? t('security.pinBackup') : t('security.pinDetail')}
          leading={<IconTile icon="lock" tone="brand" />}
          trailing={{ kind: 'toggle', checked: pinEnabled }}
          disabled={busy}
          onPress={() => {
            setError(null);
            if (pinEnabled) beginVerification('disablePin');
            else setFlow({ step: 'create', intent: 'enablePin' });
          }}
        />
        <ListRow
          title={methodLabel}
          subtitle={!capability ? undefined : hasBiometrics && !enable ? t('security.biometricTemporarilyUnavailable')
            : !enable ? t('security.biometricUnavailable')
            : biometric && !biometricReady ? t('security.reconnect')
            : t('security.biometricDetail')}
          leading={<IconTile icon={method === 'fingerprint' || method === 'touchId' ? 'fingerprint' : 'face-id-key'} tone="brand" />}
          trailing={{ kind: 'toggle', checked: hasBiometrics }}
          disabled={busy || (!hasBiometrics && !enable)}
          onPress={() => {
            setError(null);
            if (hasBiometrics) beginVerification('disableBiometrics');
            else if (pinEnabled) beginVerification('enableBiometrics');
            else setFlow({ step: 'create', intent: 'enableBiometrics' });
          }}
        />
        {pinEnabled && <ListRow title={t('security.changePin')} trailing={{ kind: 'chevron' }} disabled={busy} onPress={() => beginVerification('changePin')} />}
      </ListGroup>
      <ListGroup>
        <ListRow
          title={t('security.autoLock')}
          subtitle={!pinEnabled ? t('security.requiresPin') : preferences.lockOnExit ? t('security.exitOverrides') : t('security.autoLockDetail')}
          trailing={{ kind: 'value', value: delayLabel(preferences.lockOnExit ? 0 : preferences.autoLockMinutes) }}
          disabled={!pinEnabled || busy || preferences.lockOnExit}
          onPress={() => setChoosingDelay(!choosingDelay)}
        />
        <ListRow
          title={t('security.lockOnExit')}
          subtitle={t('security.lockOnExitDetail')}
          trailing={{ kind: 'toggle', checked: pinEnabled && preferences.lockOnExit }}
          disabled={!pinEnabled || busy}
          onPress={() => changePreferences({ ...preferences, lockOnExit: !preferences.lockOnExit })}
        />
      </ListGroup>
      <Text variant="label-large">{t('security.signIn')}</Text>
      {signInGroup}
      {choosingDelay && pinEnabled && !preferences.lockOnExit && (
        <ListGroup>
          {AUTO_LOCK_MINUTES.map((minutes) => (
            <ListRow
              key={minutes}
              title={delayLabel(minutes)}
              trailing={{ kind: 'radio', checked: preferences.autoLockMinutes === minutes }}
              onPress={() => changePreferences({ ...preferences, autoLockMinutes: minutes })}
            />
          ))}
        </ListGroup>
      )}
    </StackScreen>
  );
}
