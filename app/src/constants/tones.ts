import type { V2ColorToken } from '@/constants/color-tokens';

/**
 * Feature tones (fixed): Sleep = sky, Feed = lilac, Nappy = mint, Care = pink. Teal (`primary`) is the only
 * action colour. Classes are written out in full so Uniwind can see them.
 */
export type FeatureTone = 'sleep' | 'feed' | 'nappy' | 'care';

export const featureBg: Record<FeatureTone, string> = {
  sleep: 'bg-feature-sleep',
  feed: 'bg-feature-feed',
  nappy: 'bg-feature-nappy',
  care: 'bg-feature-care',
};

export const featureStrongBg: Record<FeatureTone, string> = {
  sleep: 'bg-feature-sleep-strong',
  feed: 'bg-feature-feed-strong',
  nappy: 'bg-feature-nappy-strong',
  care: 'bg-feature-care-strong',
};

export const featureToken: Record<FeatureTone, V2ColorToken> = {
  sleep: 'color/feature/sleep',
  feed: 'color/feature/feed',
  nappy: 'color/feature/nappy',
  care: 'color/feature/care',
};

export const featureStrongToken: Record<FeatureTone, V2ColorToken> = {
  sleep: 'color/feature/sleep-strong',
  feed: 'color/feature/feed-strong',
  nappy: 'color/feature/nappy-strong',
  care: 'color/feature/care-strong',
};
