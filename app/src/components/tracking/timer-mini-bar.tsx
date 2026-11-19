import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/**
 * Figma `Timer mini bar` (Kind: Sleep / Nursing): the running timer on every tab, docked above the bottom nav
 * (the solid fallback; iOS 26 uses the glass tab-bar accessory). Tap opens the timer; the button stops and saves.
 */
export function TimerMiniBar({ kind, label, elapsed, onOpen, onStop }: { kind: 'sleep' | 'nursing'; label: string; elapsed: string; onOpen: () => void; onStop: () => void }) {
  const { t } = useTranslation('log');
  const shadow = useElevation('floating');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timer.openRunning', { label, elapsed })}
      onPress={onOpen}
      style={{ boxShadow: shadow }}
      className={`h-[64px] flex-row items-center gap-md rounded-full py-sm pe-sm ps-[10px] ${kind === 'sleep' ? 'bg-feature-sleep' : 'bg-feature-feed'}`}>
      <IconTile icon={kind === 'sleep' ? 'moon' : 'log-nursing'} tone="surface" round />
      <View className="flex-1 gap-2xs">
        <Text variant="label-small" tone="secondary" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="numeric-medium" tabular>
          {elapsed}
        </Text>
      </View>
      {/* Figma uses Icon/close on this stop button (see gaps list). */}
      <IconButton icon="close" variant="primary" label={t('timer.stopAndSave')} onPress={onStop} />
    </Pressable>
  );
}
