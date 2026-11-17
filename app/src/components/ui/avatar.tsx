import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

type AvatarProps = {
  name: string;
  /** Profile photo (Figma `Avatar/Photo`). Without one, shows the first letter on a gradient. */
  photo?: ImageSource | number;
  size?: number;
};

export function Avatar({ name, photo, size = 32 }: AvatarProps) {
  const colors = useThemeColors();
  return (
    <View style={{ width: size, height: size }} className="overflow-hidden rounded-full">
      {photo ? (
        <Image source={photo} style={{ width: size, height: size }} contentFit="cover" accessibilityLabel={name} />
      ) : (
        <LinearGradient
          colors={[colors['lavender/300'], colors['orange/500']]}
          locations={[0, 0.71]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption" tone="inverse">
            {name.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}
