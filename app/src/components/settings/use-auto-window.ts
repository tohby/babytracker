import { formatTime, formatTimeCompact } from '@/lib/format';
import { AUTO_DARK_SCHEDULE } from '@/lib/theme-schedule';

/** Today at a schedule time, only so it can be formatted in the user's clock style. */
const today = ({ hour, minute }: { hour: number; minute: number }) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};

/** The Auto window as text: `short` ("7 PM" / "6 AM") for labels, `full` ("7:00 PM") for sentences. */
export function useAutoWindow() {
  const start = today(AUTO_DARK_SCHEDULE.darkFrom);
  const end = today(AUTO_DARK_SCHEDULE.lightFrom);
  return {
    short: { start: formatTimeCompact(start), end: formatTimeCompact(end) },
    full: { start: formatTime(start), end: formatTime(end) },
  };
}
