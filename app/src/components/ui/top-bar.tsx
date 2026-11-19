import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';

/**
 * Figma `Top bar` (solid V2): back on the start, optional centred title, optional action on the end. 64 high.
 * Over a hero or scrolling content on iOS 26 use `GlassTopBar` instead (chrome/glass-top-bar).
 */
export function TopBar({
  title,
  onBack,
  backIcon = 'back',
  action,
}: {
  title?: string;
  onBack?: () => void;
  /** `close` for modal flows. */
  backIcon?: 'back' | 'close';
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View className="h-[64px] flex-row items-center justify-between px-page">
      <View className="size-control-md">
        {onBack && <IconButton icon={backIcon} label={t(backIcon === 'back' ? 'actions.back' : 'actions.close')} onPress={onBack} />}
      </View>
      {!!title && (
        <Text variant="subheading" accessibilityRole="header" numberOfLines={1} className="flex-1 px-sm text-center">
          {title}
        </Text>
      )}
      <View className="size-control-md items-end">{action}</View>
    </View>
  );
}
