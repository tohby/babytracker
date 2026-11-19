import { View } from 'react-native';

/** Figma `Divider`. Inset aligns with text after a 40 pt leading tile (68 from the row start). */
export function Divider({ inset = false }: { inset?: boolean }) {
  return (
    <View className={inset ? 'ps-[68px]' : ''}>
      <View className="h-px bg-divider" />
    </View>
  );
}
