import type { ImageSource } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

/**
 * Figma `Family member row` (Status: Active / Pending): caregiver with role badge and "last active", or a
 * pending invite with Resend. Status dot = active in the last 5 minutes.
 */
export function FamilyMemberRow(
  props:
    | { status: 'active'; name: string; detail: string; role: string; photo?: ImageSource; initials: string; online?: boolean; onPress?: () => void }
    | { status: 'pending'; email: string; detail: string; initials: string; resendLabel: string; onResend: () => void },
) {
  const row = 'min-h-[72px] flex-row items-center gap-md p-md';
  if (props.status === 'pending') {
    return (
      <View className={row}>
        <Avatar size="M" initials={props.initials} tone="muted" />
        <View className="flex-1 gap-2xs">
          <Text variant="subheading" numberOfLines={1}>
            {props.email}
          </Text>
          <Text variant="body-small" tone="secondary">
            {props.detail}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={props.onResend} hitSlop={12}>
          <Text variant="button-small" tone="link">
            {props.resendLabel}
          </Text>
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable accessibilityRole={props.onPress ? 'button' : undefined} disabled={!props.onPress} onPress={props.onPress} className={`${row} rounded-md active:bg-state-pressed-surface`}>
      <Avatar size="M" photo={props.photo} initials={props.initials} tone="surface" statusDot={props.online} />
      <View className="flex-1 gap-2xs">
        <Text variant="subheading" numberOfLines={1}>
          {props.name}
        </Text>
        <Text variant="body-small" tone="secondary">
          {props.detail}
        </Text>
      </View>
      <Badge label={props.role} tone="brand" />
    </Pressable>
  );
}
