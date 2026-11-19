import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/ui/chip';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import type { VolumeUnit } from '@/lib/format';
import { formatNumber } from '@/lib/format';

const ML_PER_OZ = 29.5735;

/**
 * Figma `Amount picker`: presets (the parent's last four amounts), a stepper (10 ml / 0.5 oz steps) and an inline
 * ml/oz switch. Stores millilitres; the unit is display only.
 */
export function AmountPicker({
  ml,
  onChange,
  presets,
  unit,
  onUnitChange,
}: {
  ml: number;
  onChange: (ml: number) => void;
  presets: number[];
  unit: VolumeUnit;
  onUnitChange: (unit: VolumeUnit) => void;
}) {
  const { t } = useTranslation('log');
  const toDisplay = (v: number) => (unit === 'ml' ? v : v / ML_PER_OZ);
  const step = unit === 'ml' ? 10 : 0.5 * ML_PER_OZ;
  const show = (v: number) => formatNumber(toDisplay(v), { maximumFractionDigits: unit === 'ml' ? 0 : 1 });
  const unitLabel = unit === 'ml' ? t('units.ml') : t('units.oz');
  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between gap-md">
        <Text variant="label-large">{t('amount.label')}</Text>
        <SegmentedControl
          className="w-[120px]"
          label={t('amount.unit')}
          value={unit}
          onChange={onUnitChange}
          options={[
            { value: 'ml', label: t('units.ml') },
            { value: 'oz', label: t('units.oz') },
          ]}
        />
      </View>
      <View className="flex-row flex-wrap gap-sm">
        {presets.map((p) => (
          <Chip
            key={p}
            label={t('amount.preset', { amount: show(p), unit: unitLabel })}
            variant={Math.round(p) === Math.round(ml) ? 'selected' : 'outline'}
            onPress={() => onChange(p)}
          />
        ))}
      </View>
      <Stepper
        label={t('amount.label')}
        amount={show(ml)}
        unit={unitLabel}
        canDecrease={ml - step >= 0}
        onDecrease={() => onChange(Math.max(0, ml - step))}
        onIncrease={() => onChange(ml + step)}
      />
    </View>
  );
}
