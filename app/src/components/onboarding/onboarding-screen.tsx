import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatRow } from '@/components/onboarding/chat-row';
import { Icon } from '@/components/ui/icon';
import { ScreenBackground } from '@/components/ui/screen-background';
import { Shadows } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type OnboardingScreenProps = {
  /** 0–1; hides the top bar when undefined (full-screen moments like the plan reveal). */
  progress?: number;
  /** Nappa's question in the speech bubble. */
  message?: string;
  children?: ReactNode;
  /** Primary action (and optional text button) at the bottom. */
  actions?: ReactNode;
  /** Centre the content vertically (openers, rewards). */
  centered?: boolean;
};

/**
 * Figma onboarding frame: back pill + progress track, Nappa's chat bubble, content, actions at the
 * bottom (above the keyboard).
 */
export function OnboardingScreen({ progress, message, children, actions, centered = false }: OnboardingScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const colors = useThemeColors();

  return (
    <View className="flex-1">
      <ScreenBackground />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: top + 4, paddingBottom: bottom + 16 }}>
          {progress !== undefined ? (
            <View className="h-[48px] flex-row items-center gap-lg px-page">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('actions.back')}
                onPress={() => router.back()}
                style={{ boxShadow: Shadows.glass }}
                className="size-[44px] items-center justify-center rounded-full border border-glass-stroke bg-glass-fill">
                <Icon name="back" color={colors['icon/primary']} size={22} />
              </Pressable>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
                className="h-[6px] flex-1 overflow-hidden rounded-full bg-lavender-100 me-[44px]">
                <View className="h-full rounded-full bg-accent-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
              </View>
            </View>
          ) : null}

          <View className={`flex-1 gap-2xl pt-lg ${centered ? 'justify-center' : ''}`}>
            {message ? (
              <View className="px-page">
                <ChatRow message={message} />
              </View>
            ) : null}
            <View className="gap-xl px-page">{children}</View>
          </View>

          {actions ? <View className="items-center gap-sm px-page pt-lg">{actions}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
