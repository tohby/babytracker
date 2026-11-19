import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { IconTile } from '@/components/ui/icon-tile';
import { Mascot } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';
import { logMeta, type LogType } from '@/constants/log-types';
import { featureBg } from '@/constants/tones';

/**
 * Figma `Log tile` (Size × Type) for the quick-log grid.
 * - Large (Feed / Sleep / Nappy): mascot + label + a details arrow; 2-up.
 * - Medium: 3-up; the whole tile logs "now", long-press opens details.
 * - Small: secondary types on a surface tile with a toned Icon tile.
 */
export function LogTile({
  type,
  size,
  label,
  onPress,
  onDetails,
}: {
  type: LogType;
  size: 'large' | 'medium' | 'small';
  label: string;
  onPress: () => void;
  /** Large: the arrow button. Medium: long-press. */
  onDetails?: () => void;
}) {
  const { t } = useTranslation();
  const meta = logMeta[type];

  if (size === 'small') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className="min-h-[100px] flex-1 items-center justify-center gap-sm rounded-xl bg-background-surface px-sm py-md active:bg-state-pressed-surface">
        <IconTile icon={meta.icon} tone={meta.tone} size="L" />
        <Text variant="label-small" className="text-center" numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
    );
  }

  if (size === 'medium') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={t('a11y.logNowHint')}
        onPress={onPress}
        onLongPress={onDetails}
        className={`min-h-[124px] flex-1 items-center justify-between rounded-xl px-md pb-[14px] pt-[6px] active:opacity-90 ${featureBg[meta.tone]}`}>
        {meta.pose && <Mascot pose={meta.pose} size={70} />}
        <Text variant="subheading" numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`min-h-[150px] flex-1 justify-between rounded-2xl px-lg pb-[14px] pt-sm active:opacity-90 ${featureBg[meta.tone]}`}>
      {meta.pose && <Mascot pose={meta.pose} size={82} />}
      <View className="flex-row items-center justify-between gap-sm">
        <Text variant="heading" numberOfLines={1} className="flex-shrink">
          {label}
        </Text>
        {onDetails && <IconButton icon="arrow" size="small" label={t('a11y.moreDetails', { what: label })} onPress={onDetails} />}
      </View>
    </Pressable>
  );
}
