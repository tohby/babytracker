import { BlurTargetView } from 'expo-blur';
import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/home/bottom-nav';
import { HeroCards } from '@/components/home/hero-cards';
import { HomeHeader } from '@/components/home/home-header';
import { SinceLastSection } from '@/components/home/since-last-section';
import { ScreenBackground } from '@/components/ui/screen-background';
import { getSampleHomeData } from '@/data/home';
import { useNow } from '@/hooks/use-now';

/** Height of the floating nav plus breathing room, so content never hides behind it. */
const NAV_CLEARANCE = 76 + 24;

export default function HomeScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const now = useNow();
  // Swap for real data once the API exists. Built once so sample times don't drift with `now`.
  const [home] = useState(() => getSampleHomeData());
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
          />
          <HeroCards nextNap={home.nextNap} feedDue={home.feedDue} now={now} />
          <SinceLastSection
            lastFeed={home.lastFeed}
            awakeSince={home.awakeSince}
            lastNappy={home.lastNappy}
            sleepToday={home.sleepToday}
            syncedWith={home.syncedWith}
            now={now}
          />
        </ScrollView>
      </BlurTargetView>

      <BottomNav activeTab="today" blurTarget={blurTarget} />
    </View>
  );
}
