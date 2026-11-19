import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LogForm } from '@/components/log/log-form';
import { useLogContext } from '@/components/log/use-log-context';
import { WhenRow } from '@/components/log/when-row';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Field } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import type { SolidsAmount, SolidsReaction } from '@/data/log-events';
import { formatTime } from '@/lib/format';

const FOODS = ['avocado', 'sweetPotato', 'banana', 'oats', 'egg', 'yoghurt'] as const;

/** V2-D13 Solids (`Sheet content/Solids`). Foods are stored as the words shown (custom foods as typed). */
export default function SolidsSheet() {
  const { t } = useTranslation('log');
  const { babyId, name, events, now } = useLogContext();
  const custom = Array.from(new Set(events.flatMap((e) => e.solids?.foods ?? []))).filter((f) => !FOODS.some((k) => t(`solidsSheet.foods.${k}`) === f));
  const [extra, setExtra] = useState<string[]>(custom.slice(0, 4));
  const [foods, setFoods] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [amount, setAmount] = useState<SolidsAmount>('some');
  const [reaction, setReaction] = useState<SolidsReaction>('loved');
  const [at, setAt] = useState<number | null>(null);
  const toggle = (f: string) => setFoods((xs) => (xs.includes(f) ? xs.filter((x) => x !== f) : [...xs, f]));
  const options = [...FOODS.map((k) => t(`solidsSheet.foods.${k}`)), ...extra];
  return (
    <LogForm
      title={t('solidsSheet.title')}
      subtitle={t('solidsSheet.subtitle', { name, time: formatTime(now) })}
      saveLabel={t('solidsSheet.save')}
      canSave={foods.length > 0 && !!babyId}
      savedMessage={(time) => t('saved.solids', { time })}
      buildEvent={() => ({ babyId, type: 'solids', startAt: new Date(at ?? Date.now()).toISOString(), solids: { foods, amount, reaction }, loggedBy: '' })}>
      <View className="gap-lg">
        <Text variant="label-large">{t('solidsSheet.what', { name })}</Text>
        <View className="flex-row flex-wrap gap-sm">
          {options.map((f) => (
            <Chip key={f} label={f} variant={foods.includes(f) ? 'selected' : 'outline'} selected={foods.includes(f)} onPress={() => toggle(f)} />
          ))}
          {!adding && <Chip label={t('solidsSheet.addFood')} variant="outline" onPress={() => setAdding(true)} />}
        </View>
        {adding && (
          <View className="flex-row items-end gap-sm">
            <View className="flex-1">
              <Field label={t('solidsSheet.addFoodLabel')} placeholder={t('solidsSheet.addFoodPlaceholder')} value={draft} onChangeText={setDraft} autoFocus returnKeyType="done" />
            </View>
            <Button
              label={t('solidsSheet.add')}
              size="large"
              hierarchy="secondary"
              disabled={!draft.trim()}
              onPress={() => {
                const f = draft.trim();
                setExtra((xs) => (xs.includes(f) ? xs : [...xs, f]));
                setFoods((xs) => [...xs, f]);
                setDraft('');
                setAdding(false);
              }}
            />
          </View>
        )}
      </View>
      <View className="gap-lg">
        <Text variant="label-large">{t('solidsSheet.howMuch')}</Text>
        <SegmentedControl label={t('solidsSheet.howMuch')} value={amount} onChange={setAmount} options={[{ value: 'taste', label: t('solidsSheet.taste') }, { value: 'some', label: t('solidsSheet.some') }, { value: 'lots', label: t('solidsSheet.lots') }]} />
      </View>
      <View className="gap-lg">
        <Text variant="label-large">{t('solidsSheet.howDidItGo')}</Text>
        <View className="flex-row flex-wrap gap-sm">
          {(['loved', 'unsure', 'disliked'] as const).map((r) => (
            <Chip key={r} label={t(`solidsSheet.${r}`)} variant={reaction === r ? 'selected' : 'outline'} selected={reaction === r} onPress={() => setReaction(r)} />
          ))}
        </View>
      </View>
      <WhenRow label={t('when.time')} value={at} onChange={setAt} />
    </LogForm>
  );
}
