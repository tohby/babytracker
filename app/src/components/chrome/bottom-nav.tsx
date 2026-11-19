import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TABS, type TabName } from '@/components/chrome/tabs';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/**
 * Figma `Bottom nav` (Active) with `Nav item`: the solid fallback for iOS < 26 and Reduce Transparency.
 * Floating surface pill (Elevation 2) + teal log FAB, 12 apart. Active = teal pill with icon + label; inactive =
 * icon only, with the label kept as the accessibility name.
 */
export function BottomNav({ active, onSelect, onLog }: { active: TabName; onSelect: (tab: TabName) => void; onLog: () => void }) {
  const { t } = useTranslation();
  const shadow = useElevation('floating');
  return (
    <View className="flex-row items-center gap-md">
      <View accessibilityRole="tablist" style={{ boxShadow: shadow }} className="h-fab flex-1 flex-row items-center justify-between rounded-full bg-background-surface p-sm">
        {TABS.map((tab) => {
          const on = tab.name === active;
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.label)}
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(tab.name)}
              className={`h-control-md flex-row items-center justify-center gap-sm rounded-full ${on ? 'bg-primary-default px-lg' : 'w-control-md active:bg-state-pressed-surface'}`}>
              <Icon name={tab.icon} size={22} tone={on ? 'color/icon/on-primary' : 'color/icon/secondary'} />
              {on && (
                <Text variant="label-large" tone="on-primary" numberOfLines={1}>
                  {t(tab.label)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
      <IconButton icon="plus" variant="primary" size="large" elevation="floating" label={t('nav.logEvent')} onPress={onLog} />
    </View>
  );
}
