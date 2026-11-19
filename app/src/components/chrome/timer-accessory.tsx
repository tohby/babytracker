import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { timerElapsedMs } from '@/data/log-events';
import { useLogStore } from '@/data/log-store';
import { useCurrentBaby } from '@/hooks/use-current-baby';
import { useNow } from '@/hooks/use-now';
import { formatTimer } from '@/lib/format';

/** Route of the full timer screen for the running kind. */
export function timerRoute(kind: 'sleep' | 'nursing' | 'pumping'): Href {
  return (kind === 'sleep' ? '/log/sleep-timer' : kind === 'nursing' ? '/log/nursing' : '/log/pumping') as Href;
}

/** Label + elapsed time for whatever timer is running, ticking every second. */
export function useRunningTimer() {
  const { t } = useTranslation('log');
  const { timer } = useLogStore();
  const { baby } = useCurrentBaby();
  const now = useNow(1000);
  if (!timer) return null;
  const name = baby?.name ?? '';
  const label =
    timer.kind === 'sleep'
      ? t('timer.accessorySleep', { name })
      : timer.kind === 'nursing'
        ? t(timer.side === 'right' ? 'timer.accessoryNursingRight' : 'timer.accessoryNursingLeft')
        : t('timer.accessoryPumping');
  return { timer, label, elapsed: formatTimer(timerElapsedMs(timer, now)) };
}

/**
 * Figma `iOS/Tab bar accessory`: the running timer on every tab (iOS 26 bottom accessory, like a mini player).
 * The system draws the glass capsule, so this is content only (one glass layer, never stacked).
 * Tap opens the timer; the button stops and saves.
 */
export function TimerAccessory() {
  const { t } = useTranslation('log');
  const running = useRunningTimer();
  const { stopTimer } = useLogStore();
  if (!running) return null;
  const { timer, label, elapsed } = running;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timer.openRunning', { label, elapsed })}
      onPress={() => router.push(timerRoute(timer.kind))}
      className="h-[52px] flex-row items-center gap-md pe-[6px] ps-sm">
      <IconTile px={36} icon={timer.kind === 'sleep' ? 'moon' : timer.kind === 'nursing' ? 'log-nursing' : 'log-pump'} tone={timer.kind === 'sleep' ? 'sleep' : 'feed'} />
      <View className="flex-1">
        <Text variant="label-small" tone="secondary" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="subheading" tabular>
          {elapsed}
        </Text>
      </View>
      <IconButton icon="close" variant="primary" size="small" label={t('timer.stopAndSave')} onPress={() => stopTimer()} />
    </Pressable>
  );
}
