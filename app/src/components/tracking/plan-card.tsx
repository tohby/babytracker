import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { SelectionControl } from '@/components/ui/selection-control';
import { Text } from '@/components/ui/text';

/**
 * Figma `Plan card` (Selected): price per period in full, trial terms in plain words, no fake urgency.
 * Selected = 2 pt teal border + radio.
 */
export function PlanCard({ plan, terms, badge, selected, onPress }: { plan: string; terms: string; badge?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`min-h-[88px] flex-row items-center gap-sm rounded-xl bg-background-surface ${
        selected ? 'border-2 border-primary-default px-[11px] py-[15px]' : 'border border-border-default px-md py-lg'
      }`}>
      <SelectionControl type="radio" checked={selected} />
      <View className="flex-1 gap-2xs">
        <Text variant="subheading">{plan}</Text>
        <Text variant="body-small" tone="secondary">
          {terms}
        </Text>
      </View>
      {badge && <Badge label={badge} tone="success" />}
    </Pressable>
  );
}

/** Figma `Perk row`: one benefit line on the paywall. */
export function PerkRow({ text }: { text: string }) {
  return (
    <View className="min-h-[40px] flex-row items-center gap-md">
      <View className="size-[28px] items-center justify-center rounded-full bg-status-success-subtle">
        <Icon name="check" size={16} tone="color/status/success" />
      </View>
      <Text variant="body" className="flex-1">
        {text}
      </Text>
    </View>
  );
}
