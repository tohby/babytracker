import type { ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

/**
 * Figma `Header` (Type). Home: avatar + greeting (eyebrow) above the family title, bell on the end.
 * Large title: title with a one-line subtitle under it, for the top-level tabs. Text comes in translated.
 */
export function Header({
  type,
  title,
  eyebrow,
  avatar,
  action,
}: {
  type: 'home' | 'large-title';
  title: string;
  /** Home: the greeting above the title. Large title: the subtitle under it. */
  eyebrow?: string;
  /** Home only. */
  avatar?: { photo?: ImageSource; initials?: string };
  /** Figma `Show action`: usually a Surface Icon button. */
  action?: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between gap-md">
      <View className="flex-1 gap-2xs">
        {type === 'home' ? (
          <>
            <View className="flex-row items-center gap-sm">
              {avatar && <Avatar size="S" photo={avatar.photo} initials={avatar.initials} tone="surface" />}
              {!!eyebrow && (
                <Text variant="body" tone="secondary" className="flex-shrink">
                  {eyebrow}
                </Text>
              )}
            </View>
            <Text variant="title-large" accessibilityRole="header">
              {title}
            </Text>
          </>
        ) : (
          <>
            <Text variant="title-large" accessibilityRole="header">
              {title}
            </Text>
            {!!eyebrow && (
              <Text variant="body" tone="secondary">
                {eyebrow}
              </Text>
            )}
          </>
        )}
      </View>
      {action}
    </View>
  );
}
