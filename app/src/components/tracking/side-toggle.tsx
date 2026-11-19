import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';

export type Side = 'left' | 'right';

/**
 * Figma `Side toggle` (Active: Left / Right / None): which breast is running. Tap a side to start or switch;
 * the running side is teal and shows its time. `times` arrive formatted; an idle side shows "Start".
 */
export function SideToggle({ active, times, onSelect }: { active: Side | null; times: Record<Side, string | null>; onSelect: (side: Side) => void }) {
  const { t } = useTranslation('log');
  return (
    <View className="flex-row gap-md">
      {(['left', 'right'] as const).map((side) => {
        const on = active === side;
        return (
          <Pressable
            key={side}
            accessibilityRole="button"
            accessibilityLabel={t(side === 'left' ? 'nursing.leftSide' : 'nursing.rightSide')}
            accessibilityState={{ selected: on }}
            accessibilityValue={{ text: times[side] ?? t('nursing.start') }}
            onPress={() => onSelect(side)}
            className={`min-h-[92px] flex-1 items-center justify-center gap-xs rounded-xl py-lg ${
              on ? 'bg-primary-default' : 'border border-border-default bg-background-surface active:bg-state-pressed-surface'
            }`}>
            <Text variant="title-large" tone={on ? 'on-primary' : 'primary'}>
              {t(side === 'left' ? 'nursing.leftShort' : 'nursing.rightShort')}
            </Text>
            <Text variant="label-large" tone={on ? 'on-primary' : 'secondary'} tabular>
              {times[side] ?? t('nursing.start')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
