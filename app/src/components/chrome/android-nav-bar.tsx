import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TABS, type TabName } from '@/components/chrome/tabs';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/**
 * Figma `Android/Navigation bar` (Selected): Material 3 bar in V2 tokens. 80 dp surface, 64×32 pill indicator in
 * `primary/subtle`, labels always shown. No glass on Android.
 */
export function AndroidNavBar({ active, onSelect }: { active: TabName; onSelect: (tab: TabName) => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={{ paddingBottom: insets.bottom }} className="border-t border-border-default bg-background-surface">
      <View className="h-[80px] flex-row items-start gap-sm px-sm pt-md">
        {TABS.map((tab) => {
          const on = tab.name === active;
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.label)}
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(tab.name)}
              className="flex-1 items-center gap-xs">
              <View className={`h-[32px] w-[64px] items-center justify-center rounded-full ${on ? 'bg-primary-subtle' : ''}`}>
                <Icon name={tab.icon} tone={on ? 'color/primary/default' : 'color/icon/primary'} />
              </View>
              <Text variant="label-small" tone={on ? 'primary' : 'secondary'} numberOfLines={1}>
                {t(tab.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** The separate V2 FAB that pairs with the Android bar: 56 dp, radius 16, 16 dp above the bar, end-aligned. */
export function AndroidFab({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const shadow = useElevation('floating');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('nav.logEvent')}
      onPress={onPress}
      style={{ boxShadow: shadow }}
      className="size-control-lg items-center justify-center rounded-md bg-primary-default active:bg-primary-pressed">
      <Icon name="plus" tone="color/icon/on-primary" />
    </Pressable>
  );
}
