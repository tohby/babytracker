import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { SelectionControl } from '@/components/ui/selection-control';
import { Text } from '@/components/ui/text';
import { useElevation } from '@/hooks/use-elevation';

type Trailing =
  | { kind: 'chevron' }
  | { kind: 'value'; value: string }
  | { kind: 'toggle'; checked: boolean }
  | { kind: 'radio'; checked: boolean }
  | { kind: 'none' }
  | { kind: 'custom'; node: ReactNode };

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Figma `Leading` slot: an Icon tile or Avatar. */
  leading?: ReactNode;
  /** Figma `Trailing`: Chevron, Value, Selection control or None. */
  trailing?: Trailing;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
  /** Title colour, e.g. the destructive "Delete account" row. */
  titleTone?: 'primary' | 'error';
};

/** Figma `List row` (Trailing). Min height 64 (one line) / 72 (two); the whole row is the tap target. */
export function ListRow({ title, subtitle, leading, trailing = { kind: 'none' }, onPress, disabled, accessibilityHint, titleTone = 'primary' }: ListRowProps) {
  const content = (
    <>
      {leading}
      <View className="flex-1 gap-2xs">
        <Text variant="subheading" tone={disabled ? 'disabled' : titleTone} numberOfLines={2}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="body-small" tone="secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing.kind === 'value' && (
        <Text variant="body" tone="secondary" numberOfLines={1} className="max-w-[45%]">
          {trailing.value}
        </Text>
      )}
      {(trailing.kind === 'chevron' || trailing.kind === 'value') && <Icon name="chevron-right" size={20} tone="color/icon/secondary" />}
      {(trailing.kind === 'toggle' || trailing.kind === 'radio') &&
        <SelectionControl type={trailing.kind} checked={trailing.checked} disabled={disabled} />}
      {trailing.kind === 'custom' && trailing.node}
    </>
  );
  const classes = `flex-row items-center gap-md rounded-md p-md ${subtitle ? 'min-h-[72px]' : 'min-h-[64px]'}`;
  if (!onPress) return <View className={classes}>{content}</View>;
  return (
    <Pressable
      accessibilityRole={trailing.kind === 'toggle' ? 'switch' : trailing.kind === 'radio' ? 'radio' : 'button'}
      accessibilityState={trailing.kind === 'toggle' || trailing.kind === 'radio' ? { checked: trailing.checked, disabled } : { disabled }}
      accessibilityValue={trailing.kind === 'value' ? { text: trailing.value } : undefined}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      className={`${classes} active:bg-state-pressed-surface`}>
      {content}
    </Pressable>
  );
}

/** Figma `List group`: rows on a surface card (padding 8, radius xl) with inset dividers between them. */
export function ListGroup({ children, insetDividers = true }: { children: ReactNode; insetDividers?: boolean }) {
  const shadow = useElevation('card');
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={{ boxShadow: shadow }} className="rounded-xl bg-background-surface p-sm">
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 && <Divider inset={insetDividers} />}
          {row}
        </Fragment>
      ))}
    </View>
  );
}
