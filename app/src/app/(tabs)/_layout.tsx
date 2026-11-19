import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { NativeTabs } from 'expo-router/native-tabs';
import { Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AndroidFab, AndroidNavBar } from '@/components/chrome/android-nav-bar';
import { BottomNav } from '@/components/chrome/bottom-nav';
import { TabBarInsetContext } from '@/components/chrome/tab-bar-inset';
import { TimerAccessory, timerRoute, useRunningTimer } from '@/components/chrome/timer-accessory';
import { TABS, type TabName } from '@/components/chrome/tabs';
import { TimerMiniBar } from '@/components/tracking/timer-mini-bar';
import { Typography } from '@/constants/theme';
import { useLogStore } from '@/data/log-store';
import { useLiquidGlass } from '@/hooks/use-liquid-glass';
import { useThemeColors } from '@/hooks/use-theme-colors';

const openLog = () => router.push('/log');

/**
 * Nappa TabLayout: the one place that forks navigation chrome by platform (Figma "iOS / Liquid Glass" matrix).
 * - iOS 26+ with Reduce Transparency off: the system tab bar (NativeTabs) = real Liquid Glass, selection lens and
 *   scroll-edge fade. The Log button is a 5th "Log" tab that is `disabled` (never selected) and opens the quick-log
 *   sheet when pressed; the running timer is the tab bar's bottom accessory.
 * - iOS < 26 or Reduce Transparency: the solid V2 Bottom nav + FAB, with the Timer mini bar docked above it.
 * - Android: the Material 3 Android/Navigation bar + a separate 56 dp FAB.
 */
export default function TabLayout() {
  const glass = useLiquidGlass();
  return glass ? <GlassTabs /> : <SolidTabs />;
}

function GlassTabs() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { timer } = useLogStore();
  const tab = Typography['V2/Tab label'];
  return (
    // Native tabs inset scroll content for the bar themselves; screens add the extra 24.
    <TabBarInsetContext.Provider value={24}>
      <NativeTabs
        tintColor={colors['color/primary/default']}
        iconColor={{ default: colors['color/icon/primary'], selected: colors['color/primary/default'] }}
        labelStyle={{ default: { fontFamily: tab.fontFamily, fontSize: tab.fontSize, color: colors['color/text/primary'] }, selected: { fontFamily: tab.fontFamily, fontSize: tab.fontSize, color: colors['color/primary/default'] } }}
        screenListeners={{
          tabPress: (e) => {
            if (e.target?.startsWith('quick-log')) openLog();
          },
        }}>
        {TABS.map((item) => (
          <NativeTabs.Trigger key={item.name} name={item.name}>
            <NativeTabs.Trigger.Icon src={item.tabIcon} renderingMode="template" />
            <NativeTabs.Trigger.Label>{t(item.label)}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
        {/* Prototype (b) from the Figma open question: a Log tab whose press opens the sheet. */}
        <NativeTabs.Trigger name="quick-log" disabled>
          <NativeTabs.Trigger.Icon src={require('@/assets/tab-icons/plus.png')} renderingMode="template" />
          <NativeTabs.Trigger.Label>{t('nav.log')}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        {timer && (
          <NativeTabs.BottomAccessory>
            <TimerAccessory />
          </NativeTabs.BottomAccessory>
        )}
      </NativeTabs>
    </TabBarInsetContext.Provider>
  );
}

const NAV_HEIGHT = 64;
const MINI_BAR = 64;

function SolidTabs() {
  const insets = useSafeAreaInsets();
  const running = useRunningTimer();
  const { stopTimer } = useLogStore();
  const android = Platform.OS === 'android';
  // Bar height + 24 so content clears it; plus the mini bar (and its 8 gap) when a timer is docked.
  const barBlock = android ? 80 + insets.bottom + 72 : NAV_HEIGHT + 8 + insets.bottom;
  const inset = barBlock + 24 + (running ? MINI_BAR + 8 : 0);
  return (
    <TabBarInsetContext.Provider value={inset}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={({ state, navigateToTab }) => {
          const active = state.routes[state.index]?.name as TabName;
          const select = (name: TabName) => {
            const route = state.routes.find((r) => r.name === name);
            if (route) navigateToTab(route.key);
          };
          const mini = running && (
            <TimerMiniBar
              kind={running.timer.kind === 'sleep' ? 'sleep' : 'nursing'}
              label={running.label}
              elapsed={running.elapsed}
              onOpen={() => router.push(timerRoute(running.timer.kind))}
              onStop={() => stopTimer()}
            />
          );
          if (android) {
            return (
              <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
                <View pointerEvents="box-none" className="gap-sm px-page pb-lg">
                  {mini}
                  <View className="items-end">
                    <AndroidFab onPress={openLog} />
                  </View>
                </View>
                <AndroidNavBar active={active} onSelect={select} />
              </View>
            );
          }
          return (
            <View pointerEvents="box-none" style={{ paddingBottom: insets.bottom + 8 }} className="absolute inset-x-0 bottom-0 gap-sm px-page">
              {mini}
              <BottomNav active={active} onSelect={select} onLog={openLog} />
            </View>
          );
        }}>
        {TABS.map((item) => (
          <Tabs.Screen key={item.name} name={item.name} />
        ))}
        <Tabs.Screen name="quick-log" options={{ href: null }} />
      </Tabs>
    </TabBarInsetContext.Provider>
  );
}
