import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useElevation } from '@/hooks/use-elevation';

export type SelectionType = 'toggle' | 'checkbox' | 'radio';

type SelectionControlProps = {
  /** Figma `Type`: Toggle = instant on/off; Checkbox = pick many; Radio = pick one. */
  type: SelectionType;
  checked: boolean;
  disabled?: boolean;
  /**
   * Standalone control: pass `onChange` and `label`. Inside a List row / Option card the whole row is the
   * target, so leave both out and the control is purely visual.
   */
  onChange?: (checked: boolean) => void;
  label?: string;
};

/** Figma `Selection control` (Type × Checked × Enabled): a 44 pt hit area with the visual centred. */
export function SelectionControl({ type, checked, disabled = false, onChange, label }: SelectionControlProps) {
  const thumbShadow = useElevation('card');
  let visual;
  if (type === 'toggle') {
    const track = disabled ? 'bg-state-disabled' : checked ? 'bg-primary-default' : 'bg-border-strong';
    visual = (
      <View className={`h-[32px] w-[52px] flex-row items-center rounded-full px-[3px] ${checked ? 'justify-end' : 'justify-start'} ${track}`}>
        <View
          style={{ boxShadow: thumbShadow }}
          className={`size-[26px] rounded-full ${disabled ? 'bg-background-surface-muted' : 'bg-static-white'}`}
        />
      </View>
    );
  } else if (type === 'checkbox') {
    const box = disabled
      ? `bg-state-disabled ${checked ? '' : 'border-2 border-border-default'}`
      : checked
        ? 'bg-primary-default'
        : 'border-2 border-border-strong bg-background-surface';
    visual = (
      // Figma radius 7 (no matching radius token; see gaps list).
      <View className={`size-icon-lg items-center justify-center rounded-[7px] ${box}`}>
        {checked && <Icon name="check" size={18} tone={disabled ? 'color/icon/disabled' : 'color/icon/on-primary'} />}
      </View>
    );
  } else {
    const ring = disabled
      ? 'bg-state-disabled border-2 border-border-default'
      : checked
        ? 'border-2 border-primary-default bg-background-surface'
        : 'border-2 border-border-strong bg-background-surface';
    visual = (
      <View className={`size-icon-lg items-center justify-center rounded-full ${ring}`}>
        {checked && <View className={`size-md rounded-full ${disabled ? 'bg-icon-disabled' : 'bg-primary-default'}`} />}
      </View>
    );
  }

  const box = `items-center justify-center ${type === 'toggle' ? 'h-touch-min w-[52px]' : 'size-touch-min'}`;
  if (!onChange) return <View className={box}>{visual}</View>;
  return (
    <Pressable
      accessibilityRole={type === 'toggle' ? 'switch' : type}
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(type === 'radio' ? true : !checked)}
      className={box}>
      {visual}
    </Pressable>
  );
}
