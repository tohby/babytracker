import { View } from 'react-native';

import { featureStrongBg } from '@/constants/tones';

/**
 * Figma `Mini bars` (Tone): 7-day sparkline inside cards. Decorative: the number it supports is always in text,
 * so it's hidden from screen readers. The last bar (today) is teal; earlier days use the tone at 45%.
 */
export function MiniBars({ values, tone }: { values: number[]; tone: 'sleep' | 'feed' | 'nappy' }) {
  const max = Math.max(1, ...values);
  return (
    <View className="h-[30px] flex-row items-end gap-xs" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {values.map((v, i) => {
        const today = i === values.length - 1;
        return (
          <View
            key={i}
            style={{ height: Math.max(4, (v / max) * 30) }}
            className={`w-sm rounded-[4px] ${today ? 'bg-primary-default' : `${featureStrongBg[tone]} opacity-45`}`}
          />
        );
      })}
    </View>
  );
}
