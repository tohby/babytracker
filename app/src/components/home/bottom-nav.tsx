import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Palette, Shadows } from '@/constants/theme';

type NavTab = { key: string; label: string; icon: IconName };

/** Two tabs on each side of the big "log" button. */
const leftTabs: NavTab[] = [
  { key: 'today', label: 'Today', icon: 'home' },
  { key: 'timeline', label: 'Timeline', icon: 'timeline' },
];
const rightTabs: NavTab[] = [
  { key: 'sleep', label: 'Sleep', icon: 'moon' },
  { key: 'family', label: 'Family', icon: 'family' },
];

type BottomNavProps = {
  activeTab: string;
  onTabPress?: (key: string) => void;
  onLogPress?: () => void;
};

/** Floating pill at the bottom of the screen. */
export function BottomNav({ activeTab, onTabPress, onLogPress }: BottomNavProps) {
  const { bottom } = useSafeAreaInsets();

  const renderTab = ({ key, label, icon }: NavTab) => {
    const isActive = key === activeTab;
    const color = isActive ? Palette.orange500 : Palette.plum600;
    return (
      <Pressable
        key={key}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        onPress={() => onTabPress?.(key)}
        className="items-center gap-xs">
        <Icon name={icon} color={color} />
        <Text variant="caption" tone={isActive ? 'accent' : 'muted'}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{ bottom: Math.max(bottom, 16), boxShadow: Shadows.floatingNav }}
      className="absolute inset-x-page h-[76px] flex-row items-center justify-between rounded-full bg-white/90 px-[28px]">
      {leftTabs.map(renderTab)}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log an event"
        onPress={onLogPress}
        style={{ boxShadow: Shadows.logButton }}
        className="size-[60px] items-center justify-center rounded-full bg-orange-500">
        <Icon name="plus" color={Palette.white} />
      </Pressable>

      {rightTabs.map(renderTab)}
    </View>
  );
}
