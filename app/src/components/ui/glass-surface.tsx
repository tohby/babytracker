import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ComponentRef, ReactNode, RefObject } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUniwind } from 'uniwind';

import { useReduceTransparency } from '@/hooks/use-reduce-transparency';

/** Apple's Liquid Glass (iOS 26+). Checked once: the answer can't change while the app runs. */
const hasLiquidGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

type GlassSurfaceProps = {
  children: ReactNode;
  /** Corner radius in px. Passed as a number because the native glass views don't read classes. */
  radius: number;
  /** Layout classes (size, padding, flex). Colour comes from the glass. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  /**
   * Android only: the view behind this surface to blur (wrap it in `BlurTargetView`).
   * Without it Android shows the tinted fill with no blur.
   */
  blurTarget?: RefObject<ComponentRef<typeof View> | null>;
};

/**
 * Frosted glass panel (Figma effect style `Glass/Pill`: background blur plus `glass/nav-fill` and `glass/stroke`).
 *
 * - iOS 26+: native Liquid Glass.
 * - Older iOS and Android 12+: a real background blur with the Nappa glass tint and border on top.
 * - "Reduce Transparency" on: a solid surface, as Apple's guidelines ask.
 */
export function GlassSurface({ children, radius, className = '', style, blurTarget }: GlassSurfaceProps) {
  const { theme } = useUniwind();
  const reduceTransparency = useReduceTransparency();
  const isDark = theme === 'dark';
  const shape = { borderRadius: radius };

  let background: ReactNode;
  if (reduceTransparency) {
    background = <View style={[StyleSheet.absoluteFill, shape]} className="border border-glass-stroke bg-cream-50" />;
  } else if (hasLiquidGlass) {
    background = (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, shape]}
      />
    );
  } else {
    background = (
      <View style={[StyleSheet.absoluteFill, shape]} className="overflow-hidden border border-glass-stroke">
        <BlurView
          intensity={40}
          tint={isDark ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <View style={StyleSheet.absoluteFill} className="bg-glass-nav-fill" />
      </View>
    );
  }

  return (
    <View style={[shape, style]} className={className}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {background}
      </View>
      {children}
    </View>
  );
}
