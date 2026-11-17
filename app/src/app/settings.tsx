import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAutoWindow } from '@/components/settings/use-auto-window';
import { GlassCard } from '@/components/ui/glass-card';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { ScreenBackground } from '@/components/ui/screen-background';
import { Text } from '@/components/ui/text';
import { useThemeMode } from '@/hooks/use-theme-mode';

/**
 * Settings (Figma `M6-01 Settings`). For now it holds only the Appearance row;
 * the other rows arrive with their milestones.
 */
export default function SettingsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation(['settings', 'common']);
  const { mode, applied } = useThemeMode();
  const window = useAutoWindow();

  const modeLabel = t(`settings:appearance.${mode}`);
  const autoSubtitle =
    mode === 'auto'
      ? applied === 'dark'
        ? t('settings:appearance.rowAutoDark', window.short)
        : t('settings:appearance.rowAutoLight', window.short)
      : undefined;

  return (
    <View className="flex-1">
      <ScreenBackground />

      {/* Top bar: back on the start side, title centred. */}
      <View style={{ paddingTop: top + 8 }} className="flex-row items-center px-page pb-md">
        <IconButton icon="back" label={t('common:actions.back')} onPress={() => router.back()} />
        <Text variant="heading" className="flex-1 text-center" accessibilityRole="header">
          {t('settings:title')}
        </Text>
        {/* Balances the back button so the title stays centred. */}
        <View className="size-[48px]" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        contentContainerClassName="gap-lg px-page pt-sm"
        showsVerticalScrollIndicator={false}>
        <GlassCard>
          <ListRow
            icon="moon"
            tone="lavender"
            title={t('settings:appearance.title')}
            subtitle={autoSubtitle}
            value={modeLabel}
            onPress={() => router.push('/appearance')}
          />
        </GlassCard>
      </ScrollView>
    </View>
  );
}
