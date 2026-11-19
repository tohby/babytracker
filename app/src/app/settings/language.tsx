import { getLocales } from 'expo-localization';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StackScreen } from '@/components/screen';
import { Field } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { useNow } from '@/hooks/use-now';
import { formatDate, formatTime, formatVolume } from '@/lib/format';

/** V2-H04 Language & region: language follows the phone; units, clock and wording are separate choices. */
export default function LanguageScreen() {
  const { t } = useTranslation('settings');
  const tl = useTranslation('timeline').t;
  const { prefs, update } = useFormatPrefs();
  const now = useNow();
  const locale = getLocales()[0];
  const language = locale?.languageTag ? new Intl.DisplayNames([locale.languageTag], { type: 'language' }).of(locale.languageTag) ?? locale.languageTag : '';
  const row = (label: string, node: React.ReactNode) => (
    <View className="gap-sm">
      <Text variant="label-large">{label}</Text>
      {node}
    </View>
  );
  return (
    <StackScreen title={t('v2.lang.title')}>
      <View className="gap-xs rounded-md bg-background-surface-muted p-lg">
        <Text variant="label-small" tone="secondary">
          {t('v2.lang.preview')}
        </Text>
        <Text variant="subheading">{t('v2.lang.previewLine', { what: tl('titles.bottle'), amount: formatVolume(120), date: formatDate(now, { day: 'numeric', month: 'numeric' }), time: formatTime(now) })}</Text>
      </View>
      <Field type="select" label={t('v2.lang.language')} value={t('v2.lang.languageValue', { language })} helper={t('v2.lang.languageHelp')} onPress={() => Linking.openSettings()} />
      {row(t('v2.lang.liquids'), <SegmentedControl label={t('v2.lang.liquids')} value={prefs.volumeUnit} onChange={(volumeUnit) => update({ volumeUnit })} options={[{ value: 'ml', label: t('v2.lang.ml') }, { value: 'oz', label: t('v2.lang.oz') }]} />)}
      {row(t('v2.lang.weight'), <SegmentedControl label={t('v2.lang.weight')} value={prefs.weightUnit} onChange={(weightUnit) => update({ weightUnit })} options={[{ value: 'kg', label: t('v2.lang.kg') }, { value: 'lb', label: t('v2.lang.lb') }]} />)}
      {row(t('v2.lang.clock'), <SegmentedControl label={t('v2.lang.clock')} value={prefs.hour12 === false ? 'h24' : 'h12'} onChange={(v) => update({ hour12: v === 'h12' })} options={[{ value: 'h12', label: t('v2.lang.h12') }, { value: 'h24', label: t('v2.lang.h24') }]} />)}
      {row(t('v2.lang.wording'), <SegmentedControl label={t('v2.lang.wording')} value={prefs.nappyWord} onChange={(nappyWord) => update({ nappyWord })} options={[{ value: 'nappy', label: t('v2.lang.nappy') }, { value: 'diaper', label: t('v2.lang.diaper') }]} />)}
    </StackScreen>
  );
}
