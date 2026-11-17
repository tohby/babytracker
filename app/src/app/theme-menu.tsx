import { router } from 'expo-router';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { Text } from '@/components/ui/text';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { THEME_MODES } from '@/lib/theme-schedule';

/**
 * Quick theme menu opened from the Home gear: Light / Dark / Auto, then Cancel.
 *
 * A shortcut only. It calls the same `setMode` as the Settings Appearance sheet, so both
 * read and write one stored setting. No selected marker by design. Presented as a native
 * form sheet (see the root layout): swipe down or tap the dimmed area to dismiss.
 * No Figma frame yet; built from existing pieces (GlassCard, Text, spacing tokens).
 */
export default function ThemeMenuSheet() {
  const { t } = useTranslation(['settings', 'common']);
  const { setMode } = useThemeMode();

  return (
    <View className="gap-md px-page pt-xl pb-3xl">
      <GlassCard>
        {THEME_MODES.map((mode, index) => (
          <Fragment key={mode}>
            {index > 0 && <View className="h-px bg-glass-stroke" />}
            <SheetRow
              label={t(`settings:appearance.${mode}`)}
              onPress={() => {
                setMode(mode);
                router.back();
              }}
            />
          </Fragment>
        ))}
      </GlassCard>
      <GlassCard>
        <SheetRow label={t('common:actions.cancel')} muted onPress={() => router.back()} />
      </GlassCard>
    </View>
  );
}

function SheetRow({ label, muted, onPress }: { label: string; muted?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-[56px] items-center justify-center px-lg py-md active:opacity-70">
      <Text tone={muted ? 'muted' : 'default'}>{label}</Text>
    </Pressable>
  );
}
