import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

/** Soft opacity pulse shared by every bone (the "shimmer in code" the design system asks for). */
function usePulse() {
  const [value] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(value, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [value]);
  return value;
}

function Bone({ className }: { className: string }) {
  return <View className={`bg-state-disabled ${className}`} />;
}

/**
 * Figma `Skeleton` (Card / Row / Tiles). Mirrors the real layout so nothing jumps. Shown after 400 ms; fall back
 * to the error State if loading takes more than a few seconds.
 */
export function Skeleton({ type }: { type: 'card' | 'row' | 'tiles' }) {
  const opacity = usePulse();
  let body;
  if (type === 'card') {
    body = (
      <View className="gap-md rounded-2xl bg-background-surface p-page">
        <Bone className="h-xl w-[110px] rounded-sm" />
        <Bone className="h-[40px] w-[180px] rounded-[10px]" />
        <Bone className="h-[14px] w-[220px] max-w-full rounded-[6px]" />
      </View>
    );
  } else if (type === 'row') {
    body = (
      <View className="flex-row items-center gap-md p-md">
        <Bone className="size-avatar-md rounded-sm" />
        <View className="flex-1 gap-sm">
          <Bone className="h-[14px] w-[160px] max-w-full rounded-[6px]" />
          <Bone className="h-md w-[220px] max-w-full rounded-[6px]" />
        </View>
      </View>
    );
  } else {
    body = (
      <View className="flex-row gap-sm">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-[128px] flex-1 rounded-xl" />
        ))}
      </View>
    );
  }
  return (
    <Animated.View style={{ opacity }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {body}
    </Animated.View>
  );
}
