import { ScrollView } from 'react-native';

import { FeedDueCard } from '@/components/home/feed-due-card';
import { NextNapCard } from '@/components/home/next-nap-card';
import type { HomeData } from '@/data/home';

type HeroCardsProps = Pick<HomeData, 'nextNap' | 'feedDue'>;

/**
 * Side-by-side hero cards that scroll sideways. The second card peeks
 * in from the right edge to hint that there is more to swipe to.
 */
export function HeroCards({ nextNap, feedDue }: HeroCardsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Bleed to the screen edges, but start and end aligned with the page margin.
      contentContainerClassName="gap-md px-page"
      className="-mx-page">
      <NextNapCard nextNap={nextNap} />
      <FeedDueCard feedDue={feedDue} />
    </ScrollView>
  );
}
