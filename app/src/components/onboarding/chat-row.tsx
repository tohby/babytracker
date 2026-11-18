import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Shadows } from '@/constants/theme';

/** Figma `Mascot/Face`: Nappa's face next to the chat bubble. Decorative. */
export function MascotFace({ size = 52 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/mascot-face.svg')}
      style={{ width: size, height: Math.round((size * 73.32) / 84.24) }}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** Figma `Nappa App/Onboarding/Chat Row`: Nappa asks the question in a glass bubble. */
export function ChatRow({ message }: { message: string }) {
  return (
    <View className="flex-row items-start gap-md">
      <MascotFace />
      <View
        style={{ boxShadow: Shadows.glass }}
        className="flex-1 rounded-tile rounded-tl-[8px] border border-glass-stroke bg-glass-fill px-[20px] py-lg">
        <Text variant="heading" accessibilityRole="header">
          {message}
        </Text>
      </View>
    </View>
  );
}
