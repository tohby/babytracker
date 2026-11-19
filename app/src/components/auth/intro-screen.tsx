import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Hero } from '@/components/ui/hero';
import { Text } from '@/components/ui/text';

/** V2-A02 Welcome: sleep Hero with the mascot, the promise in one line, then Get started / sign in. */
export function IntroScreen() {
  const { t } = useTranslation('auth');
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background-canvas" style={{ paddingBottom: Math.max(insets.bottom, 16) + 6 }}>
      <Hero tone="sleep" mascot="standing" height={360 + insets.top} />
      <View className="flex-1 gap-sm px-page pt-xl">
        <Text variant="title-large" accessibilityRole="header">
          {t('welcomeV2.title')}
        </Text>
        <Text variant="body" tone="secondary">
          {t('welcomeV2.body')}
        </Text>
      </View>
      <View className="gap-sm px-page">
        <Button label={t('welcomeV2.start')} onPress={() => router.push('/promise')} />
        <Button hierarchy="tertiary" size="medium" label={t('welcomeV2.haveAccount')} onPress={() => router.push('/sign-in')} />
      </View>
    </View>
  );
}
