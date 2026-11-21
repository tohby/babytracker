import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

import { EMAIL_PATTERN, toAuthProblem, type AuthProblem } from '@/components/auth/auth-problem';
import { CODE_LENGTH, CodeInput } from '@/components/auth/code-input';
import { FlowLink, FlowNotice, FlowScreen, FlowTitle } from '@/components/onboarding/flow-screen';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SignInButton } from '@/components/ui/sign-in-button';
import { Text } from '@/components/ui/text';
import { useSession } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authApi, type EmailIntent } from '@/lib/auth/endpoints';
import { formatCountdown } from '@/lib/format';

const RESEND_DELAY_MS = 60_000;

function nowMs() {
  return Date.now();
}

export function PromptLink({ prompt, label, onPress }: { prompt: string; label: string; onPress: () => void }) {
  return (
    <View className="min-h-[40px] flex-row flex-wrap items-center justify-center gap-xs">
      <Text variant="label-small" tone="secondary">{prompt}</Text>
      <FlowLink label={label} onPress={onPress} />
    </View>
  );
}

export function EmailAuth({ initialIntent, onBack, recovery }: {
  initialIntent: EmailIntent;
  onBack: () => void;
  recovery?: { email: string; requireNewPin: () => Promise<void>; done: () => void };
}) {
  const { t, i18n } = useTranslation('auth');
  const { account, verifyEmailCode } = useSession();
  const colors = useThemeColors();
  const [intent, setIntent] = useState(initialIntent);
  const [email, setEmail] = useState(recovery?.email ?? (initialIntent === 'sign_in' ? account?.email : '') ?? '');
  const [codePhase, setCodePhase] = useState(false);
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const [sendFailure, setSendFailure] = useState<AuthProblem | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [clock, setClock] = useState(0);
  const [providerNotice, setProviderNotice] = useState(false);
  const pending = useRef(false);
  const creating = intent === 'create_account';
  const cleanEmail = email.trim();
  const secondsLeft = Math.max(0, Math.ceil((cooldown - clock) / 1000));

  useEffect(() => {
    if (!codePhase || !cooldown) return;
    const tick = setInterval(() => setClock(nowMs()), 1000);
    return () => clearInterval(tick);
  }, [codePhase, cooldown]);

  const send = async (fresh = false) => {
    if (pending.current || !EMAIL_PATTERN.test(cleanEmail)) return;
    pending.current = true;
    setBusy(true);
    setProviderNotice(false);
    setSendFailure(null);
    try {
      await authApi.sendEmailCode({ email: cleanEmail, intent, locale: i18n.language, ...(creating ? { consent: true } : {}) });
      const now = nowMs();
      setClock(now);
      setCooldown(now + RESEND_DELAY_MS);
      setProblem(null);
      setCode('');
      setCodePhase(true);
    } catch (error) {
      const failure = toAuthProblem(error);
      if (codePhase) setSendFailure(failure);
      else setProblem(failure);
      if (failure.kind === 'tooManyRequests') {
        setClock(nowMs());
        setCooldown(failure.until);
      }
      if (fresh) setCode('');
    } finally {
      setBusy(false);
      pending.current = false;
    }
  };

  const verify = async () => {
    if (pending.current || code.length !== CODE_LENGTH) return;
    pending.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      await verifyEmailCode(cleanEmail, intent, code, recovery?.requireNewPin);
      recovery?.done();
    } catch (error) {
      const failure = toAuthProblem(error);
      setProblem(failure);
      if (failure.kind === 'emailInUse') setCodePhase(false);
      if (failure.kind === 'expiredCode') setCode('');
    } finally {
      setBusy(false);
      pending.current = false;
    }
  };

  const switchIntent = () => {
    setIntent(creating ? 'sign_in' : 'create_account');
    setProblem(null);
    setProviderNotice(false);
  };

  const editEmail = () => {
    if (pending.current) return;
    if (recovery) {
      onBack();
      return;
    }
    setCodePhase(false);
    setSendFailure(null);
    setProblem(null);
    setCode('');
  };

  const feedback = sendFailure ?? problem;
  const genericProblem = feedback && ['offline', 'tooManyRequests', 'locked', 'generic', 'validation'].includes(feedback.kind)
    ? t(feedback.kind === 'offline' ? 'offline' : feedback.kind === 'tooManyRequests' || feedback.kind === 'locked' ? 'rateLimit' : 'tryAgain')
    : null;

  if (codePhase) {
    const expired = problem?.kind === 'expiredCode';
    const wrong = problem?.kind === 'invalidCode';
    return (
      <FlowScreen onBack={editEmail} footer={
        <>
          <Button wrap label={t(expired ? 'newCode' : 'verify')} disabled={expired ? busy : code.length !== CODE_LENGTH} loading={busy} onPress={() => void (expired ? send(true) : verify())} />
          {expired || recovery
            ? <View className="min-h-[40px] justify-center"><FlowLink label={recovery ? t('backToPin') : t('differentEmail')} onPress={editEmail} /></View>
            : <PromptLink prompt={t('wrongEmail')} label={t('changeEmail')} onPress={editEmail} />}
        </>
      }>
        <View className="gap-lg pt-lg">
          <FlowTitle title={t('codeTitle')} subtitle={t(expired ? 'expiredSubtitle' : 'codeSubtitle', { email: cleanEmail })} />
          {expired && <FlowNotice icon="clock" warning>{t('codeExpired')}</FlowNotice>}
          <CodeInput value={code} disabled={expired || busy} error={wrong} accessibilityLabel={t('codeLabel')} onChange={(next) => {
            setCode(next);
            if (problem) setProblem(null);
          }} />
          {wrong && <FlowNotice error>{t('codeWrong')}</FlowNotice>}
          {!expired && (secondsLeft > 0 && !wrong
            ? <Text variant="label-small" tone="secondary">{t('resendCountdown', { time: formatCountdown(secondsLeft) })}</Text>
            : <Pressable accessibilityRole="button" disabled={busy} onPress={() => void send()} hitSlop={8}>
              <Text variant="label-small" tone="link">{t('resend')}</Text>
            </Pressable>)}
          {!wrong && !expired && <FlowNotice>{t(recovery ? 'recoveryCodeHelp' : 'codeHelp')}</FlowNotice>}
          {genericProblem && <FlowNotice error>{genericProblem}</FlowNotice>}
        </View>
      </FlowScreen>
    );
  }

  const emailInUse = problem?.kind === 'emailInUse';
  const emailField = (
    <View className="gap-sm">
      <Text variant="label-large">{t('email')}</Text>
      <View className={`min-h-control-lg flex-row items-center gap-md rounded-lg px-lg ${emailInUse ? 'border-2 border-border-error' : 'border border-border-default'}`}>
        <Icon name="mail" size={20} tone="color/icon/secondary" />
        <TextInput
          accessibilityLabel={t('email')}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="email"
          keyboardType="email-address"
          editable={!recovery && !busy}
          value={email}
          placeholder={t('emailPlaceholder')}
          placeholderTextColor={colors['color/text/tertiary']}
          onChangeText={(next) => { setEmail(next); setProblem(null); }}
          className="min-h-control-lg flex-1 font-outfit-regular text-text-primary"
        />
      </View>
      {emailInUse && <>
        <FlowNotice error>{t('emailInUse')}</FlowNotice>
        <Pressable accessibilityRole="button" onPress={switchIntent} className="min-h-control-md items-center justify-center rounded-full bg-brand-surface px-page py-sm">
          <Text variant="button-large" style={{ color: colors['color/brand/on-surface'] }}>{t('loginInstead')}</Text>
        </Pressable>
      </>}
    </View>
  );
  const providers = (
    <View className="gap-md">
      <SignInButton provider="apple" label={t('apple')} onPress={() => setProviderNotice(true)} />
      <SignInButton provider="google" label={t('google')} onPress={() => setProviderNotice(true)} />
      {providerNotice && <FlowNotice>{t('providerUnavailable')}</FlowNotice>}
    </View>
  );
  const divider = (
    <View className="flex-row items-center gap-md">
      <View className="h-px flex-1 bg-border-default" />
      <Text variant="caption" tone="secondary">{t('or')}</Text>
      <View className="h-px flex-1 bg-border-default" />
    </View>
  );

  return (
    <FlowScreen onBack={onBack} footer={
      <>
        <Button wrap label={t(creating ? 'continue' : 'send')} onPress={() => void send()} disabled={emailInUse || !EMAIL_PATTERN.test(cleanEmail)} loading={busy} />
        {creating && <Text variant="caption" tone="secondary" className="text-center">{t('terms')}</Text>}
        {!recovery && <PromptLink prompt={t(creating ? 'returningPrompt' : 'newPrompt')} label={t(creating ? 'loginLink' : 'createLink')} onPress={switchIntent} />}
      </>
    }>
      <View className="gap-xl pt-lg">
        <FlowTitle title={t(creating ? 'createTitle' : 'signInTitle')} subtitle={t(creating ? 'createSubtitle' : 'signInSubtitle')} />
        {recovery ? emailField : creating
          ? <>{providers}{divider}{emailField}</>
          : <>{emailField}{divider}{providers}</>}
        {genericProblem && <FlowNotice error>{genericProblem}</FlowNotice>}
      </View>
    </FlowScreen>
  );
}
