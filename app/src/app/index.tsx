import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGlow } from '@/components/home/background-glow';
import { BottomNav } from '@/components/home/bottom-nav';
import { HeroCards } from '@/components/home/hero-cards';
import { HomeHeader } from '@/components/home/home-header';
import { SinceLastSection } from '@/components/home/since-last-section';
import { sampleHomeData } from '@/data/home';

/** Height of the floating nav plus breathing room, so content never hides behind it. */
const NAV_CLEARANCE = 76 + 24;

export default function HomeScreen() {
  const { top, bottom } = useSafeAreaInsets();
  // Swap for real data once the API exists.
  const home = sampleHomeData;

  return (
    <View className="flex-1 bg-white">
      <BackgroundGlow />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 8, paddingBottom: bottom + NAV_CLEARANCE }}
        contentContainerClassName="gap-xl px-page"
        showsVerticalScrollIndicator={false}>
        <HomeHeader
          babyName={home.babyName}
          familyName={home.familyName}
          hasUnreadNotifications={home.hasUnreadNotifications}
        />
        <HeroCards nextNap={home.nextNap} feedDue={home.feedDue} />
        <SinceLastSection sinceLast={home.sinceLast} syncedWith={home.syncedWith} />
      </ScrollView>

      <BottomNav activeTab="today" />
    </View>
  );
}
