/* Web: no local notifications. Android/iOS use index.native.ts. */
import type { Reminder } from '../game/reminders';

export const remindersSupported = false;

export async function ensurePermission(): Promise<boolean> {
  return false;
}

export async function syncReminders(_plan: Reminder[], _text: (r: Reminder) => { title: string; body: string }, _channelName: string): Promise<void> {}
