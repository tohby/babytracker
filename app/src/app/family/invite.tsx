import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { Banner } from '@/components/ui/banner';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/option-card';
import { Text } from '@/components/ui/text';

/**
 * V2-G02 Invite a caregiver (`Sheet content/Invite caregiver`). There is no invite API yet, so no link is shown and
 * sharing is disabled with an honest banner (see gaps list).
 */
export default function InviteSheet() {
  const { t } = useTranslation('family');
  const { name } = useLogContext();
  const [role, setRole] = useState<'caregiver' | 'viewer'>('caregiver');
  return (
    <BottomSheet size="tall" title={t('inviteSheet.title')} subtitle={t('inviteSheet.subtitle', { name })} onClose={() => router.back()} actions={<Button label={t('inviteSheet.share')} disabled />}>
      <Text variant="body-small" tone="secondary">
        {t('inviteSheet.body', { name })}
      </Text>
      <Banner type="info" message={t('inviteSheet.unavailable')} />
      <View className="gap-md">
        <Text variant="label-large">{t('inviteSheet.role')}</Text>
        <OptionCard title={t('inviteSheet.caregiver')} detail={t('inviteSheet.caregiverDetail')} selected={role === 'caregiver'} onPress={() => setRole('caregiver')} />
        <OptionCard title={t('inviteSheet.viewer')} detail={t('inviteSheet.viewerDetail')} selected={role === 'viewer'} onPress={() => setRole('viewer')} />
      </View>
    </BottomSheet>
  );
}
