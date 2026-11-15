import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { getGreeting } from '@/lib/greeting';

type HomeHeaderProps = {
  babyName: string;
  familyName: string;
  hasUnreadNotifications: boolean;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
};

/** Greeting on the left, notification and settings buttons on the right. */
export function HomeHeader({
  babyName,
  familyName,
  hasUnreadNotifications,
  onNotificationsPress,
  onSettingsPress,
}: HomeHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="gap-xs">
        <View className="flex-row items-center gap-sm">
          <Avatar name={babyName} />
          <Text tone="muted">{getGreeting()}</Text>
        </View>
        <Text variant="title">{familyName}</Text>
      </View>

      <View className="flex-row gap-sm">
        <IconButton
          icon="bell"
          label="Notifications"
          showBadge={hasUnreadNotifications}
          onPress={onNotificationsPress}
        />
        <IconButton icon="settings" label="Settings" onPress={onSettingsPress} />
      </View>
    </View>
  );
}
