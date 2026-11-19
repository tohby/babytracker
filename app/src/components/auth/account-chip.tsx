import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Elevation } from '@/constants/theme';
import type { RememberedAccount } from '@/lib/auth/types';

/** Figma `Account chip`: who this phone remembers, with "Not you?". Initials when there's no photo. */
export function AccountChip({ account, onNotYou }: { account: RememberedAccount; onNotYou: () => void }) {
  const { t } = useTranslation('auth');
  const name = account.name ?? account.email;
  return (
    <View
      style={{ boxShadow: Elevation.card }}
      className="w-full flex-row items-center gap-md rounded-full border border-border-default bg-background-surface p-sm">
      <Avatar initials={name.slice(0, 1)} photo={account.avatarUrl ? { uri: account.avatarUrl } : undefined} size="M" />
      <View className="flex-1 gap-xs">
        {account.name ? (
          <Text variant="label-large" numberOfLines={1}>
            {account.name}
          </Text>
        ) : null}
        <Text variant="caption" numberOfLines={1}>
          {account.email}
        </Text>
      </View>
      <Button hierarchy="tertiary" size="medium" label={t('welcomeBack.notYou')} onPress={onNotYou} />
    </View>
  );
}
