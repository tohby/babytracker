import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Gradients } from '@/constants/theme';

/** Round gradient badge showing a name's first letter. */
export function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <View style={{ width: size, height: size }} className="overflow-hidden rounded-full">
      <LinearGradient {...Gradients.avatar} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="caption" tone="inverse">
          {name.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>
    </View>
  );
}
