import { View } from 'react-native';

import { AppIcon } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';
import { Elevation } from '@/constants/theme';

/**
 * Nappa's face next to the chat bubble. The new mascot set has no separate face asset, so this is the Peach close-up
 * app icon (the chosen icon concept). Decorative.
 */
export function MascotFace({ size = 52 }: { size?: number }) {
  return <AppIcon size={size} />;
}

/** Figma `Nappa App/Onboarding/Chat Row`: Nappa asks the question in a glass bubble. */
export function ChatRow({ message }: { message: string }) {
  return (
    <View className="flex-row items-start gap-md">
      <MascotFace />
      <View
        style={{ boxShadow: Elevation.card }}
        className="flex-1 rounded-xl rounded-tl-[8px] border border-border-default bg-background-surface px-[20px] py-lg">
        <Text variant="heading" accessibilityRole="header">
          {message}
        </Text>
      </View>
    </View>
  );
}
