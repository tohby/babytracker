import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Shadows } from '@/constants/theme';

/** Frosted card that groups list rows (Figma Settings `Card`: `glass/fill`, `glass/stroke`, `Glass/Card` shadow). */
export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <View
      style={{ boxShadow: Shadows.glass }}
      className="overflow-hidden rounded-tile border border-glass-stroke bg-glass-fill">
      {children}
    </View>
  );
}
