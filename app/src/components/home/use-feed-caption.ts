import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { FeedKind } from '@/data/home';
import { formatVolume } from '@/lib/format';

/** "Bottle · 120 ml", "Breast · left", ... Shared by the Last feed tile and the Feed due card. */
export function useFeedCaption() {
  const { t } = useTranslation('home');
  return useCallback(
    (kind: FeedKind, amountMl?: number) => {
      switch (kind) {
        case 'bottle':
          return amountMl === undefined ? t('tiles.feed.bottlePlain') : t('tiles.feed.bottle', { volume: formatVolume(amountMl) });
        case 'breastLeft':
          return t('tiles.feed.breastLeft');
        case 'breastRight':
          return t('tiles.feed.breastRight');
        case 'solids':
          return t('tiles.feed.solids');
      }
    },
    [t],
  );
}
