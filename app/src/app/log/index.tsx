import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LogTile } from '@/components/tracking/log-tile';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { SearchField } from '@/components/ui/search-field';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import type { LogType } from '@/constants/log-types';
import { useBabyEvents, useLogStore } from '@/data/log-store';
import { useCurrentBaby } from '@/hooks/use-current-baby';
import { useNow } from '@/hooks/use-now';
import { elapsedMs, formatDuration, formatTime, formatVolume } from '@/lib/format';
import { predictNextNap } from '@/lib/prediction';

/** Where each tile goes: its own sheet (Bath opens Activity with Bath picked). */
const routes: Record<LogType, Href> = {
  feed: '/log/feed',
  sleep: '/log/nap',
  nappy: '/log/nappy',
  nursing: '/log/nursing',
  pumping: '/log/pumping',
  solids: '/log/solids',
  medicine: '/log/medicine',
  growth: '/log/growth',
  bath: { pathname: '/log/activity', params: { kind: 'bath' } },
  tummy: { pathname: '/log/activity', params: { kind: 'tummy' } },
  activity: '/log/activity',
} as unknown as Record<LogType, Href>; // CAST: remove when every log route exists (step 4)

const CORE: LogType[] = ['feed', 'sleep', 'nappy'];
const MORE: LogType[] = ['pumping', 'solids', 'medicine', 'growth', 'bath', 'activity'];

/** V2-D01 Quick log sheet (`Sheet content/Quick log` in a Tall Bottom sheet): the one entry point for logging. */
export default function QuickLogSheet() {
  const { t } = useTranslation('log');
  const toast = useToast();
  const now = useNow();
  const { baby } = useCurrentBaby();
  const events = useBabyEvents(baby?.id);
  const { add, remove, timer, startTimer } = useLogStore();
  const [query, setQuery] = useState('');
  const name = baby?.name ?? '';

  const match = (type: LogType) => !query.trim() || t(`types.${type}`).toLowerCase().includes(query.trim().toLowerCase());
  const core = CORE.filter(match);
  const more = MORE.filter(match);

  const lastBottle = events.find((e) => e.type === 'feed' && e.bottle);
  const lastSleep = events.find((e) => e.type === 'sleep' && e.endAt);
  const prediction = useMemo(() => predictNextNap(events, baby?.birth_date ?? null, now), [events, baby, now]);
  const open = (type: LogType) => router.push(routes[type]);

  const repeatBottle = () => {
    if (!lastBottle?.bottle || !baby) return;
    const saved = add({ babyId: baby.id, type: 'feed', startAt: new Date().toISOString(), bottle: lastBottle.bottle, loggedBy: '' });
    router.back();
    toast.show({ message: t('saved.feed', { time: formatTime(saved.startAt) }), onUndo: () => remove(saved.id) });
  };
  const startNap = () => {
    if (!baby) return;
    startTimer('sleep', baby.id);
    router.replace('/log/sleep-timer' as Href);
  };

  return (
    <BottomSheet size="tall" title={t('quick.title')} subtitle={t('quick.subtitle', { name, time: formatTime(now) })} onClose={() => router.back()}>
      <SearchField label={t('quick.searchLabel')} value={query} onChangeText={setQuery} placeholder={t('quick.search')} />
      {core.length > 0 && (
        <View className="flex-row gap-sm">
          {core.map((type) => (
            <LogTile key={type} type={type} size="medium" label={t(`types.${type}`)} onPress={() => open(type)} onDetails={() => open(type)} />
          ))}
        </View>
      )}
      {more.length > 0 && (
        <View className="gap-lg">
          <Text variant="label-large" tone="secondary">
            {t('quick.more')}
          </Text>
          {[more.slice(0, 3), more.slice(3)].filter((row) => row.length).map((row, i) => (
            <View key={i} className="flex-row gap-sm">
              {row.map((type) => (
                <LogTile key={type} type={type} size="small" label={t(`types.${type}`)} onPress={() => open(type)} />
              ))}
              {/* Keep tiles one third wide when a filtered row is short. */}
              {Array.from({ length: 3 - row.length }, (_, k) => (
                <View key={`pad${k}`} className="flex-1" />
              ))}
            </View>
          ))}
        </View>
      )}
      {core.length + more.length === 0 && (
        <Text variant="body" tone="secondary">
          {t('quick.noMatch', { query })}
        </Text>
      )}
      {!query && (lastBottle?.bottle || (!timer && lastSleep)) && (
        <View className="gap-lg">
          <Text variant="label-large" tone="secondary">
            {t('quick.repeat')}
          </Text>
          <ListGroup>
            {lastBottle?.bottle && (
              <ListRow
                leading={<IconTile icon="bottle" tone="feed" />}
                title={t('quick.sameBottle')}
                subtitle={t('quick.sameBottleDetail', { amount: formatVolume(lastBottle.bottle.amountMl), milk: t(`milk.${lastBottle.bottle.milk}`), time: formatTime(lastBottle.startAt) })}
                trailing={{ kind: 'chevron' }}
                onPress={repeatBottle}
              />
            )}
            {!timer && lastSleep && (
              <ListRow
                leading={<IconTile icon="moon" tone="sleep" />}
                title={t('quick.startNap')}
                subtitle={
                  prediction.state === 'predicted'
                    ? t('quick.startNapDetailWindow', { awake: formatDuration(elapsedMs(lastSleep.endAt!, now)), time: formatTime(prediction.windowStart) })
                    : t('quick.startNapDetail', { awake: formatDuration(elapsedMs(lastSleep.endAt!, now)) })
                }
                trailing={{ kind: 'chevron' }}
                onPress={startNap}
              />
            )}
          </ListGroup>
        </View>
      )}
    </BottomSheet>
  );
}
