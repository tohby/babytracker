import { useEffect, useRef, type ComponentRef, type ReactNode } from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { Text } from '@/components/ui/text';
import { Elevation } from '@/constants/theme';

export const WHEEL_ITEM_HEIGHT = 44;
const VISIBLE = 5;

export type WheelItem<T> = { value: T; label: string };

type WheelPickerProps<T> = {
  items: WheelItem<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Flex weight of this column inside a WheelGroup. */
  flex?: number;
};

/**
 * One scrolling column (Figma birthday / wake time / weight wheels). Snaps to rows; the middle row
 * is the value. Screen readers get an adjustable control: swipe up / down to change it.
 */
export function WheelPicker<T>({ items, value, onChange, accessibilityLabel, flex = 1 }: WheelPickerProps<T>) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const index = Math.max(0, items.findIndex((item) => item.value === value));
  const lastScrolled = useRef(index);

  // Follow outside changes (unit switch, a day that no longer exists in the month).
  useEffect(() => {
    if (lastScrolled.current !== index) {
      scroll.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated: false });
      lastScrolled.current = index;
    }
  }, [index]);

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.min(items.length - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT)));
    lastScrolled.current = next;
    if (items[next] && items[next].value !== value) onChange(items[next].value);
  };

  const step = (delta: number) => {
    const next = items[Math.min(items.length - 1, Math.max(0, index + delta))];
    if (next) onChange(next.value);
  };

  return (
    <View
      style={{ flex, height: WHEEL_ITEM_HEIGHT * VISIBLE }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[index]?.label }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}>
      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: index * WHEEL_ITEM_HEIGHT }}
        contentContainerStyle={{ paddingVertical: WHEEL_ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={(e) => {
          // A slow drag that stops without momentum still has to settle.
          if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.y) < 0.05) settle(e);
        }}>
        {items.map((item, i) => {
          const distance = Math.abs(i - index);
          return (
            <View key={String(item.value)} style={{ height: WHEEL_ITEM_HEIGHT }} className="items-center justify-center">
              <Text
                variant={distance === 0 ? 'title-large' : 'heading'}
                tone={distance === 0 ? 'primary' : 'secondary'}
                style={{ opacity: distance === 0 ? 1 : distance === 1 ? 0.7 : 0.4 }}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Columns side by side over the glass band that marks the selected row. */
export function WheelGroup({ children }: { children: ReactNode }) {
  return (
    <View style={{ height: WHEEL_ITEM_HEIGHT * VISIBLE }} className="w-full justify-center">
      <View
        pointerEvents="none"
        style={{ boxShadow: Elevation.card, height: WHEEL_ITEM_HEIGHT + 8 }}
        className="absolute inset-x-0 rounded-full border border-border-default bg-background-surface"
      />
      <View className="flex-row px-lg">{children}</View>
    </View>
  );
}
