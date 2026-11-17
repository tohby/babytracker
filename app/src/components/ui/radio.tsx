import { View } from 'react-native';

/** 24px radio indicator (Figma `Control/Radio`). Visual only: the pressable parent carries the radio role. */
export function Radio({ selected }: { selected: boolean }) {
  return (
    <View
      className={`size-[24px] items-center justify-center rounded-full border-2 bg-white ${selected ? 'border-orange-500' : 'border-plum-200'}`}>
      {selected && <View className="size-[12px] rounded-full bg-orange-500" />}
    </View>
  );
}
