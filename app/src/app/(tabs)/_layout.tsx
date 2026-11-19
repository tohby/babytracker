import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AndroidFab, AndroidNavBar } from '@/components/chrome/android-nav-bar';
import { BottomNav } from '@/components/chrome/bottom-nav';
import { GlassTabBar, GlassTimerAccessory } from '@/components/chrome/glass-tab-bar';
import { TabBarInsetContext } from '@/components/chrome/tab-bar-inset';
import { timerRoute, useRunningTimer } from '@/components/chrome/timer-accessory';
import { TABS, type TabName } from '@/components/chrome/tabs';
import { TimerMiniBar } from '@/components/tracking/timer-mini-bar';
import { useLogStore } from '@/data/log-store';
import { useLiquidGlass } from '@/hooks/use-liquid-glass';

const openLog = () => router.push('/log');

/**
 * Nappa TabLayout: the one place that forks navigation chrome by platform (Figma "iOS / Liquid Glass" matrix).
 * - iOS 26+ with Reduce Transparency off: the Figma floating glass platter and separate Log button.
 * - iOS < 26 or Reduce Transparency: the solid V2 Bottom nav + FAB, with the Timer mini bar docked above it.
 * - Android: the Material 3 Android/Navigation bar + a separate 56 dp FAB.
 */
export default function TabLayout() {
  const glass = useLiquidGlass();
  return <SharedTabs glass={glass} />;
}

const NAV_HEIGHT = 64;
const MINI_BAR = 64;

function SharedTabs({ glass }: { glass: boolean }) {
  const insets = useSafeAreaInsets();
  const running = useRunningTimer();
  const { stopTimer } = useLogStore();
  const android = Platform.OS === 'android';
  // Bar height + 24 so content clears it; plus the mini bar (and its 8 gap) when a timer is docked.
  const barBlock = android ? 80 + insets.bottom + 72 : (glass ? 62 : NAV_HEIGHT) + 8 + insets.bottom;
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
          const mini = running && (glass ? <GlassTimerAccessory /> : (
            <TimerMiniBar
              kind={running.timer.kind === 'sleep' ? 'sleep' : 'nursing'}
              label={running.label}
              elapsed={running.elapsed}
              onOpen={() => router.push(timerRoute(running.timer.kind))}
              onStop={() => stopTimer()}
            />
          ));
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
              {glass ? <GlassTabBar active={active} onSelect={select} onLog={openLog} /> : <BottomNav active={active} onSelect={select} onLog={openLog} />}
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
