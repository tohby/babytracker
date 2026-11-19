import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemeOptionCard } from '@/components/settings/theme-option-card';
import { useAutoWindow } from '@/components/settings/use-auto-window';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { useThemeMode } from '@/hooks/use-theme-mode';
import type { ThemeMode } from '@/lib/theme-schedule';

/**
 * Appearance sheet (Figma `M6-01b Appearance sheet`): Light / Dark / Auto as cards.
 * Shown by two routes: `/appearance` (Settings row) and `/theme-menu` (Home shortcut).
 * Both are native form sheets sized to their content (see the root layout), so the
 * grabber, swipe-to-dismiss and dimming come from the OS. Tapping a card applies it at
 * once and keeps the sheet open, so the change is visible behind it.
 */
export function AppearanceSheet() {
  const { t } = useTranslation(['settings', 'common']);
  const { mode, applied, setMode } = useThemeMode();
  const window = useAutoWindow();

  const options: { mode: ThemeMode; label: string; caption: string }[] = [
    { mode: 'light', label: t('settings:appearance.light'), caption: t('settings:appearance.allDay') },
    { mode: 'dark', label: t('settings:appearance.dark'), caption: t('settings:appearance.allDay') },
    { mode: 'auto', label: t('settings:appearance.auto'), caption: t('settings:appearance.autoWindow', window.short) },
  ];

  return (
    <View className="gap-lg px-page pt-xl pb-3xl">
      <View className="flex-row items-center gap-md">
        <Text variant="title-large" className="flex-1" accessibilityRole="header">
          {t('settings:appearance.title')}
        </Text>
        <IconButton icon="close" label={t('common:actions.close')} onPress={() => router.back()} />
      </View>

      <View className="gap-md">
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('settings:appearance.title')}
          className="flex-row gap-md">
          {options.map((option) => (
            <ThemeOptionCard
              key={option.mode}
              {...option}
              selected={option.mode === mode}
              onPress={() => setMode(option.mode)}
            />
          ))}
        </View>
        <Text variant="caption" tone="secondary" accessibilityLiveRegion="polite">
          {applied === 'dark'
            ? t('settings:appearance.sheetAutoDark', window.full)
            : t('settings:appearance.sheetAutoLight', window.full)}
        </Text>
      </View>
    </View>
  );
}
