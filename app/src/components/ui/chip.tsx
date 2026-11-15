import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Small white pill with an orange label, used on hero cards. */
export function Chip({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full bg-white px-md py-xs">
      <Text variant="caption" tone="accent">
        {label}
      </Text>
    </View>
  );
}
