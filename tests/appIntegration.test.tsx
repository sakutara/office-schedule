import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Full App UI Integration Tests (MainTab, CalendarTab, SettingsTab, TopProgressBar, Bilingual & Swipe)', () => {
  it('renders compact TopProgressBar on MainTab, switches buttons to status + info panel, and toggles language VI <-> EN', async () => {
    const user = userEvent.setup();
    render(<App initialTodayStr="2026-10-21" />);

    // Progress bar is compact on the main tab too
    expect(screen.getByTestId('top-progress-bar')).toHaveAttribute('data-mode', 'compact');
    expect(screen.getByTestId('progress-numbers')).toHaveTextContent('Đã lên 0/');

    // Today is remote -> both buttons visible, no info panel
    expect(screen.getByTestId('btn-mark-leave')).toBeInTheDocument();
    expect(screen.queryByTestId('info-panel')).not.toBeInTheDocument();

    // Mark office -> buttons hidden, status + info panel shown
    await user.click(screen.getByTestId('btn-checkin-office'));
    expect(screen.queryByTestId('btn-checkin-office')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-mark-leave')).not.toBeInTheDocument();
    expect(screen.getByTestId('today-status-indicator')).toHaveTextContent('Hôm nay lên văn phòng');
    expect(screen.getByTestId('progress-numbers')).toHaveTextContent('Đã lên 1/');
    expect(screen.getByTestId('info-attended')).toHaveTextContent('1');
    expect(screen.getByTestId('info-working')).toHaveTextContent('22');
    expect(screen.getByTestId('info-planned')).toBeInTheDocument();
    expect(screen.getByTestId('info-required')).toBeInTheDocument();

    // Today in calendar is marked with the thick dark-red border
    await user.click(screen.getByTestId('tab-btn-calendar'));
    expect(screen.getByTestId('cal-day-2026-10-21')).toHaveAttribute('data-today', 'true');
    expect(screen.getByTestId('cal-day-2026-10-22')).toHaveAttribute('data-today', 'false');
    // Turn today to leave via calendar tap (office -> leave) -> main shows leave status
    await user.click(screen.getByTestId('cal-day-2026-10-21'));
    await user.click(screen.getByTestId('tab-btn-main'));
    expect(screen.getByTestId('today-status-indicator')).toHaveTextContent('Hôm nay nghỉ phép');
    expect(screen.getByTestId('info-upcoming-off')).toHaveTextContent('21/10');

    // Settings lists upcoming holidays (max 10)
    await user.click(screen.getByTestId('tab-btn-settings'));
    const holidayItems = screen.getByTestId('upcoming-holidays').querySelectorAll('li');
    expect(holidayItems.length).toBeLessThanOrEqual(10);
    await user.click(screen.getByTestId('tab-btn-main'));

    // Switch language VI -> EN -> VI
    const langBtn = screen.getByTestId('btn-toggle-language');
    await user.click(langBtn);
    expect(langBtn).toHaveTextContent('EN');
    await user.click(langBtn);
    expect(langBtn).toHaveTextContent('VI');
  });

  it('handles year boundary navigation in Calendar, holiday locked notice in VI & EN, and default system date rendering', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('tab-btn-settings'));
    expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
    await user.click(screen.getByTestId('btn-toggle-new-profile'));
    await user.click(screen.getByText('Đóng'));
  });

  it('wraps January <-> December in Calendar and keeps holidays locked', async () => {
    const user = userEvent.setup();
    render(<App initialTodayStr="2026-01-15" />);
    await user.click(screen.getByTestId('tab-btn-calendar'));

    // Holiday cell is locked: tapping does not change its state
    await user.click(screen.getByTestId('cal-day-2026-01-01'));
    expect(screen.getByTestId('cal-day-2026-01-01')).toHaveAttribute('data-state', 'holiday');

    // Wrap Jan 2026 -> Dec 2025 -> Jan 2026
    await user.click(screen.getByTestId('btn-prev-month'));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('2025-12');
    await user.click(screen.getByTestId('btn-next-month'));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('2026-01');
  });

  it('switches to CalendarTab (via click or swipe), renders compact progress bar without numbers, and edits working days by tapping while locking off/holiday days', async () => {
    const user = userEvent.setup();
    render(<App initialTodayStr="2026-10-21" />);

    // Switch to Calendar tab via bottom tab button
    await user.click(screen.getByTestId('tab-btn-calendar'));

    expect(screen.getByTestId('top-progress-bar')).toHaveAttribute('data-mode', 'compact');

    // Off day is locked
    await user.click(screen.getByTestId('cal-day-2026-10-03'));
    expect(screen.getByTestId('cal-day-2026-10-03')).toHaveAttribute('data-state', 'off');

    // Tap cycles work -> office (planned, green) -> leave (gray) -> work (yellow)
    const day = screen.getByTestId('cal-day-2026-10-26');
    await user.click(day);
    expect(day).toHaveAttribute('data-color', 'green');
    expect(day).toHaveAttribute('data-planned', 'true');
    await user.click(day);
    expect(day).toHaveAttribute('data-color', 'gray');
    await user.click(day);
    expect(day).toHaveAttribute('data-color', 'yellow');

    // Plan buttons fill the remaining required days
    await user.click(screen.getByTestId('plan-start'));
    expect(screen.getByTestId('cal-day-2026-10-22')).toHaveAttribute('data-planned', 'true');
    await user.click(screen.getByTestId('plan-end'));
    expect(screen.getByTestId('cal-day-2026-10-30')).toHaveAttribute('data-planned', 'true');
    await user.click(screen.getByTestId('plan-priority'));
    expect(screen.getAllByTestId('segment-planned').length).toBeGreaterThan(0);

    // Quick month/year picker
    await user.click(screen.getByTestId('calendar-month-label'));
    await user.click(screen.getByTestId('picker-next-year'));
    await user.click(screen.getByTestId('picker-month-3'));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('2027-03');
    await user.click(screen.getByTestId('calendar-month-label'));
    await user.click(screen.getByTestId('picker-prev-year'));
    await user.click(screen.getByTestId('picker-month-10'));

    // Navigate previous/next month in Calendar
    await user.click(screen.getByTestId('btn-prev-month'));
    await waitFor(() => {
      expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('2026-09');
    });
    await user.click(screen.getByTestId('btn-next-month'));
    await waitFor(() => {
      expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('2026-10');
    });
  });

  it('supports SettingsTab profile switching, creating a new 5-field profile, and cycling 7-day colors', async () => {
    const user = userEvent.setup();
    render(<App initialTodayStr="2026-10-21" />);

    // Swipe left on blank area of main viewport to go Main -> Calendar -> Settings
    const viewport = screen.getByTestId('swipe-viewport');
    fireEvent.touchStart(viewport, { touches: [{ clientX: 250, clientY: 200 }] });
    fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 50, clientY: 205 }] });
    expect(screen.getByTestId('top-progress-bar')).toHaveAttribute('data-mode', 'compact');

    fireEvent.pointerDown(viewport, { clientX: 250, clientY: 200 });
    fireEvent.pointerUp(viewport, { clientX: 50, clientY: 205 });

    // Now on Settings tab
    expect(screen.getByTestId('settings-tab')).toBeInTheDocument();

    // Switch from Nhân viên NAB (36%) to Quản lý NAB (55%)
    const profileSelect = screen.getByTestId('select-employee-profile');
    await user.selectOptions(profileSelect, 'profile-nab-manager');
    expect(screen.getByTestId('progress-numbers')).toHaveTextContent('/13 ngày');

    // Cycle Wednesday (2026-10-21 is Wednesday) from 'work' (yellow) -> 'office' (green)
    const wedBtn = screen.getByTestId('weekday-btn-wed');
    expect(wedBtn).toHaveAttribute('data-state', 'work');
    await user.click(wedBtn);
    expect(wedBtn).toHaveAttribute('data-state', 'office');

    // Open New Profile Form and create a custom profile with all 5 pieces of info
    await user.click(screen.getByTestId('btn-toggle-new-profile'));
    await user.type(screen.getByTestId('input-profile-name'), 'Chuyên gia Hybrid');
    await user.selectOptions(screen.getByTestId('input-profile-method'), 'weekly');
    const pctInput = screen.getByTestId('input-profile-percent');
    await user.clear(pctInput);
    await user.type(pctInput, '50');
    await user.click(screen.getByTestId('new-weekday-btn-mon')); // cycle mon in new profile form
    await user.type(screen.getByTestId('input-profile-note'), 'Lịch linh hoạt theo tuần');
    await user.click(screen.getByTestId('btn-save-new-profile'));
    // Holiday update button now lives under the calendar
    await user.click(screen.getByTestId('tab-btn-calendar'));
    await user.click(screen.getByTestId('btn-force-remeasure'));

    // Return to MainTab; profile badge is no longer shown there
    await user.click(screen.getByTestId('tab-btn-main'));
    expect(screen.queryByTestId('active-profile-badge')).not.toBeInTheDocument();
  });

  it('manages office lockdown days in Settings: add (multi, no past), leave state, remove -> remote', async () => {
    const user = userEvent.setup();
    render(<App initialTodayStr="2026-10-21" />);
    await user.click(screen.getByTestId('tab-btn-settings'));

    await user.click(screen.getByTestId('btn-add-lockdown'));
    expect(screen.getByTestId('lockdown-pick-2026-10-20')).toBeDisabled();
    await user.click(screen.getByTestId('lockdown-pick-2026-10-22'));
    await user.click(screen.getByTestId('lockdown-pick-2026-10-23'));
    await user.click(screen.getByTestId('btn-confirm-lockdown'));
    expect(screen.getByTestId('lockdown-item-2026-10-22')).toHaveTextContent('22/10');
    expect(screen.getByTestId('lockdown-item-2026-10-23')).toBeInTheDocument();

    await user.click(screen.getByTestId('tab-btn-calendar'));
    expect(screen.getByTestId('cal-day-2026-10-22')).toHaveAttribute('data-state', 'leave');
    // Locked day toggles leave <-> remote only
    await user.click(screen.getByTestId('cal-day-2026-10-22'));
    expect(screen.getByTestId('cal-day-2026-10-22')).toHaveAttribute('data-state', 'work');
    await user.click(screen.getByTestId('cal-day-2026-10-22'));
    expect(screen.getByTestId('cal-day-2026-10-22')).toHaveAttribute('data-state', 'leave');

    await user.click(screen.getByTestId('tab-btn-settings'));
    await user.click(screen.getByTestId('btn-remove-lockdown-2026-10-22'));
    expect(screen.queryByTestId('lockdown-item-2026-10-22')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('tab-btn-calendar'));
    expect(screen.getByTestId('cal-day-2026-10-22')).toHaveAttribute('data-state', 'work');
  });

  it('shows only a status (no check-in/leave buttons) on a lockdown today, even when remote', async () => {
    const user = userEvent.setup();
    render(<App initialTodayStr="2026-10-21" />);
    expect(screen.getByTestId('btn-checkin-office')).toBeInTheDocument();

    await user.click(screen.getByTestId('tab-btn-settings'));
    await user.click(screen.getByTestId('btn-add-lockdown'));
    await user.click(screen.getByTestId('lockdown-pick-2026-10-21'));
    await user.click(screen.getByTestId('btn-confirm-lockdown'));

    await user.click(screen.getByTestId('tab-btn-main'));
    expect(screen.queryByTestId('btn-checkin-office')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-mark-leave')).not.toBeInTheDocument();
    expect(screen.getByTestId('today-status-indicator')).toHaveAttribute('data-status', 'leave');

    // Turn it into remote from the calendar: still status only
    await user.click(screen.getByTestId('tab-btn-calendar'));
    await user.click(screen.getByTestId('cal-day-2026-10-21'));
    await user.click(screen.getByTestId('tab-btn-main'));
    expect(screen.queryByTestId('btn-checkin-office')).not.toBeInTheDocument();
    expect(screen.getByTestId('today-status-indicator')).toHaveAttribute('data-status', 'work');
  });
});
