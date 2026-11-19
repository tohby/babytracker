import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { OptionCard } from '@/components/ui/option-card';
import { Text } from '@/components/ui/text';
import { ALL_GROUPS, filterEvents, useTimelineFilter, type FilterGroup } from '@/data/timeline-filter';
import { useSession } from '@/hooks/use-session';
import { eventsOnDay, startOfDay } from '@/lib/log-summary';

/** V2-E03 `Sheet content/Timeline filter` in a compact Bottom sheet. */
export default function TimelineFilterSheet() {
  const { t } = useTranslation('timeline');
  const { user } = useSession();
  const { events, now } = useLogContext();
  const { filter, setFilter } = useTimelineFilter();
  const [groups, setGroups] = useState<FilterGroup[]>(filter.groups);
  const [onlyMe, setOnlyMe] = useState(filter.onlyMe);
  const count = filterEvents(eventsOnDay(events, startOfDay(now)), { groups, onlyMe }, user?.name ?? '').length;
  const toggle = (g: FilterGroup) => setGroups((xs) => (xs.includes(g) ? xs.filter((x) => x !== g) : [...xs, g]));
  return (
    <BottomSheet
      title={t('filter.title')}
      subtitle={t('filter.subtitle', { shown: groups.length, total: ALL_GROUPS.length })}
      onClose={() => router.back()}
      actions={
        <Button
          label={t('filter.apply', { count })}
          disabled={groups.length === 0}
          onPress={() => {
            setFilter({ groups, onlyMe });
            router.back();
          }}
        />
      }>
      <View className="gap-lg">
        <Text variant="label-large">{t('filter.show')}</Text>
        <View className="flex-row flex-wrap gap-sm">
          {ALL_GROUPS.map((g) => (
            <Chip key={g} label={t(`filter.types.${g}`)} variant={groups.includes(g) ? 'selected' : 'outline'} selected={groups.includes(g)} onPress={() => toggle(g)} />
          ))}
        </View>
      </View>
      <View className="gap-md">
        <Text variant="label-large">{t('filter.loggedBy')}</Text>
        <OptionCard title={t('filter.everyone')} selected={!onlyMe} onPress={() => setOnlyMe(false)} />
        <OptionCard title={t('filter.onlyMe')} selected={onlyMe} onPress={() => setOnlyMe(true)} />
      </View>
    </BottomSheet>
  );
}
