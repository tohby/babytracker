import { ScrollView } from 'react-native';

import { FeedDueCard } from '@/components/home/feed-due-card';
import { NextNapCard } from '@/components/home/next-nap-card';
import type { HomeData } from '@/data/home';

type HeroCardsProps = Pick<HomeData, 'nextNap' | 'feedDue' | 'babyName'> & { now: number };

/**
 * Side-by-side hero cards that scroll sideways. The second card peeks
 * in from the right edge to hint that there is more to swipe to.
 */
export function HeroCards({ nextNap, feedDue, babyName, now }: HeroCardsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Bleed to the screen edges, but start and end aligned with the page margin.
      contentContainerClassName="gap-md px-page"
      className="-mx-page">
      {nextNap ? <NextNapCard nextNap={nextNap} babyName={babyName} now={now} /> : null}
      <FeedDueCard feedDue={feedDue} />
    </ScrollView>
  );
}
