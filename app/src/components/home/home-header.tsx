import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Bar } from '@/components/home/home-skeleton';
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
  /** The avatar opens account settings (sign out lives there). */
  onAvatarPress?: () => void;
  /** Shows a placeholder bar instead of the family name while the baby loads (Figma M1-21). */
  loading?: boolean;
};

/** Greeting on the left, notification and appearance buttons on the right. */
export function HomeHeader({
  babyName,
  user,
  hasUnreadNotifications,
  onNotificationsPress,
  onAppearancePress,
  onAvatarPress,
  loading = false,
}: HomeHeaderProps) {
  const { t } = useTranslation(['home', 'common']);
  return (
    <View className="flex-row items-center justify-between gap-md">
      <View className="shrink gap-xs">
        <View className="flex-row items-center gap-sm">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home:openSettings')}
            onPress={onAvatarPress}
            hitSlop={8}
            className="active:opacity-70">
            <Avatar name={user.name} photo={user.photo} />
          </Pressable>
          <Text tone="muted">{t(`home:greeting.${getGreetingPeriod()}`)}</Text>
        </View>
        {babyName ? (
          <Text variant="title">{t('home:familyName', { name: babyName })}</Text>
        ) : loading ? (
          <Bar className="my-[3px] h-[28px] w-[160px]" />
        ) : (
          <Text variant="title">{t('home:familyNameFallback')}</Text>
        )}
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
