import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';
import { createDefaultProfiles } from '../src/domains/office/officeEngine';

const ENABLED_KEY = 'office_tracker_vp_reminder_enabled';
const LAST_DATE_KEY = 'office_tracker_vp_reminder_last_date';

interface ShownNotification {
  title: string;
  options?: NotificationOptions;
}

let shown: ShownNotification[];
let requestPermissionResult: NotificationPermission;

function stubNotification(permission: NotificationPermission) {
  shown = [];
  requestPermissionResult = 'granted';
  class FakeNotification {
    static permission: NotificationPermission = permission;
    static requestPermission = vi.fn(async () => {
      FakeNotification.permission = requestPermissionResult;
      return requestPermissionResult;
    });
    constructor(title: string, options?: NotificationOptions) {
      shown.push({ title, options });
    }
  }
  vi.stubGlobal('Notification', FakeNotification);
  return FakeNotification;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Daily VP reminder in the running app', () => {
  it('sends one reminder at 07:00 when the quota is at risk (default 36% profile)', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 7, 0));
    stubNotification('granted');
    localStorage.setItem(ENABLED_KEY, '1');

    render(<App initialTodayStr="2026-10-21" />);

    expect(shown).toHaveLength(1);
    expect(shown[0].title).toBe('Office Tracker');
    expect(shown[0].options?.body).toContain('cuối tháng');
    expect(localStorage.getItem(LAST_DATE_KEY)).toBe('2026-10-21');

    // Re-checking later the same day must not repeat the reminder
    act(() => {
      vi.setSystemTime(new Date(2026, 9, 21, 15, 0));
      vi.advanceTimersByTime(60_000);
    });
    expect(shown).toHaveLength(1);
  });

  it('does not send before 07:00', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 6, 59));
    stubNotification('granted');
    localStorage.setItem(ENABLED_KEY, '1');

    render(<App initialTodayStr="2026-10-21" />);
    expect(shown).toHaveLength(0);

    act(() => {
      vi.setSystemTime(new Date(2026, 9, 21, 7, 0));
      vi.advanceTimersByTime(60_000);
    });
    expect(shown).toHaveLength(1);
  });

  it('sends only one reminder even when several reasons apply', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 7, 0));
    stubNotification('granted');
    localStorage.setItem(ENABLED_KEY, '1');
    localStorage.setItem(
      'office_tracker_state_v1',
      JSON.stringify({
        language: 'vi',
        profiles: createDefaultProfiles(),
        activeProfileId: 'profile-nab-staff',
        dayLogs: { '2026-10-21': 'planned' },
        monthlyCache: {},
      })
    );

    render(<App initialTodayStr="2026-10-21" />);

    expect(shown).toHaveLength(1);
    expect(shown[0].options?.body).toContain('cuối tháng');
  });

  it('stays silent on a weekend', () => {
    vi.setSystemTime(new Date(2026, 9, 24, 7, 0));
    stubNotification('granted');
    localStorage.setItem(ENABLED_KEY, '1');

    render(<App initialTodayStr="2026-10-24" />);
    expect(shown).toHaveLength(0);
  });

  it('does not send when the reminder is switched off', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 9, 0));
    stubNotification('granted');

    render(<App initialTodayStr="2026-10-21" />);
    expect(shown).toHaveLength(0);
  });
});

describe('VP reminder toggle in Settings', () => {
  it('asks for permission from the toggle and shows the enabled state', async () => {
    vi.setSystemTime(new Date(2026, 9, 21, 7, 0));
    const FakeNotification = stubNotification('default');

    render(<App initialTodayStr="2026-10-21" />);
    fireEvent.click(screen.getByTestId('tab-btn-settings'));

    const toggle = screen.getByTestId('btn-toggle-vp-reminder');
    expect(toggle).toHaveTextContent('Bật nhắc lên VP');

    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(FakeNotification.requestPermission).toHaveBeenCalledOnce();
    expect(screen.getByTestId('btn-toggle-vp-reminder')).toHaveTextContent('Đang bật');
    expect(localStorage.getItem(ENABLED_KEY)).toBe('1');
  });

  it('shows the blocked message when permission is denied', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 7, 0));
    stubNotification('denied');

    render(<App initialTodayStr="2026-10-21" />);
    fireEvent.click(screen.getByTestId('tab-btn-settings'));

    expect(screen.getByTestId('vp-reminder-blocked')).toBeInTheDocument();
    expect(screen.getByTestId('btn-toggle-vp-reminder')).toBeDisabled();
  });

  it('shows the unsupported message when the Notification API is missing', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 7, 0));

    render(<App initialTodayStr="2026-10-21" />);
    fireEvent.click(screen.getByTestId('tab-btn-settings'));

    expect(screen.getByTestId('vp-reminder-unsupported')).toBeInTheDocument();
    expect(screen.getByTestId('btn-toggle-vp-reminder')).toBeDisabled();
  });

  it('turns the reminder off again', async () => {
    vi.setSystemTime(new Date(2026, 9, 21, 7, 0));
    stubNotification('granted');
    localStorage.setItem(ENABLED_KEY, '1');

    render(<App initialTodayStr="2026-10-21" />);
    fireEvent.click(screen.getByTestId('tab-btn-settings'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-toggle-vp-reminder'));
    });

    expect(screen.getByTestId('btn-toggle-vp-reminder')).toHaveTextContent('Bật nhắc lên VP');
    expect(localStorage.getItem(ENABLED_KEY)).toBe('0');
  });
});
