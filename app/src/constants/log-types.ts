import type { IconName } from '@/components/ui/icon';
import type { MascotPose } from '@/components/ui/mascot';
import type { FeatureTone } from '@/constants/tones';

/** Every kind of event a parent can log. Raw ids; labels come from i18n (`log:types.<id>`). */
export type LogType =
  | 'feed'
  | 'sleep'
  | 'nappy'
  | 'nursing'
  | 'pumping'
  | 'solids'
  | 'medicine'
  | 'growth'
  | 'bath'
  | 'tummy'
  | 'activity';

/** Tone, icon and mascot pose per type, as mapped in the Figma `Log tile` and `Timeline entry` variants. */
export const logMeta: Record<LogType, { tone: FeatureTone; icon: IconName; pose?: MascotPose }> = {
  feed: { tone: 'feed', icon: 'bottle', pose: 'feeding' },
  sleep: { tone: 'sleep', icon: 'moon', pose: 'sleeping' },
  nappy: { tone: 'nappy', icon: 'log-nappy', pose: 'nappy-change' },
  nursing: { tone: 'feed', icon: 'log-nursing' },
  pumping: { tone: 'feed', icon: 'log-pump' },
  solids: { tone: 'feed', icon: 'log-solids' },
  medicine: { tone: 'care', icon: 'log-medicine' },
  growth: { tone: 'care', icon: 'log-growth' },
  bath: { tone: 'care', icon: 'log-bath' },
  tummy: { tone: 'care', icon: 'log-tummy' },
  activity: { tone: 'care', icon: 'log-activity' },
};
