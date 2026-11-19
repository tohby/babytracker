import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Figma `Section header`: titles a group of cards; optional end text action ("See all"). */
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="min-h-[32px] flex-row items-center justify-between gap-md">
      <Text variant="heading" accessibilityRole="header" className="flex-shrink">
        {title}
      </Text>
      {action && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12}>
          <Text variant="button-small" tone="link">
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
