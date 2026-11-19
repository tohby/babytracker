import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/**
 * Figma `Timer card` (Kind: Sleep / Nursing / Pumping × State: Running / Paused). Big tabular timer, start time,
 * Pause/Resume (secondary) and Stop & save (primary). Paused dims the timer and shows a warning badge.
 * Nursing passes the Side toggle as `children`.
 */
export function TimerCard({
  kind,
  paused,
  title,
  started,
  elapsed,
  elapsedLabel,
  onPauseResume,
  onStop,
  children,
}: {
  kind: 'sleep' | 'nursing' | 'pumping';
  paused: boolean;
  title: string;
  started: string;
  elapsed: string;
  /** Spoken form of the elapsed time ("42 minutes, 10 seconds"). */
  elapsedLabel: string;
  onPauseResume: () => void;
  onStop: () => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation('log');
  const shadow = useElevation('card');
  return (
    <View style={{ boxShadow: shadow }} className="gap-lg rounded-2xl bg-background-surface p-page">
      <View className="flex-row items-center gap-md">
        <IconTile icon={kind === 'sleep' ? 'moon' : kind === 'nursing' ? 'log-nursing' : 'log-pump'} tone={kind === 'sleep' ? 'sleep' : 'feed'} />
        <View className="flex-1 gap-2xs">
          <Text variant="subheading">{title}</Text>
          <Text variant="body-small" tone="secondary">
            {started}
          </Text>
        </View>
        <Badge label={paused ? t('timer.paused') : t('timer.running')} tone={paused ? 'warning' : 'success'} />
      </View>
      <Text
        variant="numeric-timer"
        tone={paused ? 'tertiary' : 'primary'}
        tabular
        accessibilityLabel={elapsedLabel}
        accessibilityRole="timer"
        numberOfLines={1}
        adjustsFontSizeToFit>
        {elapsed}
      </Text>
      {children}
      <View className="flex-row gap-sm">
        <Button className="flex-1" label={paused ? t('timer.resume') : t('timer.pause')} hierarchy="secondary" size="medium" onPress={onPauseResume} />
        <Button className="flex-1" label={t('timer.stopAndSave')} size="medium" onPress={onStop} />
      </View>
    </View>
  );
}
