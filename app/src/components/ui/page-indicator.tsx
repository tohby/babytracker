import { View } from 'react-native';

/** Figma `Page indicator`: active step is a 20×8 pill, others 8×8 dots. Max 5 steps. */
export function PageIndicator({ count, active, label }: { count: number; active: number; label: string }) {
  return (
    <View className="flex-row items-center gap-sm" accessible accessibilityLabel={label}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          className={`h-sm rounded-full ${i === active ? 'w-[20px] bg-primary-default' : 'w-sm bg-border-strong'}`}
        />
      ))}
    </View>
  );
}
