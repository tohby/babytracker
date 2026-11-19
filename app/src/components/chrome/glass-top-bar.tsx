import { GlassView } from 'expo-glass-effect';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUniwind } from 'uniwind';

import { Icon, type IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { TopBar } from '@/components/ui/top-bar';
import { useLiquidGlass } from '@/hooks/use-liquid-glass';

/**
 * Figma `iOS/Glass icon button`: 44 pt Liquid Glass capsule with a 22 pt icon in primary ink, for controls that
 * float over a hero or scrolling content. Only rendered when glass is available.
 */
export function GlassIconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  const { theme } = useUniwind();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="size-touch-min">
      <GlassView glassEffectStyle="regular" isInteractive colorScheme={theme === 'dark' ? 'dark' : 'light'} style={{ flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} />
      </GlassView>
    </Pressable>
  );
}

/**
 * Figma `iOS/Top bar · glass`: back and action as glass buttons over a hero (Next nap, timers, onboarding,
 * paywall). Falls back to the solid V2 `Top bar` without Liquid Glass.
 */
export function HeroTopBar({ title, onBack, backIcon = 'back', action }: { title?: string; onBack?: () => void; backIcon?: 'back' | 'close'; action?: { icon: IconName; label: string; onPress: () => void } }) {
  const { t } = useTranslation();
  const glass = useLiquidGlass();
  if (!glass) {
    return (
      <TopBar
        title={title}
        onBack={onBack}
        backIcon={backIcon}
        action={action ? <IconButton icon={action.icon} label={action.label} onPress={action.onPress} /> : undefined}
      />
    );
  }
  return (
    <View className="h-[60px] flex-row items-center justify-between px-page">
      <View className="size-touch-min">{onBack && <GlassIconButton icon={backIcon} label={t(backIcon === 'back' ? 'actions.back' : 'actions.close')} onPress={onBack} />}</View>
      {!!title && (
        <Text variant="subheading" accessibilityRole="header" numberOfLines={1} className="flex-1 px-sm text-center">
          {title}
        </Text>
      )}
      <View className="size-touch-min">{action && <GlassIconButton {...action} />}</View>
    </View>
  );
}
