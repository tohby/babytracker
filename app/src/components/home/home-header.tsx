import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import type { HomeData } from '@/data/home';
import { getGreetingPeriod } from '@/lib/greeting';

type HomeHeaderProps = {
  babyName: string;
  /** The signed-in caregiver, shown as the avatar beside the greeting. */
  user: HomeData['user'];
  hasUnreadNotifications: boolean;
  onNotificationsPress?: () => void;
  /** Opens the Light / Dark / Auto quick menu. */
  onAppearancePress?: () => void;
};

/** Greeting on the left, notification and appearance buttons on the right. */
export function HomeHeader({
  babyName,
  user,
  hasUnreadNotifications,
  onNotificationsPress,
  onAppearancePress,
}: HomeHeaderProps) {
  const { t } = useTranslation(['home', 'common']);
  return (
    <View className="flex-row items-center justify-between gap-md">
      <View className="shrink gap-xs">
        <View className="flex-row items-center gap-sm">
          <Avatar name={user.name} photo={user.photo} />
          <Text tone="muted">{t(`home:greeting.${getGreetingPeriod()}`)}</Text>
        </View>
        <Text variant="title">{t('home:familyName', { name: babyName })}</Text>
      </View>

      <View className="flex-row gap-sm">
        <IconButton
          icon="bell"
          label={t('common:actions.notifications')}
          showBadge={hasUnreadNotifications}
          onPress={onNotificationsPress}
        />
        <IconButton icon="settings" label={t('common:actions.appearance')} onPress={onAppearancePress} />
      </View>
    </View>
  );
}
