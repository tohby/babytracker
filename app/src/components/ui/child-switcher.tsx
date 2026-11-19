import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { FeatureTone } from '@/constants/tones';
import { useElevation } from '@/hooks/use-elevation';

type Child = { name: string; initials: string; tone: FeatureTone };

/** Figma `Child switcher` (Children: One / Twins). Shown when a family has more than one child; opens a sheet. */
export function ChildSwitcher({ kids, name, onPress }: { kids: Child[]; name: string; onPress: () => void }) {
  const { t } = useTranslation();
  const shadow = useElevation('card');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('a11y.switchChild', { name })}
      onPress={onPress}
      style={{ boxShadow: shadow }}
      className="h-control-md flex-row items-center gap-sm self-start rounded-full bg-background-surface pe-lg ps-xs active:bg-state-pressed-surface">
      <View className="flex-row">
        {kids.map((child, i) => (
          <View key={child.name} className={i > 0 ? '-ms-[10px]' : ''}>
            <Avatar size="M" initials={child.initials} tone={child.tone} />
          </View>
        ))}
      </View>
      <Text variant="subheading" numberOfLines={1} className="flex-shrink">
        {name}
      </Text>
      <Icon name="chevron-down" size={20} tone="color/icon/secondary" />
    </Pressable>
  );
}
