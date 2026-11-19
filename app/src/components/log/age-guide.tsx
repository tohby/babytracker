import { useTranslation } from 'react-i18next';

import { useLogContext } from '@/components/log/use-log-context';
import { InsightCard } from '@/components/ui/insight-card';
import { ageLabel } from '@/lib/age-label';
import { formatDuration } from '@/lib/format';
import { wakeWindow } from '@/lib/onboarding/age';

/** "For now: age-based guide" Insight card (V2-F07 and `Sheet content/Still learning`). */
export function AgeGuide() {
  const { t } = useTranslation('prediction');
  const { baby } = useLogContext();
  const ww = baby ? wakeWindow(baby.birth_date) : { min: 90, max: 150 };
  return (
    <InsightCard
      tone="sleep"
      icon="moon"
      title={t('learning.guideTitle')}
      body={t('learning.guideBody', { age: baby ? ageLabel(baby.birth_date) : '', min: formatDuration(ww.min * 60_000), max: formatDuration(ww.max * 60_000) })}
    />
  );
}
