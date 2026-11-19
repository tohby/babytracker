import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroTopBar } from '@/components/chrome/glass-top-bar';
import { useTabBarInset } from '@/components/chrome/tab-bar-inset';
import { Hero } from '@/components/ui/hero';
import type { IconName } from '@/components/ui/icon';
import type { MascotPose } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';
import { TopBar } from '@/components/ui/top-bar';
import type { FeatureTone } from '@/constants/tones';

/** Tab screens (Today, Timeline, Insights, Family): canvas, 8 top, 20 sides, 20 between blocks, clears the bar. */
export function TabScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarInset();
  return (
    <ScrollView
      className="flex-1 bg-background-canvas"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-page px-page"
      // iOS adds the safe-area top inset itself ("automatic", which also clears native tab bars); Android doesn't.
      contentContainerStyle={{ paddingTop: (Platform.OS === 'ios' ? 0 : insets.top) + 8, paddingBottom: bottom }}>
      {children}
    </ScrollView>
  );
}

/**
 * Pushed screens: V2 Top bar, scrolling content (8 top, 40 bottom) and optional pinned footer actions
 * (Figma "Footer actions": primary bottom edge 40 above the home indicator).
 */
export function StackScreen({
  title,
  onBack = () => router.back(),
  backIcon,
  action,
  footer,
  children,
  gap = 'gap-page',
}: {
  title?: string;
  onBack?: (() => void) | null;
  backIcon?: 'back' | 'close';
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  gap?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background-canvas" style={{ paddingTop: insets.top }}>
      <TopBar title={title} onBack={onBack ?? undefined} backIcon={backIcon} action={action} />
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerClassName={`${gap} px-page pt-sm`} contentContainerStyle={{ paddingBottom: footer ? 24 : 40 + insets.bottom }}>
        {children}
      </ScrollView>
      {footer && (
        <View className="gap-sm px-page pt-md" style={{ paddingBottom: Math.max(insets.bottom, 16) + 6 }}>
          {footer}
        </View>
      )}
    </View>
  );
}

/**
 * Screens that open on a Figma `Hero`: the hero runs under the status bar, the glass (or solid) top bar floats on
 * it, and the hero title sits at its bottom start. Content follows on canvas.
 */
export function HeroScreen({
  tone,
  mascot,
  heroHeight = 360,
  title,
  titleVariant = 'display-light',
  subtitle,
  onBack = () => router.back(),
  backIcon,
  action,
  footer,
  children,
}: {
  tone: FeatureTone;
  mascot?: MascotPose;
  heroHeight?: number;
  title?: string;
  titleVariant?: 'display-light' | 'title-large';
  subtitle?: string;
  onBack?: (() => void) | null;
  backIcon?: 'back' | 'close';
  action?: { icon: IconName; label: string; onPress: () => void };
  footer?: ReactNode;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background-canvas">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: footer ? 24 : 40 + insets.bottom }}>
        <Hero tone={tone} mascot={mascot} height={heroHeight}>
          <View style={{ paddingTop: insets.top }}>
            <HeroTopBar onBack={onBack ?? undefined} backIcon={backIcon} action={action} />
          </View>
          {(title || subtitle) && (
            <View className="absolute bottom-xl start-page end-[170px] gap-xs">
              {!!title && (
                <Text variant={titleVariant} accessibilityRole="header">
                  {title}
                </Text>
              )}
              {!!subtitle && <Text variant="body">{subtitle}</Text>}
            </View>
          )}
        </Hero>
        <View className="gap-page px-page pt-lg">{children}</View>
      </ScrollView>
      {footer && (
        <View className="gap-sm px-page pt-md" style={{ paddingBottom: Math.max(insets.bottom, 16) + 6 }}>
          {footer}
        </View>
      )}
    </View>
  );
}
