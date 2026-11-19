import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUniwind } from 'uniwind';

import { TimeRow } from '@/components/tracking/time-row';
import { Button } from '@/components/ui/button';
import { useElevation } from '@/hooks/use-elevation';
import { formatDate, formatTime } from '@/lib/format';
import { startOfDay } from '@/lib/log-summary';

/** "Now", "Today, 1:05 pm" or "Mon 16 Nov, 1:05 pm". */
export function useWhenLabel() {
  const { t } = useTranslation('log');
  return (value: number | null, now = Date.now()) => {
    if (value === null || Math.abs(now - value) < 60_000) return t('when.now');
    const sameDay = startOfDay(value) === startOfDay(now);
    return sameDay ? t('when.today', { time: formatTime(value) }) : t('when.day', { day: formatDate(value, { weekday: 'short', day: 'numeric', month: 'short' }), time: formatTime(value) });
  };
}

/**
 * Figma `Time row` + the native date/time picker. `value` null means "now". Backdated rows are highlighted.
 * Never in the future (no logging ahead).
 */
export function WhenRow({ label, value, onChange, emptyLabel, minimum }: { label: string; value: number | null; onChange: (v: number | null) => void; emptyLabel?: string; minimum?: number }) {
  const { t } = useTranslation('log');
  const { theme } = useUniwind();
  const shadow = useElevation('overlay');
  const whenLabel = useWhenLabel();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const now = new Date();

  const show = () => {
    const start = new Date(value ?? Date.now());
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: start,
        mode: 'time',
        maximumDate: now,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(Math.min(date.getTime(), Date.now()));
        },
      });
      return;
    }
    setDraft(start);
    setOpen(true);
  };

  return (
    <>
      <TimeRow label={label} value={value === null && emptyLabel ? emptyLabel : whenLabel(value)} backdated={value !== null} onChange={show} />
      {open && (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View className="flex-1 justify-end px-page pb-4xl">
            <Pressable accessibilityElementsHidden onPress={() => setOpen(false)} className="absolute inset-0 bg-background-scrim opacity-40" />
            <View style={{ boxShadow: shadow }} className="gap-md rounded-2xl bg-background-surface-raised p-lg">
              <DateTimePicker
                value={draft}
                mode="datetime"
                display="spinner"
                maximumDate={now}
                minimumDate={minimum ? new Date(minimum) : undefined}
                themeVariant={theme === 'dark' ? 'dark' : 'light'}
                onChange={(_, d) => d && setDraft(d)}
              />
              <Button
                label={t('when.done')}
                size="medium"
                onPress={() => {
                  onChange(Math.min(draft.getTime(), Date.now()));
                  setOpen(false);
                }}
              />
              <Button
                label={t('when.useNow')}
                hierarchy="tertiary"
                size="medium"
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}


