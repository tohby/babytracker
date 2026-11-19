import { Pressable, View } from 'react-native';

import type { IconName } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/** Figma `Insight card` (Tone: Sleep / Feed / Care). Calm, factual, never medical advice. */
export function InsightCard({
  tone,
  icon,
  title,
  body,
  link,
  onLink,
}: {
  tone: 'sleep' | 'feed' | 'care';
  icon: IconName;
  title: string;
  body: string;
  link?: string;
  onLink?: () => void;
}) {
  const shadow = useElevation('card');
  return (
    <View style={{ boxShadow: shadow }} className="flex-row gap-md rounded-2xl bg-background-surface p-page">
      <IconTile icon={icon} tone={tone} />
      <View className="flex-1 gap-xs">
        <Text variant="subheading">{title}</Text>
        <Text variant="body-small" tone="secondary">
          {body}
        </Text>
        {link && onLink && (
          <Pressable accessibilityRole="link" onPress={onLink} hitSlop={12} className="self-start">
            <Text variant="button-small" tone="link">
              {link}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
