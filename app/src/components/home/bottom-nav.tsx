import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { ComponentRef, RefObject } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Icon, type IconName } from '@/components/ui/icon';
import { Shadows } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type NavTab = { key: string; label: ParseKeys<'common'>; icon: IconName };

const tabs: NavTab[] = [
  { key: 'today', label: 'nav.today', icon: 'home' },
  { key: 'timeline', label: 'nav.timeline', icon: 'timeline' },
  { key: 'insights', label: 'nav.insights', icon: 'insights' },
  { key: 'family', label: 'nav.family', icon: 'family' },
];

type BottomNavProps = {
  activeTab: string;
  onTabPress?: (key: string) => void;
  onLogPress?: () => void;
  /** Android: the screen content to blur behind the glass (see `GlassSurface`). */
  blurTarget?: RefObject<ComponentRef<typeof View> | null>;
};

/**
 * Floating glass tab bar with the Log button beside it (Figma `Bottom nav`).
 * Tabs are icon-only; their names are read by screen readers.
 */
export function BottomNav({ activeTab, onTabPress, onLogPress, blurTarget }: BottomNavProps) {
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const colors = useThemeColors();

  return (
    <View style={{ bottom: Math.max(bottom, 16) }} className="absolute inset-x-page flex-row items-center gap-md">
      <GlassSurface
        radius={34}
        blurTarget={blurTarget}
        style={{ boxShadow: Shadows.glass }}
        className="h-[68px] flex-1 flex-row items-center px-lg">
        <View accessibilityRole="tablist" className="flex-1 flex-row items-center">
          {tabs.map(({ key, label, icon }) => {
            const isActive = key === activeTab;
            return (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityLabel={t(label)}
                accessibilityState={{ selected: isActive }}
                onPress={() => onTabPress?.(key)}
                className="h-[48px] flex-1 items-center justify-center">
                <View
                  className={`size-[48px] items-center justify-center rounded-full ${isActive ? 'bg-surface-inverse' : ''}`}>
                  <View style={{ opacity: isActive ? 1 : 0.58 }}>
                    <Icon name={icon} color={isActive ? colors['icon/on-accent'] : colors['icon/primary']} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('nav.logEvent')}
        onPress={onLogPress}
        style={{ boxShadow: Shadows.logButton }}
        className="size-[62px] items-center justify-center rounded-full border border-accent-ring bg-accent-primary">
        <Icon name="plus" color={colors['icon/on-accent']} />
      </Pressable>
    </View>
  );
}
