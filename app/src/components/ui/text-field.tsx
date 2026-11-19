import { forwardRef, useState, type ComponentRef } from 'react';
import { Pressable, TextInput, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Field } from '@/components/ui/field';
import { Icon, type IconName } from '@/components/ui/icon';

type TextFieldProps = Omit<TextInputProps, 'style' | 'editable'> & {
  label: string;
  leadingIcon?: IconName;
  /** Password: hides the text with a show/hide toggle. */
  secure?: boolean;
  error?: string;
  /** Red border only, when a banner above explains the problem. */
  invalid?: boolean;
  hint?: string;
  disabled?: boolean;
};

export type TextFieldRef = ComponentRef<typeof TextInput>;

/**
 * The auth forms' text input: the V2 `Field` (Type=Text) plus a show/hide control for passwords. The V2 icon set
 * has only `eye`, so the toggle's state is carried by its label (see gaps list).
 */
export const TextField = forwardRef<TextFieldRef, TextFieldProps>(function TextField({ secure = false, hint, ...props }, ref) {
  const { t } = useTranslation('auth');
  const [revealed, setRevealed] = useState(false);
  return (
    <Field
      ref={ref}
      {...props}
      helper={hint}
      secureTextEntry={secure && !revealed}
      trailing={
        secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(revealed ? 'fields.hidePassword' : 'fields.showPassword')}
            hitSlop={12}
            onPress={() => setRevealed((r) => !r)}>
            <Icon name="eye" size={20} tone={revealed ? 'color/primary/default' : 'color/icon/secondary'} />
          </Pressable>
        ) : undefined
      }
    />
  );
});
