import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type HeroCardProps = {
  gradient: Pick<ComponentProps<typeof LinearGradient>, 'colors' | 'locations' | 'start' | 'end'>;
  width: number;
  children: ReactNode;
};

/** Tall rounded card with a gradient background. Content goes inside. */
export function HeroCard({ gradient, width, children }: HeroCardProps) {
  return (
    <View style={{ width }} className="h-[206px] overflow-hidden rounded-card">
      <LinearGradient {...gradient} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}
