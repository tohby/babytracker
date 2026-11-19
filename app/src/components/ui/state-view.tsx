import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Mascot, type MascotPose } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';

export type StateKind = 'empty' | 'error' | 'offline';

const art: Record<StateKind, { pose: MascotPose; fill: string }> = {
  empty: { pose: 'standing', fill: 'bg-feature-sleep' },
  error: { pose: 'fussy', fill: 'bg-feature-care' },
  offline: { pose: 'sleeping', fill: 'bg-background-surface-muted' },
};

/**
 * Figma `State` (Kind × Size): mascot + one-line title + one sentence + one action. Every list and chart has
 * one. Full = centred card; Compact = sits inside a card with a text action.
 */
export function StateView({
  kind,
  size = 'full',
  title,
  body,
  action,
  onAction,
  pose,
}: {
  kind: StateKind;
  size?: 'full' | 'compact';
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  /** Override the default pose for the kind (e.g. Learning uses thinking). */
  pose?: MascotPose;
}) {
  const a = art[kind];
  if (size === 'compact') {
    return (
      <View className="flex-row items-center gap-md rounded-2xl bg-background-surface p-xl">
        <View className={`size-[72px] items-center justify-center overflow-hidden rounded-full ${a.fill}`}>
          <Mascot pose={pose ?? a.pose} size={62} />
        </View>
        <View className="flex-1 gap-xs">
          <Text variant="subheading">{title}</Text>
          <Text variant="body-small" tone="secondary">
            {body}
          </Text>
          {action && onAction && (
            <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12} className="self-start">
              <Text variant="button-small" tone="link">
                {action}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }
  return (
    <View className="items-center gap-lg rounded-2xl bg-background-surface p-xl">
      <View className={`size-[140px] items-center justify-center overflow-hidden rounded-full ${a.fill}`}>
        <Mascot pose={pose ?? a.pose} size={120} />
      </View>
      <View className="gap-xs self-stretch">
        <Text variant="title-medium" className="text-center" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body-small" tone="secondary" className="text-center">
          {body}
        </Text>
      </View>
      {action && onAction && <Button label={action} size="medium" hierarchy={kind === 'error' ? 'secondary' : 'primary'} onPress={onAction} />}
    </View>
  );
}
