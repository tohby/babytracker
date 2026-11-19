import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { V2ColorToken } from '@/constants/color-tokens';

export type StatusBannerType = 'error' | 'offline' | 'info' | 'locked';

const config: Record<StatusBannerType, { fill: string; icon: IconName; tone: V2ColorToken }> = {
  error: { fill: 'bg-status-error-subtle', icon: 'alert-circle', tone: 'color/status/error' },
  offline: { fill: 'bg-background-surface-muted', icon: 'wifi-off', tone: 'color/icon/secondary' },
  info: { fill: 'bg-status-info-subtle', icon: 'info', tone: 'color/status/info' },
  locked: { fill: 'bg-status-warning-subtle', icon: 'lock', tone: 'color/status/warning' },
};

/**
 * V2 `Banner` with a second line, for the auth flows that explain a problem in two parts (title + what to do).
 * Same fills, icons and tones as `Banner` (Type: Error / Offline / Info; Locked uses Warning).
 */
export function StatusBanner({ type, title, detail }: { type: StatusBannerType; title: string; detail?: string }) {
  const c = config[type];
  return (
    <View accessible accessibilityRole="alert" className={`w-full flex-row items-start gap-md rounded-lg px-lg py-md ${c.fill}`}>
      <Icon name={c.icon} size={20} tone={c.tone} />
      <View className="flex-1 gap-2xs">
        <Text variant="label-large">{title}</Text>
        {detail ? (
          <Text variant="body-small" tone="secondary">
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
