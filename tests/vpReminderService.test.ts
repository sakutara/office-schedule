import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  disableVpReminder,
  enableVpReminder,
  getLastEvaluatedDate,
  getVpReminderStatus,
  setLastEvaluatedDate,
  showVpReminderNotification,
} from '../src/services/vpReminderService';

function stubNotification(permission: NotificationPermission, requestResult: NotificationPermission = 'granted') {
  class FakeNotification {
    static permission: NotificationPermission = permission;
    // Like the browser, the prompt result updates the global permission state
    static requestPermission = vi.fn(async () => {
      FakeNotification.permission = requestResult;
      return requestResult;
    });
    constructor(public title: string, public options?: NotificationOptions) {}
  }
  vi.stubGlobal('Notification', FakeNotification);
  return { FakeNotification, requestPermission: FakeNotification.requestPermission };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('VP reminder status', () => {
  it('is unsupported when the Notification API is missing', () => {
    expect(getVpReminderStatus()).toBe('unsupported');
  });

  it('is blocked when permission was denied', () => {
    stubNotification('denied');
    expect(getVpReminderStatus()).toBe('blocked');
  });

  it('is off by default even with permission granted', () => {
    stubNotification('granted');
    expect(getVpReminderStatus()).toBe('off');
  });

  it('enables after requesting permission from a user action', async () => {
    const { requestPermission } = stubNotification('default', 'granted');
    expect(await enableVpReminder()).toBe('on');
    expect(requestPermission).toHaveBeenCalledOnce();
    expect(getVpReminderStatus()).toBe('on');
  });

  it('stays off when the user declines the permission prompt', async () => {
    stubNotification('default', 'denied');
    expect(await enableVpReminder()).toBe('blocked');
    expect(getVpReminderStatus()).toBe('blocked');
  });

  it('does not prompt again when permission is already granted', async () => {
    const { requestPermission } = stubNotification('granted');
    expect(await enableVpReminder()).toBe('on');
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('disables the reminder', async () => {
    stubNotification('granted');
    await enableVpReminder();
    expect(disableVpReminder()).toBe('off');
    expect(getVpReminderStatus()).toBe('off');
  });

  it('reports unsupported when enabling without the Notification API', async () => {
    expect(await enableVpReminder()).toBe('unsupported');
  });
});

describe('VP reminder evaluation marker', () => {
  it('remembers the last evaluated date', () => {
    expect(getLastEvaluatedDate()).toBeUndefined();
    setLastEvaluatedDate('2026-10-21');
    expect(getLastEvaluatedDate()).toBe('2026-10-21');
  });
});

describe('showVpReminderNotification', () => {
  it('falls back to a page notification when there is no service worker', async () => {
    const created: Array<{ title: string; options?: NotificationOptions }> = [];
    class FakeNotification {
      static permission: NotificationPermission = 'granted';
      constructor(title: string, options?: NotificationOptions) {
        created.push({ title, options });
      }
    }
    vi.stubGlobal('Notification', FakeNotification);
    vi.stubGlobal('navigator', {});
    await showVpReminderNotification('Title', 'Body');
    expect(created).toEqual([{ title: 'Title', options: expect.objectContaining({ body: 'Body' }) }]);
  });

  it('shows through the service worker registration when available', async () => {
    stubNotification('granted');
    const showNotification = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', {
      serviceWorker: { ready: Promise.resolve({ showNotification }) },
    });
    await showVpReminderNotification('Title', 'Body');
    expect(showNotification).toHaveBeenCalledWith('Title', expect.objectContaining({ body: 'Body', tag: 'vp-reminder' }));
  });
});
