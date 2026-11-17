import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

/** The app's soft three-stop background (`bg/gradient-*`). Place first inside a full-screen view. */
export function ScreenBackground() {
  const colors = useThemeColors();
  return (
    <LinearGradient
      colors={[colors['bg/gradient-top'], colors['bg/gradient-mid'], colors['bg/gradient-bottom']]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}
