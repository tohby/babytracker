import { Image } from 'expo-image';
import { View } from 'react-native';

import { HeroCard } from '@/components/home/hero-card';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { Gradients, Palette } from '@/constants/theme';
import type { HomeData } from '@/data/home';

type NextNapCardProps = {
  nextNap: HomeData['nextNap'];
  onOpenPress?: () => void;
};

export function NextNapCard({ nextNap, onOpenPress }: NextNapCardProps) {
  return (
    <HeroCard gradient={Gradients.nextNap} width={292}>
      {/* Sleepy cloud mascot, peeking in from the bottom-left corner. */}
      <Image
        source={require('@/assets/images/mascot/cloud.svg')}
        style={{ position: 'absolute', left: -18, bottom: 2, width: 144, height: 108 }}
        accessibilityElementsHidden
      />

      <View className="flex-1 items-end justify-between p-page">
        <View className="items-end gap-xs">
          <Chip label="Next nap" />
          <Text variant="display" tone="inverse">
            {nextNap.time}
          </Text>
          <View className="items-end">
            <Text tone="inverse">{nextNap.windowUntil}</Text>
            <Text tone="inverse">{nextNap.startsIn}</Text>
          </View>
        </View>

        <IconButton
          icon="arrow"
          label="Open next nap details"
          size={44}
          backgroundClassName="bg-white/30"
          iconColor={Palette.white}
          onPress={onOpenPress}
        />
      </View>
    </HeroCard>
  );
}
