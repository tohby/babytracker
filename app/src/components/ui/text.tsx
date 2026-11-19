import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { Typography, type TypographyStyle } from '@/constants/theme';

/** V2 text styles (Figma "V2/*"), by a short kebab-case name. Values live in `Typography`. */
const v2Variants = {
  'display-numeric': 'V2/Display/Numeric',
  'display-light': 'V2/Display/Light',
  'title-large': 'V2/Title/Large',
  'title-medium': 'V2/Title/Medium',
  heading: 'V2/Heading',
  subheading: 'V2/Subheading',
  body: 'V2/Body/Regular',
  'body-small': 'V2/Body/Small',
  'label-large': 'V2/Label/Large',
  'label-small': 'V2/Label/Small',
  caption: 'V2/Caption',
  'button-large': 'V2/Button/Large',
  'button-small': 'V2/Button/Small',
  'numeric-large': 'V2/Numeric/Large',
  'numeric-medium': 'V2/Numeric/Medium',
  'numeric-timer': 'V2/Numeric/Timer',
  'tab-label': 'V2/Tab label',
} as const satisfies Record<string, TypographyStyle>;

/** LEGACY (V1 "Nappa/*" styles). Remove with the V1 screens. */
const legacyVariants = {
  label: 'font-outfit-medium text-[14px] leading-[18px]',
  title: 'font-outfit-semibold text-[28px] leading-[34px] tracking-[-0.56px]',
  display: 'font-outfit-semibold text-[34px] leading-[41px] tracking-[-0.68px]',
  numeral: 'font-outfit-light text-[44px] leading-[44px] tracking-[-0.88px]',
  wordmark: 'font-outfit-semibold text-[56px] leading-[64px] tracking-[-1.12px]',
} as const;

/** Text colours: V2 `color/text/*` (and feature "strong" tones for labels on tinted cards). */
const toneClasses = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  disabled: 'text-text-disabled',
  'on-primary': 'text-text-on-primary',
  link: 'text-text-link',
  error: 'text-text-error',
  brand: 'text-primary-default',
  sleep: 'text-feature-sleep-strong',
  feed: 'text-feature-feed-strong',
  nappy: 'text-feature-nappy-strong',
  care: 'text-feature-care-strong',
  success: 'text-status-success',
  warning: 'text-status-warning',
  'secondary-on': 'text-secondary-on',
  'static-white': 'text-static-white',
  /** LEGACY tones (V1). */
  default: 'text-text-primary',
  muted: 'text-text-secondary',
  heroMuted: 'text-text-hero-muted',
  inverse: 'text-static-white',
  accent: 'text-accent-primary',
  onAccent: 'text-text-on-accent-ink',
  onInverse: 'text-text-on-accent',
} as const;

export type TextVariant = keyof typeof v2Variants | keyof typeof legacyVariants;
export type TextTone = keyof typeof toneClasses;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Tabular figures so ticking timers and times don't jitter. */
  tabular?: boolean;
};

export function Text({ variant = 'body', tone = 'primary', tabular, className, style, ...props }: TextProps) {
  const v2 = variant in v2Variants ? Typography[v2Variants[variant as keyof typeof v2Variants]] : undefined;
  const legacy = v2 ? '' : legacyVariants[variant as keyof typeof legacyVariants];
  return (
    <RNText
      className={`${legacy} ${toneClasses[tone]} ${className ?? ''}`}
      style={[v2, tabular && { fontVariant: ['tabular-nums'] }, style]}
      {...props}
    />
  );
}
