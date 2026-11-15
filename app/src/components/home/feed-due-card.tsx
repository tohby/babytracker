import { View } from 'react-native';

import { HeroCard } from '@/components/home/hero-card';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { Gradients } from '@/constants/theme';
import type { HomeData } from '@/data/home';

export function FeedDueCard({ feedDue }: { feedDue: HomeData['feedDue'] }) {
  return (
    <HeroCard gradient={Gradients.feedDue} width={150}>
      <View className="gap-xs px-lg pt-page">
        <Chip label="Feed due" />
        <Text variant="title">{feedDue.time}</Text>
      </View>
    </HeroCard>
  );
}
