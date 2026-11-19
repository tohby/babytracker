import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { featureBg, type FeatureTone } from '@/constants/tones';

/** Figma `Baby profile card`: name, localised age, unit chips and an edit action, on the child's tone. */
export function BabyProfileCard({
  name,
  initials,
  age,
  units,
  tone = 'feed',
  onEdit,
}: {
  name: string;
  initials: string;
  age: string;
  units: string[];
  tone?: FeatureTone;
  onEdit?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className={`flex-row items-center gap-lg rounded-2xl p-page ${featureBg[tone]}`}>
      <Avatar size="XL" initials={initials} tone="surface" />
      <View className="flex-1 gap-2xs">
        <Text variant="title-large" numberOfLines={1} adjustsFontSizeToFit>
          {name}
        </Text>
        <Text variant="body-small" tone="secondary">
          {age}
        </Text>
        <View className="flex-row flex-wrap gap-xs pt-[6px]">
          {units.map((u) => (
            <Chip key={u} label={u} variant="neutral" size="small" className="bg-background-surface" />
          ))}
        </View>
      </View>
      {onEdit && <IconButton icon="edit" size="small" label={t('a11y.editProfile', { name })} onPress={onEdit} />}
    </View>
  );
}
