import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { formatDate } from '@/lib/format';

const DAY_MS = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Figma `Date pill` (State): Default, Selected (teal + soft ring) or Future (disabled; no logging ahead). */
export function DatePill({ date, selected, future, onPress }: { date: Date; selected: boolean; future: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  const weekday = formatDate(date, { weekday: 'narrow' });
  const day = formatDate(date, { day: 'numeric' });
  const fill = selected ? 'bg-primary-default' : future ? 'bg-background-surface-muted' : 'bg-background-surface';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}
      accessibilityState={{ selected, disabled: future }}
      disabled={future}
      onPress={onPress}
      // Selected ring: 3 pt `primary/ring` outside the pill (Figma stroke, outside).
      style={selected ? { boxShadow: `0px 0px 0px 3px ${colors['color/primary/ring']}` } : undefined}
      className={`h-[64px] w-touch-min items-center justify-center gap-2xs rounded-full ${fill}`}>
      <Text variant="caption" tone={selected ? 'on-primary' : future ? 'disabled' : 'tertiary'}>
        {weekday}
      </Text>
      <Text variant="label-large" tone={selected ? 'on-primary' : future ? 'disabled' : 'primary'} tabular>
        {day}
      </Text>
    </Pressable>
  );
}

/** Figma `Date strip`: the selected day as a heading, an add button, and the last 7 days ending today. */
export function DateStrip({
  selected,
  onSelect,
  onAdd,
  today = new Date(),
}: {
  selected: Date;
  onSelect: (day: Date) => void;
  onAdd?: () => void;
  today?: Date;
}) {
  const { t } = useTranslation();
  const end = startOfDay(today);
  const days = Array.from({ length: 7 }, (_, i) => new Date(end.getTime() - (6 - i) * DAY_MS));
  const sel = startOfDay(selected).getTime();
  return (
    <View className="gap-md">
      <View className="min-h-[40px] flex-row items-center justify-between gap-md">
        <Text variant="heading" accessibilityRole="header" className="flex-shrink">
          {formatDate(selected, { weekday: 'long', day: 'numeric', month: 'short' })}
        </Text>
        {onAdd && <IconButton icon="plus" variant="tinted" size="small" label={t('nav.logEvent')} onPress={onAdd} />}
      </View>
      <View className="flex-row items-center justify-between">
        {days.map((day) => (
          <DatePill key={day.getTime()} date={day} selected={day.getTime() === sel} future={day.getTime() > end.getTime()} onPress={() => onSelect(day)} />
        ))}
      </View>
    </View>
  );
}
