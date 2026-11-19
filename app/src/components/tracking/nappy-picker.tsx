import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';

export type NappyKind = 'wet' | 'dirty' | 'both';

/** As in Figma: Wet = drop, Dirty = nappy, Both = check (see gaps list). */
const nappyIcon = { wet: 'drop', dirty: 'log-nappy', both: 'check' } as const;

/**
 * Figma `Nappy picker` (Selection): three large one-tap choices. Selected = mint fill + 2 pt strong border +
 * check (never colour alone). Labels come from the user's diaper/nappy wording setting.
 */
export function NappyPicker({ value, onChange, labels }: { value: NappyKind | null; onChange: (v: NappyKind) => void; labels: Record<NappyKind, string> }) {
  return (
    <View className="flex-row gap-sm" accessibilityRole="radiogroup">
      {(['wet', 'dirty', 'both'] as const).map((kind) => {
        const on = value === kind;
        return (
          <Pressable
            key={kind}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={labels[kind]}
            onPress={() => onChange(kind)}
            className={`min-h-[112px] flex-1 items-center justify-center gap-sm rounded-xl py-lg ${
              on ? 'border-2 border-feature-nappy-strong bg-feature-nappy' : 'border border-border-default bg-background-surface active:bg-state-pressed-surface'
            }`}>
            <IconTile icon={nappyIcon[kind]} tone={on ? 'surface' : 'nappy'} size="L" />
            <Text variant="label-large" numberOfLines={1}>
              {labels[kind]}
            </Text>
            {on && (
              <View className="absolute start-sm top-sm">
                <Icon name="check" size={16} tone="color/feature/nappy-strong" />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
