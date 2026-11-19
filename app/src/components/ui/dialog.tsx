import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/icon-tile';
import type { IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

/**
 * Figma `Dialog` (Tone). Only for decisions that can't be undone or need consent. Title says what happens,
 * body the consequence; buttons are verbs. Destructive is red and never pre-selected; Cancel is always there.
 */
export function Dialog({
  visible,
  tone = 'default',
  icon,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirming = false,
}: {
  visible: boolean;
  tone?: 'default' | 'destructive';
  /** Figma `Show icon`. */
  icon?: IconName;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}) {
  const shadow = useElevation('overlay');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View className="flex-1 items-center justify-center px-page">
        {/* Scrim: color/background/scrim at 40%, as on sheets. Tapping it cancels. */}
        <Pressable accessibilityElementsHidden onPress={onCancel} className="absolute inset-0 bg-background-scrim opacity-40" />
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={{ boxShadow: shadow }}
          className="w-full max-w-[320px] items-center gap-lg rounded-2xl bg-background-surface-raised p-xl">
          {icon && <IconTile icon={icon} tone={tone === 'destructive' ? 'error' : 'brand'} size="L" />}
          <Text variant="title-medium" className="text-center">
            {title}
          </Text>
          <Text variant="body-small" tone="secondary" className="text-center">
            {body}
          </Text>
          <View className="gap-sm self-stretch">
            <Button
              label={confirmLabel}
              hierarchy={tone === 'destructive' ? 'destructive' : 'primary'}
              size="medium"
              loading={confirming}
              onPress={onConfirm}
            />
            <Button label={cancelLabel} hierarchy="tertiary" size="medium" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
