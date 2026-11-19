import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';

/** Figma `Sync status` (Synced / Syncing / Offline): small, always-honest indicator in headers. */
export function SyncStatus({ state, label }: { state: 'synced' | 'syncing' | 'offline'; label: string }) {
  return (
    <View accessible accessibilityLabel={label} className="h-[28px] flex-row items-center gap-xs self-start rounded-full bg-background-surface px-sm">
      {state === 'synced' && <Icon name="cloud-check" size={16} tone="color/status/success" />}
      {state === 'syncing' && <Spinner />}
      {state === 'offline' && <Icon name="wifi-off" size={16} tone="color/icon/secondary" />}
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
