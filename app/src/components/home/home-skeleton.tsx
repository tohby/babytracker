import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Shadows } from '@/constants/theme';

/** Grey placeholder bar. */
export function Bar({ className }: { className: string }) {
  return <View className={`rounded-full bg-lavender-100 ${className}`} />;
}

/** Figma M1-21 "Home · loading skeleton": shapes of the cards while the baby loads. */
export function HomeSkeleton() {
  const { t } = useTranslation('home');
  return (
    <View className="gap-xl" accessible accessibilityLabel={t('sinceLast.restoring')} accessibilityState={{ busy: true }}>
      <View style={{ boxShadow: Shadows.glass, height: 170 }} className="rounded-card border border-glass-stroke bg-glass-fill" />
      <View className="gap-md">
        <View className="flex-row items-center justify-between">
          <Text variant="heading">{t('sinceLast.heading')}</Text>
          <View className="flex-row items-center gap-sm">
            <View className="size-[8px] rounded-full bg-mint-400" />
            <Text variant="caption" tone="muted">
              {t('sinceLast.restoring')}
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-md">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{ boxShadow: Shadows.glass }}
              className="min-h-[128px] grow basis-[48%] gap-md rounded-tile border border-glass-stroke bg-glass-fill p-lg">
              <Bar className="h-[10px] w-[60px]" />
              <Bar className="h-[28px] w-[90px]" />
              <Bar className="h-[10px] w-[110px]" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
