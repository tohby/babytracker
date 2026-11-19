import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { V2ColorToken } from '@/constants/color-tokens';

export type BannerType = 'info' | 'success' | 'warning' | 'error' | 'offline';

const config: Record<BannerType, { fill: string; icon: IconName; tone: V2ColorToken }> = {
  info: { fill: 'bg-status-info-subtle', icon: 'info', tone: 'color/status/info' },
  success: { fill: 'bg-status-success-subtle', icon: 'check', tone: 'color/status/success' },
  warning: { fill: 'bg-status-warning-subtle', icon: 'alert-circle', tone: 'color/status/warning' },
  error: { fill: 'bg-status-error-subtle', icon: 'alert-circle', tone: 'color/status/error' },
  offline: { fill: 'bg-background-surface-muted', icon: 'wifi-off', tone: 'color/icon/secondary' },
};

/**
 * Figma `Banner` (Type): inline, persistent status. Icon + one sentence + optional action. Offline is
 * reassuring ("saved on this phone"), never alarming.
 */
export function Banner({ type, message, action, onAction }: { type: BannerType; message: string; action?: string; onAction?: () => void }) {
  const c = config[type];
  return (
    <View
      accessibilityRole={type === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      className={`min-h-[56px] flex-row items-center gap-md rounded-lg px-lg py-md ${c.fill}`}>
      <Icon name={c.icon} size={20} tone={c.tone} />
      <Text variant="body-small" className="flex-1">
        {message}
      </Text>
      {action && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12}>
          <Text variant="button-small" tone="link">
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
