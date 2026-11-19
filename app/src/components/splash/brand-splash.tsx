import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ScreenBackground } from '@/components/ui/screen-background';
import { StatusBanner } from '@/components/ui/status-banner';
import { Mascot } from '@/components/ui/mascot';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

export type SplashStatus = 'loading' | 'slow' | 'offline' | 'error';

/** The Nappa baby (Standing) on the splash; the art frame is square. */
const MASCOT_SIZE = 200;

type BrandSplashProps = {
  status: SplashStatus;
  onRetry?: () => void;
};

/**
 * The in-app splash, Figma "Splash" page, V1 Classic: the baby mascot, "Nappa" wordmark and tagline on the
 * app gradient, with a status area at the bottom (Loading, Slow, Offline, Error).
 */
export function BrandSplash({ status, onRetry }: BrandSplashProps) {
  const { t } = useTranslation('splash');
  const colors = useThemeColors();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingTop: top, paddingBottom: bottom + 8 }}>
      <ScreenBackground />

      <View
        accessible
        accessibilityLabel={`${t('brandName')}. ${t('tagline')}`}
        className="flex-1 items-center justify-center gap-xl px-page">
        <Mascot pose="standing" size={MASCOT_SIZE} />
        <View className="w-full items-center gap-sm">
          <Text variant="display-numeric" className="text-center">
            {t('brandName')}
          </Text>
          <Text className="text-center">{t('tagline')}</Text>
        </View>
      </View>

      {/* Status area. min-h keeps the brand block from jumping when a state adds a banner. */}
      <View className="min-h-[120px] items-center justify-end gap-md px-page" accessibilityLiveRegion="polite">
        {status === 'offline' ? (
          <StatusBanner type="offline" title={t('offline.title')} detail={t('offline.detail')} />
        ) : null}
        {status === 'error' ? (
          <>
            <StatusBanner type="error" title={t('error.title')} detail={t('error.detail')} />
            <Button label={t('error.retry')} onPress={onRetry} />
          </>
        ) : null}
        {status !== 'error' ? (
          <View className="flex-row items-center gap-sm">
            <ActivityIndicator color={colors['color/text/primary']} accessibilityLabel={t('loadingLabel')} />
            {status === 'slow' ? <Text variant="label-large">{t('slow')}</Text> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
