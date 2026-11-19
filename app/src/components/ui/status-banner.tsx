import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ResolvedColors } from '@/constants/color-tokens';
import { Shadows } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type ThemeColorName = keyof ResolvedColors;

export type StatusBannerType = 'error' | 'offline' | 'info' | 'locked';

const config: Record<StatusBannerType, { icon: IconName; iconColor: ThemeColorName; border: string }> = {
  error: { icon: 'alert-circle', iconColor: 'danger/500', border: 'border-[1.5px] border-danger-500' },
  offline: { icon: 'wifi-off', iconColor: 'color/icon/primary', border: 'border border-glass-stroke' },
  info: { icon: 'info', iconColor: 'lavender/500', border: 'border border-glass-stroke' },
  locked: { icon: 'lock', iconColor: 'accent/primary', border: 'border border-glass-stroke' },
};

type StatusBannerProps = {
  type: StatusBannerType;
  title: string;
  detail?: string;
};

/**
 * Inline alert on glass (Figma `Error banner`). Text stays `text/primary` so it passes AA on glass;
 * the type is carried by the icon and, for errors, a danger border.
 */
export function StatusBanner({ type, title, detail }: StatusBannerProps) {
  const colors = useThemeColors();
  const { icon, iconColor, border } = config[type];
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={detail ? `${title}. ${detail}` : title}
      style={{ boxShadow: Shadows.glass }}
      className={`w-full flex-row items-start gap-md rounded-tile bg-glass-fill px-lg py-md ${border}`}>
      <View className="size-[36px] items-center justify-center rounded-full bg-white">
        <Icon name={icon} color={colors[iconColor]} size={20} />
      </View>
      <View className="flex-1 gap-xs">
        <Text variant="label">{title}</Text>
        {detail ? <Text variant="caption">{detail}</Text> : null}
      </View>
    </View>
  );
}
