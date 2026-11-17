import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { AppIcon, Mascot, type MascotPose } from '@/components/ui/mascot';
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
 * Shared layout for the Sign in screens (Figma "Sign in" page): gradient, hero, title, content,
 * actions at the bottom. Scrolls when the keyboard or long (German) text needs the room.
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
          contentContainerStyle={{ flexGrow: 1, paddingTop: top + 8, paddingBottom: bottom + 16 }}
          contentContainerClassName="px-page">
          <View className="h-[48px] flex-row items-center">
            {canGoBack ? <IconButton icon="back" label={t('actions.back')} onPress={() => router.back()} /> : null}
          </View>

          <View className="items-center gap-lg pt-sm">
            {hero === 'icon' ? <AppIcon /> : <Mascot pose={hero} size={176} />}
            <View className="w-full items-center gap-sm">
              <Text variant="title" className="text-center" accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text className="text-center">{subtitle}</Text> : null}
            </View>
          </View>

          <View className="w-full gap-xl pt-xl">{children}</View>

          {/* Pushes the actions to the bottom when there's room; follows the content when there isn't. */}
          <View className="min-h-[24px] flex-1" />
          {actions ? <View className="w-full items-center gap-sm">{actions}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
