import { Pressable, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

/**
 * Figma `Tooltip` (Placement). One-time hint: ink bubble (`text/primary`), surface-coloured text, max width 240,
 * dismissed by a tap. Never the only place essential information lives.
 */
export function Tooltip({ text, placement = 'above', onDismiss }: { text: string; placement?: 'above' | 'below'; onDismiss: () => void }) {
  const colors = useThemeColors();
  const arrow = (
    <Svg width={16} height={8} style={{ alignSelf: 'center' }}>
      <Polygon
        points={placement === 'above' ? '0,0 16,0 8,8' : '0,8 16,8 8,0'}
        fill={colors['color/text/primary']}
      />
    </Svg>
  );
  return (
    <Pressable accessibilityRole="button" accessibilityHint={text} onPress={onDismiss} className="max-w-[240px]">
      {placement === 'below' && arrow}
      <View className="rounded-sm bg-text-primary px-md py-sm">
        <Text variant="body-small" tone="inverse">
          {text}
        </Text>
      </View>
      {placement === 'above' && arrow}
    </Pressable>
  );
}
