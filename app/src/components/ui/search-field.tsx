import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

/** Figma `Search field` (State): pill search; the clear button appears once there is text. */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  label,
  ...input
}: Omit<TextInputProps, 'style'> & { value: string; onChangeText: (text: string) => void; label: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const body = Typography['V2/Body/Regular'];
  return (
    <View
      className={`h-control-md flex-row items-center gap-sm rounded-full bg-background-surface pe-sm ps-lg ${
        focused ? 'border-2 border-border-focus' : 'border border-border-default'
      }`}>
      <Icon name="search" size={20} tone="color/icon/secondary" />
      <TextInput
        {...input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={label}
        placeholderTextColor={colors['color/text/tertiary']}
        selectionColor={colors['color/primary/default']}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        style={{ flex: 1, fontFamily: body.fontFamily, fontSize: body.fontSize, color: colors['color/text/primary'], paddingVertical: 0 }}
      />
      {!!value && <IconButton icon="close" label={t('actions.clear')} variant="ghost" size="small" onPress={() => onChangeText('')} />}
    </View>
  );
}
