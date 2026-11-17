import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Small frosted-glass pill used on hero cards (Figma `Chip`). */
export function Chip({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full border border-glass-chip-stroke bg-glass-chip-fill px-md py-xs">
      <Text variant="caption">{label}</Text>
    </View>
  );
}
