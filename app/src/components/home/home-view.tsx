import { BlurTargetView } from 'expo-blur';
import { router } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/home/bottom-nav';
import { HeroCards } from '@/components/home/hero-cards';
import { HomeHeader } from '@/components/home/home-header';
import { HomeSkeleton } from '@/components/home/home-skeleton';
import { SinceLastSection } from '@/components/home/since-last-section';
import { ScreenBackground } from '@/components/ui/screen-background';
import type { HomeData } from '@/data/home';

/** Height of the floating nav plus breathing room, so content never hides behind it. */
const NAV_CLEARANCE = 76 + 24;

/** The Home screen's layout, given its data. `loading` shows the Figma M1-21 skeleton. */
export function HomeView({ home, loading, now }: { home: HomeData; loading: boolean; now: number }) {
  const { top, bottom } = useSafeAreaInsets();
  // Android blurs only what is inside a BlurTargetView; iOS ignores it.
  const blurTarget = useRef<ComponentRef<typeof View>>(null);

  return (
    <View className="flex-1">
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
        <ScreenBackground />

        <ScrollView
          contentContainerStyle={{
            paddingTop: top + 8,
            paddingBottom: bottom + NAV_CLEARANCE,
          }}
          contentContainerClassName="gap-xl px-page"
          showsVerticalScrollIndicator={false}>
          <HomeHeader
            babyName={home.babyName}
            user={home.user}
            hasUnreadNotifications={home.hasUnreadNotifications}
            onAppearancePress={() => router.push('/theme-menu')}
            onAvatarPress={() => router.push('/settings')}
            loading={loading}
          />
          {loading ? (
            <HomeSkeleton />
          ) : (
            <>
              <HeroCards nextNap={home.nextNap} feedDue={home.feedDue} babyName={home.babyName} now={now} />
              <SinceLastSection
                lastFeed={home.lastFeed}
                awakeSince={home.awakeSince}
                lastNappy={home.lastNappy}
                sleepToday={home.sleepToday}
                syncedWith={home.syncedWith}
                babyName={home.babyName}
                now={now}
              />
            </>
          )}
        </ScrollView>
      </BlurTargetView>

      <BottomNav activeTab="today" blurTarget={blurTarget} />
    </View>
  );
}

/** Home data before any logs: everything from logs is empty (Figma M1-20). */
export function firstLaunchHome(fields: Pick<HomeData, 'babyName' | 'user' | 'nextNap'>): HomeData {
  return {
    ...fields,
    // No notifications yet.
    hasUnreadNotifications: false,
    // Everything below comes from logs, which arrive with M2 (logging core).
    feedDue: null,
    syncedWith: null,
    lastFeed: null,
    awakeSince: null,
    lastNappy: null,
    sleepToday: null,
  };
}
