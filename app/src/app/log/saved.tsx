import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/icon-tile';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { durationMs } from '@/data/log-events';
import { useLogStore } from '@/data/log-store';
import { formatDuration, formatTime } from '@/lib/format';
import { napNumber } from '@/lib/log-summary';

/** V2-D04 Nap saved (`Sheet content/Nap saved`, compact) with the "Nap saved · time" toast and Undo on top. */
export default function NapSavedSheet() {
  const { t } = useTranslation('log');
  const { t: tc } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { name, events } = useLogContext();
  const { remove } = useLogStore();
  const toast = useToast();
  const nap = events.find((e) => e.id === id);

  useEffect(() => {
    if (!nap?.endAt) return;
    toast.show({ message: t('saved.nap', { time: formatTime(nap.endAt) }), position: 'top', onUndo: () => { remove(nap.id); router.back(); } });
    // Once per opened sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nap?.id]);

  if (!nap) return null;
  const dur = durationMs(nap) ?? 0;
  const n = napNumber(events, nap);
  const others = events.filter((e) => e.type === 'sleep' && e.id !== nap.id && e.endAt).map((e) => durationMs(e)!).filter((d) => d < 4 * 3_600_000);
  const avg = others.length ? others.reduce((a, b) => a + b, 0) / others.length : null;
  const compare = avg === null ? t('savedSheet.napOf', { n }) : dur > avg * 1.1 ? t('savedSheet.longer', { n }) : dur < avg * 0.9 ? t('savedSheet.shorter', { n }) : t('savedSheet.usual', { n });
  return (
    <BottomSheet
      title={t('savedSheet.title')}
      subtitle={t('savedSheet.subtitle', { range: tc('units.range', { start: formatTime(nap.startAt), end: formatTime(nap.endAt!) }) })}
      onClose={() => router.back()}
      actions={<Button label={t('savedSheet.done')} onPress={() => router.back()} />}>
      <View className="items-center gap-xs">
        {/* Figma uses the Nappy tone here; the sleep tone is used instead (see gaps list). */}
        <IconTile icon="moon" tone="sleep" size="L" />
        <Text variant="title-large" className="text-center">
          {t('savedSheet.slept', { name, duration: formatDuration(dur, 'short') })}
        </Text>
        <Text variant="body-small" tone="secondary" className="text-center">
          {compare}
        </Text>
      </View>
      <ListGroup>
        <ListRow title={t('nap.fellAsleep')} trailing={{ kind: 'custom', node: <Text tone="secondary">{formatTime(nap.startAt)}</Text> }} />
        <ListRow title={t('nap.wokeUp')} trailing={{ kind: 'custom', node: <Text tone="secondary">{formatTime(nap.endAt!)}</Text> }} />
        <ListRow title={t('savedSheet.loggedBy')} trailing={{ kind: 'custom', node: <Text tone="secondary">{nap.loggedBy}</Text> }} />
      </ListGroup>
    </BottomSheet>
  );
}
