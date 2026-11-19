import { GlassContainer, GlassView } from 'expo-glass-effect';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUniwind } from 'uniwind';

import { TABS, type TabName } from '@/components/chrome/tabs';
import { TimerAccessory } from '@/components/chrome/timer-accessory';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

/** Figma `iOS/Tab bar`: four destinations in a glass platter and an independent Log button. */
export function GlassTabBar({ active, onSelect, onLog }: { active: TabName; onSelect: (tab: TabName) => void; onLog: () => void }) {
  const { t } = useTranslation();
  const { theme } = useUniwind();
  const colors = useThemeColors();
  const colorScheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <GlassContainer spacing={12} style={{ height: 62, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <GlassView glassEffectStyle="regular" colorScheme={colorScheme} style={{ height: 62, flex: 1, borderRadius: 31, padding: 4 }}>
        <View accessibilityRole="tablist" className="flex-1 flex-row">
          {TABS.map((tab) => {
            const selected = tab.name === active;
            return (
              <Pressable
                key={tab.name}
                accessibilityRole="tab"
                accessibilityLabel={t(tab.label)}
                accessibilityState={{ selected }}
                onPress={() => onSelect(tab.name)}
                className="min-w-0 flex-1 items-center justify-center gap-[2px] rounded-full">
                {selected && <GlassView glassEffectStyle="regular" isInteractive colorScheme={colorScheme} pointerEvents="none" className="absolute inset-0 rounded-full" />}
                <Icon name={tab.icon} size={24} tone={selected ? 'color/primary/default' : 'color/icon/primary'} />
                <Text variant="tab-label" tone={selected ? 'brand' : 'primary'} numberOfLines={1} adjustsFontSizeToFit>
                  {t(tab.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassView>
      <Pressable accessibilityRole="button" accessibilityLabel={t('nav.logEvent')} onPress={onLog} style={{ width: 62, height: 62, borderRadius: 31 }}>
        <GlassView glassEffectStyle="regular" isInteractive colorScheme={colorScheme} tintColor={colors['color/primary/default']} style={{ flex: 1, borderRadius: 31, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={28} tone="color/icon/on-primary" />
        </GlassView>
      </Pressable>
    </GlassContainer>
  );
}

export function GlassTimerAccessory() {
  const { theme } = useUniwind();
  return (
    <GlassView glassEffectStyle="regular" colorScheme={theme === 'dark' ? 'dark' : 'light'} style={{ height: 52, borderRadius: 26 }}>
      <TimerAccessory />
    </GlassView>
  );
}
