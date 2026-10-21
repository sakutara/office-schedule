const ENABLED_KEY = 'office_tracker_vp_reminder_enabled';
const LAST_EVALUATED_KEY = 'office_tracker_vp_reminder_last_date';

export type VpReminderStatus = 'on' | 'off' | 'blocked' | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isVpReminderEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setVpReminderEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    // Storage unavailable (private mode): the toggle simply will not persist
  }
}

export function getLastEvaluatedDate(): string | undefined {
  try {
    return localStorage.getItem(LAST_EVALUATED_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function setLastEvaluatedDate(todayStr: string): void {
  try {
    localStorage.setItem(LAST_EVALUATED_KEY, todayStr);
  } catch {
    // Ignore: worst case the reminder can be evaluated again on the same day
  }
}

export function getVpReminderStatus(): VpReminderStatus {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission === 'granted' && isVpReminderEnabled()) return 'on';
  return 'off';
}

/**
 * Must be called from a user gesture (button click) so the browser shows the permission prompt.
 * Resolves to the resulting status.
 */
export async function enableVpReminder(): Promise<VpReminderStatus> {
  if (!isNotificationSupported()) return 'unsupported';
  const permission =
    Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (permission === 'granted') {
    setVpReminderEnabled(true);
    return 'on';
  }
  setVpReminderEnabled(false);
  return permission === 'denied' ? 'blocked' : 'off';
}

export function disableVpReminder(): VpReminderStatus {
  setVpReminderEnabled(false);
  return getVpReminderStatus();
}

/**
 * Shows the reminder through the service worker (works on mobile PWAs),
 * falling back to a page notification where no service worker is available.
 */
export async function showVpReminderNotification(title: string, body: string): Promise<void> {
  const options: NotificationOptions = { body, tag: 'vp-reminder', icon: 'icon-192.png' };
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
      return;
    }
    new Notification(title, options);
  } catch {
    // Notification could not be shown (e.g. platform restriction); reminder is best-effort
  }
}
