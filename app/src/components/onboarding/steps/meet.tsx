import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BigInput } from '@/components/onboarding/big-input';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import type { StepProps } from '@/components/onboarding/steps/types';
import { Mascot } from '@/components/ui/mascot';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';

/** Figma "Name the baby — big input". */
export function BabyNameStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const [name, setName] = useState(answers.babyName);
  const submit = () => {
    if (!name.trim()) return;
    update({ babyName: name.trim() });
    next(step, { edit });
  };
  return (
    <OnboardingScreen
      progress={progress}
      message={t('babyName.message')}
      actions={<Button label={t('continue')} onPress={submit} disabled={!name.trim()} />}>
      <BigInput
        label={t('babyName.label')}
        placeholder={t('babyName.placeholder')}
        value={name}
        onChangeText={setName}
        returnKeyType="next"
        onSubmitEditing={submit}
      />
    </OnboardingScreen>
  );
}

/** Figma "Nappa asks the parent's name". Optional: the account works without a name. */
export function ParentNameStep({ step, edit, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, update, next } = useOnboarding();
  const [name, setName] = useState(answers.parentName);
  const submit = () => {
    update({ parentName: name.trim() });
    next(step, { edit });
  };
  return (
    <OnboardingScreen
      progress={progress}
      message={t('parentName.message')}
      actions={<Button label={t('continue')} onPress={submit} />}>
      <BigInput
        label={t('parentName.label')}
        placeholder={t('parentName.placeholder')}
        value={name}
        onChangeText={setName}
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        onSubmitEditing={submit}
      />
    </OnboardingScreen>
  );
}

/** Figma "Reward moment". */
export function RewardStep({ step, progress }: StepProps) {
  const { t } = useTranslation('onboarding');
  const { answers, next } = useOnboarding();
  const message = answers.parentName
    ? t('reward.message', { baby: answers.babyName, parent: answers.parentName })
    : t('reward.messageNoParent', { baby: answers.babyName });
  return (
    <OnboardingScreen
      progress={progress}
      message={message}
      actions={<Button label={t('continue')} onPress={() => next(step)} />}>
      <View className="items-center pt-xl">
        <Mascot pose="milestone" size={220} />
      </View>
    </OnboardingScreen>
  );
}
