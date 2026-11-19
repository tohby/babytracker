import { StyleSheet, View } from 'react-native';

/** V2 screens sit on the flat `background/canvas` (V1's gradient and glow are retired). */
export function ScreenBackground() {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill} className="bg-background-canvas" />;
}
