import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function FlowLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
      <Text className="text-center" variant="button-small" tone="link">{label}</Text>
    </Pressable>
  );
}

export function FlowScreen({ children, footer, onBack, topAction, progress }: {
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  topAction?: ReactNode;
  progress?: number;
}) {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation('common');
  return (
    <KeyboardAvoidingView className="flex-1 bg-background-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-page"
        contentContainerStyle={{ flexGrow: 1, paddingTop: top + 2, paddingBottom: bottom + 12 }}>
        <View className="min-h-[50px] flex-row items-center justify-between">
          {onBack ? <Pressable accessibilityRole="button" accessibilityLabel={t('actions.back')} onPress={onBack} className="size-[48px] items-center justify-center">
            <Icon name="back" size={20} />
          </Pressable> : <View />}
          {topAction}
        </View>
        {progress !== undefined && (
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 5, now: progress }} className="mb-xl mt-md h-[8px] overflow-hidden rounded-full bg-state-selected">
            <View className="h-full rounded-full bg-primary-default" style={{ width: `${progress * 20}%` }} />
          </View>
        )}
        {children}
        {footer && <>
          <View className="min-h-[24px] flex-1" />
          <View className="gap-md">{footer}</View>
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function FlowTitle({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <View className="gap-sm">
      {badge && <Text variant="caption" tone="secondary" className="tracking-widest">{badge}</Text>}
      <Text accessibilityRole="header" variant="title-large">{title}</Text>
      <Text variant="body-small" tone="secondary">{subtitle}</Text>
    </View>
  );
}

export function FlowNotice({ children, warning = false, error = false, icon }: {
  children: string;
  warning?: boolean;
  error?: boolean;
  icon?: IconName;
}) {
  return (
    <View className={`flex-row items-start gap-sm rounded-lg ${error ? '' : 'px-md py-md'} ${warning ? 'bg-status-warning-subtle' : error ? '' : 'bg-background-surface-muted'}`} accessibilityLiveRegion="polite">
      <Icon name={icon ?? (error ? 'alert-circle' : 'info')} size={18} tone={error ? 'color/status/error' : warning ? 'color/status/warning' : 'color/icon/secondary'} />
      <Text className="flex-1" variant={error ? 'body-small' : 'caption'} tone={error ? 'error' : 'secondary'}>{children}</Text>
    </View>
  );
}
