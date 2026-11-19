import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { AmountPicker } from '@/components/tracking/amount-picker';
import { Chip } from '@/components/ui/chip';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import type { MilkKind } from '@/data/log-events';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { elapsedMs, formatDuration } from '@/lib/format';
import { recentAmounts } from '@/lib/log-summary';

/** V2-D05 Feed · bottle (`Sheet content/Feed · Bottle`). Nursing and Solids switch to their own sheets. */
export default function FeedSheet() {
  const { t } = useTranslation('log');
  const { babyId, name, events, now } = useLogContext();
  const { prefs, update } = useFormatPrefs();
  const bottles = events.filter((e) => e.bottle).map((e) => e.bottle!.amountMl);
  const [ml, setMl] = useState(bottles[0] ?? 120);
  const [milk, setMilk] = useState<MilkKind>(events.find((e) => e.bottle)?.bottle?.milk ?? 'formula');
  const [at, setAt] = useState<number | null>(null);
  const last = events.find((e) => e.type === 'feed' || e.type === 'nursing' || e.type === 'solids');

  const switchTo = (v: 'nursing' | 'bottle' | 'solids') => {
    if (v === 'nursing') router.replace('/log/nursing');
    if (v === 'solids') router.replace('/log/solids');
  };

  return (
    <LogForm
      title={t('feed.title')}
      subtitle={last ? t('feed.subtitle', { name, ago: formatDuration(elapsedMs(last.startAt, now)) }) : t('feed.subtitlePlain', { name })}
      saveLabel={t('feed.save')}
      canSave={ml > 0 && !!babyId}
      savedMessage={(time) => t('saved.feed', { time })}
      buildEvent={() => ({ babyId, type: 'feed', startAt: new Date(at ?? Date.now()).toISOString(), bottle: { amountMl: Math.round(ml), milk }, loggedBy: '' })}>
      <SegmentedControl
        label={t('feed.title')}
        value="bottle"
        onChange={switchTo}
        options={[
          { value: 'nursing', label: t('feed.nursing') },
          { value: 'bottle', label: t('feed.bottle') },
          { value: 'solids', label: t('feed.solids') },
        ]}
      />
      <AmountPicker ml={ml} onChange={setMl} presets={recentAmounts(bottles)} unit={prefs.volumeUnit} onUnitChange={(volumeUnit) => update({ volumeUnit })} />
      <View className="gap-sm">
        <Text variant="label-large">{t('feed.milk')}</Text>
        <View className="flex-row flex-wrap gap-sm">
          {(['formula', 'breast', 'mixed'] as const).map((k) => (
            <Chip key={k} label={t(k === 'formula' ? 'feed.milkFormula' : k === 'breast' ? 'feed.milkBreast' : 'feed.milkMixed')} variant={milk === k ? 'selected' : 'outline'} selected={milk === k} onPress={() => setMilk(k)} />
          ))}
        </View>
      </View>
      <WhenRow label={t('when.time')} value={at} onChange={setAt} />
    </LogForm>
  );
}
