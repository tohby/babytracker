import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { logMeta, type LogType } from '@/constants/log-types';

/**
 * Figma `Timeline entry` (Type): time column, toned tile on a rail, what + details, value on the end.
 * `pendingSync` shows a cloud badge until the server confirms; unsynced data is never hidden.
 */
export function TimelineEntry({
  type,
  time,
  title,
  detail,
  value,
  pendingSync = false,
  showRail = true,
  onPress,
}: {
  type: LogType;
  time: string;
  title: string;
  detail?: string;
  value?: string;
  pendingSync?: boolean;
  showRail?: boolean;
  onPress?: () => void;
}) {
  const { t } = useTranslation('timeline');
  const meta = logMeta[type];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('entry.a11y', { time, title, detail: detail ?? '', value: value ?? '' })}
      accessibilityHint={pendingSync ? t('entry.pendingSync') : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="min-h-[72px] flex-row items-center gap-md rounded-md active:bg-state-pressed-surface">
      <Text variant="caption" tone="tertiary" numberOfLines={1} className="w-[52px]">
        {time}
      </Text>
      <View className="w-avatar-md items-center justify-center self-stretch">
        {showRail && <View className="absolute inset-y-0 w-[2px] bg-divider" />}
        <IconTile icon={meta.icon} tone={meta.tone} />
      </View>
      <View className="flex-1 gap-2xs py-md">
        <Text variant="subheading" numberOfLines={2}>
          {title}
        </Text>
        {!!detail && (
          <Text variant="body-small" tone="secondary" numberOfLines={2}>
            {detail}
          </Text>
        )}
      </View>
      {!!value && (
        <Text variant="label-large" tabular numberOfLines={1}>
          {value}
        </Text>
      )}
      {pendingSync && <Icon name="cloud-check" size={16} tone="color/icon/secondary" />}
    </Pressable>
  );
}
