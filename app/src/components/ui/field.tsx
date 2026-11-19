import { forwardRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type FieldBase = {
  /** Always visible above the field (placeholders alone fail screen readers). */
  label: string;
  /** Helper line under the field. Replaced by `error` when there is one. */
  helper?: string;
  /** Error message: red border + icon + text, never colour alone. */
  error?: string;
  disabled?: boolean;
  leadingIcon?: IconName;
  /** Extra control at the end of a text field (e.g. show password). */
  trailing?: ReactNode;
};

type TextFieldProps = FieldBase &
  Omit<TextInputProps, 'editable' | 'style'> & {
    type?: 'text';
  };

type SelectFieldProps = FieldBase & {
  type: 'select';
  /** Shown value; `placeholder` when empty. */
  value?: string;
  placeholder?: string;
  /** Opens a sheet or the native picker. */
  onPress: () => void;
};

export type FieldProps = TextFieldProps | SelectFieldProps;

/**
 * Figma `Field` (Type × State): Text input or Select. 56 high, radius md, surface on canvas.
 * Focused = 2 pt `border/focus`; Error = 2 pt `border/error` + message; Disabled = `state/disabled` fill.
 */
export const Field = forwardRef<ComponentRef<typeof TextInput>, FieldProps>(function Field(props, ref) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const { label, helper, error, disabled = false, leadingIcon, trailing } = props;

  const border = error
    ? 'border-2 border-border-error'
    : focused
      ? 'border-2 border-border-focus'
      : 'border border-border-default';
  // Keep the content still when the border thickens: hairline 1 + 15 = strong 2 + 14.
  const padding = error || focused ? 'px-[15px]' : 'px-lg';
  const box = `h-control-lg flex-row items-center gap-md rounded-md ${padding} ${border} ${
    disabled ? 'bg-state-disabled' : 'bg-background-surface'
  }`;

  let control: ReactNode;
  if (props.type === 'select') {
    const { value, placeholder, onPress } = props;
    control = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value ?? placeholder }}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className={box}>
        {leadingIcon && <Icon name={leadingIcon} size={20} tone="color/icon/secondary" />}
        <Text variant="body" tone={disabled ? 'disabled' : value ? 'primary' : 'tertiary'} className="flex-1" numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={20} tone="color/icon/secondary" />
      </Pressable>
    );
  } else {
    const { type: _type, onFocus, onBlur, value, onChangeText, ...input } = props;
    void _type;
    const body = Typography['V2/Body/Regular'];
    control = (
      <View className={box}>
        {leadingIcon && <Icon name={leadingIcon} size={20} tone="color/icon/secondary" />}
        <TextInput
          ref={ref}
          {...input}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          placeholderTextColor={colors['color/text/tertiary']}
          selectionColor={colors['color/primary/default']}
          cursorColor={colors['color/primary/default']}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            color: disabled ? colors['color/text/disabled'] : colors['color/text/primary'],
            paddingVertical: 0,
          }}
        />
        {focused && !!value && !trailing && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('actions.clear')}
            onPress={() => onChangeText?.('')}
            hitSlop={12}>
            <Icon name="close" size={20} tone="color/icon/secondary" />
          </Pressable>
        )}
        {trailing}
      </View>
    );
  }

  const message = error ?? helper;
  return (
    <View className="gap-sm">
      <Text variant="label-large" tone={disabled ? 'disabled' : 'primary'}>
        {label}
      </Text>
      {control}
      {!!message && (
        <View className="flex-row items-start gap-xs">
          {error && <Icon name="alert-circle" size={16} tone="color/text/error" />}
          <Text variant="caption" tone={error ? 'error' : 'secondary'} className="flex-1" accessibilityLiveRegion={error ? 'polite' : 'none'}>
            {message}
          </Text>
        </View>
      )}
    </View>
  );
});
