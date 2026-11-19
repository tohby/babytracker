import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { Mascot, type MascotPose } from '@/components/ui/mascot';
import { ScreenBackground } from '@/components/ui/screen-background';
import { Text } from '@/components/ui/text';

type AuthScreenProps = {
  /** App icon (forms) or a mascot pose (states like "short break", "check your email"). */
  hero?: 'icon' | MascotPose;
  title: string;
  subtitle?: string;
  /** Shows the back button (Figma `Button/Icon/Style=Glass`). */
  canGoBack?: boolean;
  /** Banner, fields and links between the title and the actions. */
  children?: ReactNode;
  /** Primary action and text buttons, kept at the bottom above the keyboard. */
  actions?: ReactNode;
};

/**
 * Shared layout for the V2 auth screens (A03–A08): back button, title block, content, full-width actions at the
 * bottom. Scrolls when the keyboard or long (German) text needs the room.
 */
export function AuthScreen({ hero = 'icon', title, subtitle, canGoBack = false, children, actions }: AuthScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation('common');

  return (
    <View className="flex-1">
      <ScreenBackground />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: top + 8, paddingBottom: bottom + 6 }}
          contentContainerClassName="px-page">
          <View className="h-[48px] flex-row items-center">
            {canGoBack ? <IconButton icon="back" label={t('actions.back')} onPress={() => router.back()} /> : null}
          </View>

          {/* V2 A03–A08: forms open on a left-aligned Title/Large + Body; state screens keep their panda. */}
          <View className="gap-xl pt-sm">
            {hero !== 'icon' && (
              <View className="items-center">
                <Mascot pose={hero} size={176} />
              </View>
            )}
            <View className="gap-sm">
              <Text variant="title-large" accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? (
                <Text variant="body" tone="secondary">
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="w-full gap-lg pt-xl">{children}</View>

          {/* Pushes the actions to the bottom when there's room; follows the content when there isn't. */}
          <View className="min-h-[24px] flex-1" />
          {/* Full-width actions, primary bottom edge 40 above the home indicator (Figma "Footer actions"). */}
          {actions ? <View className="w-full gap-sm">{actions}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
