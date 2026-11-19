import * as Notifications from 'expo-notifications';

import i18n from '@/i18n';

/**
 * Schedules a local reminder (nothing leaves the phone). Asks for permission the first time; returns 'denied' when
 * notifications are off so the screen can say so honestly instead of pretending.
 */
export async function scheduleReminder(at: number, kind: 'nap' | 'eightWeeks', name: string): Promise<'scheduled' | 'denied' | 'past'> {
  if (at <= Date.now()) return 'past';
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
  if (!granted) return 'denied';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t(kind === 'nap' ? 'prediction:notifications.napTitle' : 'prediction:notifications.eightWeeksTitle'),
      body: i18n.t(kind === 'nap' ? 'prediction:notifications.napBody' : 'prediction:notifications.eightWeeksBody', { name }),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
  });
  return 'scheduled';
}
