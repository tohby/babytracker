import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type ChoiceTileProps = {
  label: string;
  description?: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
  multiple?: boolean;
  iconClassName?: string;
};

export function ChoiceTile({
  label, description, icon, selected, onPress, compact = false, multiple = false, iconClassName,
}: ChoiceTileProps) {
  const marker = multiple
    ? selected ? 'rounded-[7px] border-primary-default bg-primary-default' : 'rounded-[7px] border-border-strong'
    : selected ? 'rounded-full border-primary-default' : 'rounded-full border-border-strong';

  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`px-lg ${compact ? 'min-h-[72px] flex-row items-center gap-md rounded-xl py-md' : 'min-h-[130px] flex-1 gap-md rounded-lg py-lg'} ${selected ? 'border-2 border-primary-default bg-background-surface' : compact ? 'border border-border-default bg-background-surface' : 'border border-border-default bg-background-surface-muted'}`}>
      <View className={compact ? '' : 'flex-row items-center justify-between'}>
        <View className={`items-center justify-center ${compact ? 'size-[40px] rounded-sm' : 'size-[44px] rounded-md'} ${iconClassName ?? (compact ? 'bg-background-surface-muted' : 'bg-background-surface')}`}>
          <Icon name={icon} size={compact ? 20 : 24} />
        </View>
        {!compact && <View className="size-[44px] items-center justify-center">
          <View className={`size-[24px] items-center justify-center border-2 bg-background-surface ${marker}`}>
            {selected && <View className="size-[12px] rounded-full bg-primary-default" />}
          </View>
        </View>}
      </View>
      <View className={`gap-xs ${compact ? 'flex-1' : ''}`}>
        <Text variant="label-large">{label}</Text>
        {description && <Text variant={compact ? 'body-small' : 'caption'} tone="secondary">{description}</Text>}
      </View>
      {compact && <View className="size-[44px] items-center justify-center">
        <View className={`size-[24px] items-center justify-center border-2 ${marker}`}>
          {selected && <Icon name="check" size={16} tone="color/icon/on-primary" />}
        </View>
      </View>}
    </Pressable>
  );
}
