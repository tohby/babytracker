import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { Shadows } from '@/constants/theme';
import type { RememberedAccount } from '@/lib/auth/types';

/** Figma `Account chip`: who this phone remembers, with "Not you?". Initials when there's no photo. */
export function AccountChip({ account, onNotYou }: { account: RememberedAccount; onNotYou: () => void }) {
  const { t } = useTranslation('auth');
  const name = account.name ?? account.email;
  return (
    <View
      style={{ boxShadow: Shadows.glass }}
      className="w-full flex-row items-center gap-md rounded-full border border-glass-stroke bg-glass-fill p-sm">
      <Avatar initials={name.slice(0, 1)} photo={account.avatarUrl ? { uri: account.avatarUrl } : undefined} size="M" />
      <View className="flex-1 gap-xs">
        {account.name ? (
          <Text variant="label" numberOfLines={1}>
            {account.name}
          </Text>
        ) : null}
        <Text variant="caption" numberOfLines={1}>
          {account.email}
        </Text>
      </View>
      <TextButton label={t('welcomeBack.notYou')} onPress={onNotYou} />
    </View>
  );
}
