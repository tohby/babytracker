import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { LogEvent } from '@/data/log-events';
import { durationMs } from '@/data/log-events';
import { useFormatPrefs } from '@/hooks/use-format-prefs';
import { formatDuration, formatLength, formatTime, formatVolume, formatWeight } from '@/lib/format';
import { napNumber } from '@/lib/log-summary';

export type EventText = { title: string; detail?: string; value?: string };

/** Title, detail and value for a logged event, as the Figma `Timeline entry` shows them. */
export function useEventText(allEvents: LogEvent[]) {
  const { t } = useTranslation('timeline');
  const { t: tc } = useTranslation();
  const { prefs } = useFormatPrefs();

  return useCallback(
    (e: LogEvent): EventText => {
      const dur = durationMs(e);
      const range = e.endAt ? tc('units.range', { start: formatTime(e.startAt), end: formatTime(e.endAt) }) : undefined;
      switch (e.type) {
        case 'sleep': {
          const hour = new Date(e.startAt).getHours();
          const night = hour >= 19 || hour < 6;
          return {
            title: night ? t('titles.nightSleep') : t('titles.nap', { n: napNumber(allEvents, e) }),
            detail: range ?? t('details.stillAsleep', { start: formatTime(e.startAt) }),
            value: dur !== null ? formatDuration(dur) : undefined,
          };
        }
        case 'feed':
          return {
            title: t('titles.bottle'),
            detail: e.bottle ? t(`details.milk.${e.bottle.milk}`) : undefined,
            value: e.bottle ? formatVolume(e.bottle.amountMl) : undefined,
          };
        case 'nursing':
          return {
            title: t('titles.nursing'),
            detail: e.nursing ? t('details.nursing', { left: formatDuration(e.nursing.leftMs), right: formatDuration(e.nursing.rightMs) }) : undefined,
            value: dur !== null ? formatDuration(dur) : undefined,
          };
        case 'pumping':
          return {
            title: t('titles.pumping'),
            detail: e.pumping ? t(`details.pump.${e.pumping.side}`) : undefined,
            value: e.pumping ? formatVolume(e.pumping.amountMl) : undefined,
          };
        case 'solids':
          return {
            title: t('titles.solids'),
            detail: e.solids?.foods.reduce((a, b) => (a ? tc('units.list', { a, b }) : b), ''),
            value: e.solids ? t(`details.solidsReaction.${e.solids.reaction}`) : undefined,
          };
        case 'nappy':
          return { title: t(prefs.nappyWord === 'diaper' ? 'titles.diaper' : 'titles.nappy'), detail: e.nappy ? t(`details.nappy.${e.nappy.kind}`) : undefined };
        case 'medicine':
          return {
            title: t('titles.medicine'),
            detail: e.medicine ? (e.medicine.dose ? t('details.medicineDose', { name: e.medicine.name, dose: e.medicine.dose }) : e.medicine.name) : undefined,
          };
        case 'growth': {
          const g = e.growth;
          return {
            title: t('titles.growth'),
            detail: g?.weightG ? t('details.growthWeight', { value: formatWeight(g.weightG) }) : g?.lengthMm ? t('details.growthLength', { value: formatLength(g.lengthMm) }) : undefined,
          };
        }
        default: {
          const kind = e.activity?.kind ?? (e.type === 'bath' ? 'bath' : e.type === 'tummy' ? 'tummy' : 'play');
          return { title: t(`titles.${kind}`), detail: e.note, value: dur !== null ? formatDuration(dur) : undefined };
        }
      }
    },
    [t, tc, prefs.nappyWord, allEvents],
  );
}
