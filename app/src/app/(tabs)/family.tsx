import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/chrome/tab-bar-inset';
import { Header } from '@/components/ui/header';

/** Temporary shell for the family tab while the chrome lands; the V2 screen replaces it. */
export default function Screen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottom = useTabBarInset();
  return (
    <ScrollView className="flex-1 bg-background-canvas" contentContainerClassName="gap-page px-page" contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: bottom }}>
      <Header type="large-title" title={t('nav.family')} />
    </ScrollView>
  );
}
