import { forwardRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

type TextFieldProps = Omit<TextInputProps, 'style' | 'editable'> & {
  label: string;
  leadingIcon?: IconName;
  /** Shows the eye toggle and hides the text until it's tapped. */
  secure?: boolean;
  /** Red border and message (Figma `Input field / State=Error`). */
  error?: string;
  /** Red border only, when a banner above explains the problem (wrong password). */
  invalid?: boolean;
  /** Helper text under the field when there's no error. */
  hint?: string;
  disabled?: boolean;
};

/**
 * Figma `Input field`: 56pt pill on `white`, `plum/200` border; 2pt `text/primary` border when focused,
 * 2pt `danger/500` with an alert message on error, `cream/50` when disabled.
 */
export type TextFieldRef = ComponentRef<typeof TextInput>;

export const TextField = forwardRef<TextFieldRef, TextFieldProps>(function TextField(
  { label, leadingIcon, secure = false, error, invalid = false, hint, disabled = false, onFocus, onBlur, ...input },
  ref,
) {
  const { t } = useTranslation('auth');
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const border = error || invalid
    ? 'border-2 border-danger-500'
    : focused
      ? 'border-2 border-text-primary'
      : 'border border-plum-200';
  const message = error ?? hint;

  return (
    <View className="w-full gap-sm">
      <Text variant="label" tone={disabled ? 'muted' : 'default'}>
        {label}
      </Text>
      <View
        className={`h-[56px] flex-row items-center gap-sm rounded-full px-lg ${disabled ? 'bg-cream-50' : 'bg-white'} ${border}`}>
        {leadingIcon ? <Icon name={leadingIcon} color={colors['color/icon/primary']} /> : null}
        <TextInput
          ref={ref}
          {...input}
          accessibilityLabel={label}
          accessibilityHint={message}
          editable={!disabled}
          secureTextEntry={secure && !revealed}
          placeholderTextColor={colors['color/text/secondary']}
          selectionColor={colors['accent/primary']}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`h-full flex-1 font-outfit-regular text-[16px] ${disabled ? 'text-text-secondary' : 'text-text-primary'}`}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? t('fields.hidePassword') : t('fields.showPassword')}
            onPress={() => setRevealed((r) => !r)}
            hitSlop={12}
            className="size-[44px] items-center justify-center -me-sm">
            <Icon name={revealed ? 'eye-off' : 'eye'} color={colors['color/icon/primary']} />
          </Pressable>
        ) : null}
      </View>
      {message ? (
        <View className="flex-row items-start gap-xs">
          {error ? <Icon name="alert-circle" color={colors['danger/500']} size={16} /> : null}
          <Text variant="caption" tone={error ? 'default' : 'muted'} className="flex-1">
            {message}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
