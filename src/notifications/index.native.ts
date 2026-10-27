/* Local reminders on Android/iOS. No push server: the app reschedules the next week whenever data changes. */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from '../game/reminders';

export const remindersSupported = true;
const CHANNEL = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** Asks only when called from a user action (switch in settings or welcome screen). */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

function at(day: string, time: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export async function syncReminders(plan: Reminder[], text: (r: Reminder) => { title: string; body: string }, channelName: string): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!plan.length) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: channelName, importance: Notifications.AndroidImportance.DEFAULT });
  }
  const now = Date.now();
  for (const r of plan) {
    const date = at(r.day, r.time);
    if (date.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: { ...text(r), sound: false },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL },
    });
  }
}
