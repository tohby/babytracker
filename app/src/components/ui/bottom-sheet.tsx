import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';

/**
 * Figma `Bottom sheet` (Size × Content slot): the body of every sheet route. The route itself is presented as a
 * native form sheet (see `sheetOptions` in the root layout), which supplies the grabber, the radius-2xl top
 * corners, the scrim and swipe-to-dismiss.
 *
 * - Compact: fits its content (quick actions).
 * - Tall: up to 92% of the screen; content scrolls and the actions stay pinned.
 */
export function BottomSheet({
  title,
  subtitle,
  onClose,
  size = 'compact',
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  size?: 'compact' | 'tall';
  /** Figma `Content` slot: one of the `Sheet content/*` bodies. */
  children: ReactNode;
  /** Figma `Show actions`: a primary Button and optionally a Tertiary one. */
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Figma: 10 top (under the grabber), 20 sides, 34 bottom (home indicator).
  const bottom = Math.max(insets.bottom, 34);
  const header = (
    <View className="flex-row items-start gap-md">
      <View className="flex-1 gap-2xs">
        <Text variant="title-medium" accessibilityRole="header">
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="body-small" tone="secondary">
            {subtitle}
          </Text>
        )}
      </View>
      <IconButton icon="close" label={t('actions.close')} variant="ghost" size="small" onPress={onClose} />
    </View>
  );

  if (size === 'tall') {
    return (
      <View className="flex-1 bg-background-surface-raised">
        <View className="px-page pt-xl">{header}</View>
        <ScrollView contentContainerClassName="gap-page px-page pt-page pb-xl" keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {actions && (
          <View className="gap-sm px-page pt-md" style={{ paddingBottom: bottom }}>
            {actions}
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="gap-page bg-background-surface-raised px-page pt-xl" style={{ paddingBottom: bottom }}>
      {header}
      {children}
      {actions && <View className="gap-sm">{actions}</View>}
    </View>
  );
}
