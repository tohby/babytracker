import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { TabScreen } from '@/components/screen';
import { BabyProfileCard } from '@/components/tracking/baby-profile-card';
import { FamilyMemberRow } from '@/components/tracking/family-member-row';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { useSession } from '@/hooks/use-session';
import { ageLabel } from '@/lib/age-label';
import { formatDate } from '@/lib/format';

/**
 * V2-G01 Family (G02 opens the invite sheet, G03's pending row appears once invites exist). Caregivers come from
 * the API when family sharing ships; until then it's honestly just you.
 */
export default function FamilyScreen() {
  const { t } = useTranslation('family');
  const { user } = useSession();
  const { baby, name, events } = useLogContext();
  const { prefs } = useFormatPrefs();
  const pending = events.filter((e) => e.pendingSync).length;
  const me = user?.name ?? user?.email ?? '';
  return (
    <TabScreen>
      <Header type="large-title" title={t('title')} eyebrow={t('subtitle', { name })} />
      <View className="flex-row items-center justify-between">
        <Text variant="heading" accessibilityRole="header">
          {t('babies')}
        </Text>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.push('/onboarding')}>
          <Text variant="button-small" tone="link">
            {t('addBaby')}
          </Text>
        </Pressable>
      </View>
      {baby && (
        <BabyProfileCard
          name={baby.name}
          initials={baby.name.slice(0, 1).toUpperCase()}
          age={t('age', { age: ageLabel(baby.birth_date), date: formatDate(baby.birth_date, { day: 'numeric', month: 'short' }) })}
          units={[t(`units.${prefs.volumeUnit}`), t(`units.${prefs.weightUnit}`), t(prefs.hour12 === false ? 'units.h24' : 'units.h12')]}
          onEdit={() => router.push('/child-switcher')}
        />
      )}
      <Text variant="heading" accessibilityRole="header">
        {t('caregivers')}
      </Text>
      <ListGroup>
        <FamilyMemberRow status="active" name={t('you', { name: me })} initials={me.slice(0, 1).toUpperCase()} detail={t('ownerActive')} role={t('owner')} photo={user?.avatar_url ? { uri: user.avatar_url } : undefined} />
      </ListGroup>
      <Button hierarchy="secondary" label={t('invite')} onPress={() => router.push('/family/invite')} />
      <ListGroup>
        <ListRow leading={<IconTile icon="cloud-check" tone="brand" />} title={t('sync')} subtitle={pending ? t('syncDetail', { count: pending }) : t('syncDetailNone')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/sync')} />
        <ListRow leading={<IconTile icon="timeline" tone="neutral" />} title={t('activity')} subtitle={t('activityDetail')} trailing={{ kind: 'chevron' }} onPress={() => router.push('/timeline')} />
      </ListGroup>
    </TabScreen>
  );
}
