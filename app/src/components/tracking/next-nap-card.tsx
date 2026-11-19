import { Pressable, View } from 'react-native';

import { ProgressBar } from '@/components/charts/progress-bar';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Mascot, type MascotPose } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

type NextNapCardProps =
  | { state: 'predicted'; countdown: string; time: string; window: string }
  | { state: 'learning'; title: string; body: string; progress: number; progressLabel: string; chip: string }
  | { state: 'too-young'; title: string; body: string; chip: string };

const art: Record<NextNapCardProps['state'], { pose: MascotPose; fill: string }> = {
  predicted: { pose: 'sleeping', fill: 'bg-feature-sleep' },
  learning: { pose: 'thinking', fill: 'bg-feature-sleep' },
  'too-young': { pose: 'waving', fill: 'bg-feature-care' },
};

/**
 * Figma `Next nap card` (State): Predicted (window start in Display/Numeric, end time, countdown chip),
 * Learning (honest about why there's no prediction yet) or Too young (under 8 weeks: sleepy cues instead).
 * Tapping opens the Next nap screen with the "why".
 */
export function NextNapCard(props: NextNapCardProps & { onPress?: () => void; accessibilityLabel: string }) {
  const shadow = useElevation('card');
  const a = art[props.state];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
      onPress={props.onPress}
      disabled={!props.onPress}
      style={{ boxShadow: shadow }}
      className="flex-row items-center gap-md rounded-2xl bg-background-surface py-page pe-md ps-page active:opacity-90">
      <View className="flex-1 gap-sm">
        {props.state === 'predicted' ? (
          <>
            <Chip label={props.countdown} variant="sleep" size="small" />
            <Text variant="display-numeric" tabular numberOfLines={1} adjustsFontSizeToFit>
              {props.time}
            </Text>
            <View className="flex-row items-center gap-xs">
              <Icon name="clock" size={16} tone="color/icon/secondary" />
              <Text variant="body-small" tone="secondary" className="flex-shrink">
                {props.window}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Chip label={props.chip} variant={props.state === 'learning' ? 'neutral' : 'care'} size="small" />
            <Text variant="heading">{props.title}</Text>
            <Text variant="body-small" tone="secondary">
              {props.body}
            </Text>
            {props.state === 'learning' && <ProgressBar value={props.progress} tone="sleep" label={props.progressLabel} />}
          </>
        )}
      </View>
      <View className={`size-[104px] items-center justify-center overflow-hidden rounded-full ${a.fill}`}>
        <Mascot pose={a.pose} size={91} />
      </View>
    </Pressable>
  );
}
