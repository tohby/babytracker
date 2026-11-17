import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { useSession } from '@/hooks/use-session';

/** Figma J1: confirm "Not you?". Forgets the account on this phone and opens the email form. */
export default function ForgetAccountSheet() {
  const { t } = useTranslation(['auth', 'common']);
  const { account, forgetAccount } = useSession();
  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    router.back();
    await forgetAccount();
  }

  return (
    <View style={{ paddingBottom: bottom + 16 }} className="gap-xl px-page pt-2xl">
      <View className="gap-sm">
        <Text variant="heading" accessibilityRole="header">
          {t('auth:welcomeBack.forgetTitle')}
        </Text>
        <Text>{t('auth:welcomeBack.forgetDetail', { email: account?.email ?? '' })}</Text>
      </View>
      <View className="items-center gap-sm">
        <PrimaryButton label={t('auth:welcomeBack.forgetConfirm')} onPress={confirm} loading={loading} />
        <TextButton label={t('common:actions.cancel')} onPress={() => router.back()} />
      </View>
    </View>
  );
}
