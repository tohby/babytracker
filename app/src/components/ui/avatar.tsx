import { Image, type ImageSource } from 'expo-image';
import { View } from 'react-native';

import { BadgeDot } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { featureBg, type FeatureTone } from '@/constants/tones';

export type AvatarSize = 'S' | 'M' | 'L' | 'XL';

type AvatarProps = {
  /** Photo when available; otherwise initials on a tone. */
  photo?: ImageSource;
  initials?: string;
  /** Each child keeps one feature tone everywhere. `surface`/`muted` for caregivers and pending invites. */
  tone?: FeatureTone | 'surface' | 'muted';
  /** Figma `Size`: S 32 (lists, headers), M 40 (rows), L 56 (cards), XL 80 (baby profile). */
  size?: AvatarSize;
  /** Figma `Status dot`: caregiver active in the last 5 minutes. */
  statusDot?: boolean;
  /** Spoken name; omit when a visible name sits next to the avatar. */
  label?: string;
};

const box: Record<AvatarSize, string> = {
  S: 'size-avatar-sm',
  M: 'size-avatar-md',
  L: 'size-avatar-lg',
  XL: 'size-avatar-xl',
};

const toneBg = { ...featureBg, surface: 'bg-background-surface', muted: 'bg-background-surface-muted' };

/** Figma `Avatar` (Type × Size). */
export function Avatar({ photo, initials, tone = 'feed', size = 'M', statusDot = false, label }: AvatarProps) {
  return (
    <View
      className={`items-center justify-center rounded-full ${box[size]} ${photo ? '' : toneBg[tone]}`}
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}>
      {photo ? (
        <Image source={photo} style={{ width: '100%', height: '100%', borderRadius: 999 }} contentFit="cover" />
      ) : (
        <Text
          variant={size === 'S' ? 'label-small' : size === 'XL' ? 'title-large' : 'label-large'}
          numberOfLines={1}>
          {initials}
        </Text>
      )}
      {statusDot && <BadgeDot large className="absolute bottom-[-2px] end-[-2px]" />}
    </View>
  );
}
