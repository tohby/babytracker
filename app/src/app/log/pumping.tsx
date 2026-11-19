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
import type { PumpSide } from '@/data/log-events';
import { useLogStore } from '@/data/log-store';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { recentAmounts } from '@/lib/log-summary';

/** V2-D12 Pumping (`Sheet content/Pumping`): Manual entry, or start a pumping timer. */
export default function PumpingSheet() {
  const { t } = useTranslation('log');
  const { babyId, name, events } = useLogContext();
  const { prefs, update } = useFormatPrefs();
  const { startTimer, timer } = useLogStore();
  const [mode, setMode] = useState<'timer' | 'manual'>('manual');
  const [side, setSide] = useState<PumpSide>('both');
  const amounts = events.filter((e) => e.pumping).map((e) => e.pumping!.amountMl);
  const [ml, setMl] = useState(amounts[0] ?? 120);
  const [at, setAt] = useState<number | null>(null);
  const timerMode = mode === 'timer';
  return (
    <LogForm
      title={t('pumpingSheet.title')}
      subtitle={t('pumpingSheet.subtitle', { name })}
      saveLabel={timerMode ? t('pumpingSheet.start') : t('pumpingSheet.save')}
      canSave={!!babyId && (!timerMode || !timer)}
      savedMessage={(time) => t('saved.pumping', { time })}
      buildEvent={() => {
        if (timerMode) {
          startTimer('pumping', babyId);
          router.replace('/log/pumping-timer');
          return null;
        }
        return { babyId, type: 'pumping', startAt: new Date(at ?? Date.now()).toISOString(), pumping: { side, amountMl: Math.round(ml) }, loggedBy: '' };
      }}>
      <SegmentedControl label={t('pumpingSheet.title')} value={mode} onChange={setMode} options={[{ value: 'timer', label: t('pumpingSheet.timer') }, { value: 'manual', label: t('pumpingSheet.manual') }]} />
      <View className="gap-lg">
        <Text variant="label-large">{t('pumpingSheet.side')}</Text>
        <View className="flex-row flex-wrap gap-sm">
          {(['left', 'right', 'both'] as const).map((s) => (
            <Chip key={s} label={t(`pumpingSheet.${s}`)} variant={side === s ? 'selected' : 'outline'} selected={side === s} onPress={() => setSide(s)} />
          ))}
        </View>
      </View>
      {!timerMode && (
        <>
          <AmountPicker ml={ml} onChange={setMl} presets={recentAmounts(amounts)} unit={prefs.volumeUnit} onUnitChange={(volumeUnit) => update({ volumeUnit })} />
          <WhenRow label={t('when.time')} value={at} onChange={setAt} />
        </>
      )}
    </LogForm>
  );
}
