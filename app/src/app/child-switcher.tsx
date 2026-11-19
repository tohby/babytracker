import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { OptionCard } from '@/components/ui/option-card';
import { selectBaby, useCurrentBaby } from '@/hooks/use-current-baby';
import { ageLabel } from '@/lib/age-label';

const TONES = ['feed', 'sleep', 'nappy', 'care'] as const;

/** V2-G09 Child switcher (`Sheet content/Child switcher`, compact). */
export default function ChildSwitcherSheet() {
  const { t } = useTranslation('family');
  const { baby, babies } = useCurrentBaby();
  return (
    <BottomSheet title={t('switcher.title')} subtitle={t('switcher.subtitle')} onClose={() => router.back()}>
      {babies.map((b, i) => (
        <OptionCard
          key={b.id}
          leading={<Avatar initials={b.name.slice(0, 1).toUpperCase()} tone={TONES[i % TONES.length]} />}
          title={b.name}
          detail={t('switcher.detail', { age: ageLabel(b.birth_date) })}
          selected={b.id === baby?.id}
          onPress={() => {
            selectBaby(b.id);
            router.back();
          }}
        />
      ))}
      <Button hierarchy="tertiary" size="medium" label={t('switcher.addBaby')} onPress={() => router.replace('/onboarding')} />
    </BottomSheet>
  );
}
