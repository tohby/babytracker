import { View } from 'react-native';

import { Text, type TextTone } from '@/components/ui/text';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

const fill: Record<BadgeTone, string> = {
  neutral: 'bg-background-surface-muted',
  brand: 'bg-primary-subtle',
  success: 'bg-status-success-subtle',
  warning: 'bg-status-warning-subtle',
  error: 'bg-status-error-subtle',
  info: 'bg-status-info-subtle',
};

const ink: Record<BadgeTone, TextTone> = {
  neutral: 'secondary',
  brand: 'link',
  success: 'success',
  warning: 'warning',
  error: 'status-error',
  info: 'info',
};

/** Figma `Badge` (Tone). Non-interactive status label, height 22; colour always paired with a word. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View className={`flex-row items-center self-start gap-xs rounded-full px-sm py-2xs ${fill[tone]}`}>
      <Text variant="label-small" tone={ink[tone]}>
        {label}
      </Text>
    </View>
  );
}

/** Figma `Badge/Dot`: 10 pt unread dot with a 2 pt ring in the surface colour. */
export function BadgeDot({ large = false, className = '' }: { large?: boolean; className?: string }) {
  return (
    <View
      className={`rounded-full border-2 border-background-surface bg-accent-notification ${large ? 'size-[14px]' : 'size-[10px]'} ${className}`}
    />
  );
}
