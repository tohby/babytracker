import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/** Type styles from Figma (Nappa/Caption, Nappa/Title, ...). */
const variantClasses = {
  caption: 'font-outfit-medium text-[12px] leading-[16px]',
  label: 'font-outfit-medium text-[14px] leading-[18px]',
  body: 'font-outfit-regular text-[16px] leading-[22px]',
  heading: 'font-outfit-semibold text-[20px] leading-[25px]',
  title: 'font-outfit-semibold text-[28px] leading-[34px] tracking-[-0.56px]',
  display: 'font-outfit-semibold text-[34px] leading-[41px] tracking-[-0.68px]',
  numeral: 'font-outfit-light text-[44px] leading-[44px] tracking-[-0.88px]',
  /** Figma `Nappa/Display` (56): the "Nappa" wordmark on the splash. */
  wordmark: 'font-outfit-semibold text-[56px] leading-[64px] tracking-[-1.12px]',
} as const;

/** Text colors (Figma role tokens). Kept separate from variants so the two never conflict. */
const toneClasses = {
  default: 'text-text-primary',
  muted: 'text-text-secondary',
  /** Captions on the pastel hero cards. */
  heroMuted: 'text-text-hero-muted',
  /** On saturated fills (avatar gradient); white in every theme. */
  inverse: 'text-static-white',
  accent: 'text-accent-primary',
  /** Labels on `accent/primary` (orange buttons). Dark plum in every theme for AA. */
  onAccent: 'text-text-on-accent-ink',
} as const;

export type TextVariant = keyof typeof variantClasses;
export type TextTone = keyof typeof toneClasses;

type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

export function Text({ variant = 'body', tone = 'default', className, ...props }: TextProps) {
  return (
    <RNText
      className={`${variantClasses[variant]} ${toneClasses[tone]} ${className ?? ''}`}
      {...props}
    />
  );
}
