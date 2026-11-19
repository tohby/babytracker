import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useThemeColors } from '@/hooks/use-theme-colors';

type SpinnerProps = {
  /** Figma `Size`: Small 20 (buttons), Large 32 (cards, screens). */
  size?: 'small' | 'large';
  /** Figma `Tone`: Brand (primary) or On colour (white, on primary/destructive fills). */
  tone?: 'brand' | 'on-colour';
};

/** Figma `Spinner`: 20% track + 225° arc, rotating 360° every 900 ms. */
export function Spinner({ size = 'small', tone = 'brand' }: SpinnerProps) {
  const colors = useThemeColors();
  const [spin] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const px = size === 'small' ? 20 : 32;
  // Figma ellipse innerRadius 0.78: ring thickness is 11% of the diameter.
  const stroke = px * 0.11;
  const r = (px - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const color = tone === 'brand' ? colors['color/primary/default'] : colors['color/static/white'];
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{ width: px, height: px, transform: [{ rotate }] }}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}>
      <Svg width={px} height={px}>
        <Circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeOpacity={0.2} strokeWidth={stroke} fill="none" />
        <Circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * (225 / 360)} ${circumference}`}
          transform={`rotate(-90 ${px / 2} ${px / 2})`}
        />
      </Svg>
    </Animated.View>
  );
}
