import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createDefaultProfiles,
  createDefaultWeeklySchedule,
  cycleWeekdayState,
  serializeWeeklySchedule,
  shouldRemeasureMonth,
  calculateMonthlyWorkingDays,
  calculateRequiredOfficeDays,
  resolveMainButtonState,
  buildMonthCalendarDays,
  calculateMonthlyProgress,
  formatMonthKey,
  getWeekdayKeyFromDate,
  planOfficeDays,
  cycleDayStatus,
  HOLIDAY_SOURCE_VERSION,
  addLockdownDates,
  cycleLockdownDayStatus,
  listUpcomingOffDays,
} from '../src/domains/office/officeEngine';
import { getBuiltInVietnamHolidays, setHolidayData } from '../src/domains/office/vietnamHolidays';
import type { HolidayData } from '../src/domains/office/vietnamHolidays';
import type { DayLogMap, MonthlyMeasurementCache } from '../src/domains/office/types';

describe('EPIC-01: Employee Profiles, 7-Day Schedule & Holiday Working Day Measurement', () => {
  it('provides 2 default profiles (Nhân viên NAB 36% & Quản lý NAB 55%) with 5 fields and Mon-Fri working default', () => {
    const profiles = createDefaultProfiles();
    expect(profiles).toHaveLength(2);

    const staff = profiles[0];
    expect(staff.name).toBe('Nhân viên NAB');
    expect(staff.calculationMethod).toBe('monthly');
    expect(staff.minRequirementPercent).toBe(36);
    expect(staff.weeklySchedule).toEqual({
      mon: 'work',
      tue: 'work',
      wed: 'work',
      thu: 'work',
      fri: 'work',
      sat: 'off',
      sun: 'off',
    });
    expect(staff.note.length).toBeGreaterThan(0);

    const manager = profiles[1];
    expect(manager.name).toBe('Quản lý NAB');
    expect(manager.calculationMethod).toBe('monthly');
    expect(manager.minRequirementPercent).toBe(55);
  });

  it('cycles 7-day state: off (gray) -> work (yellow) -> office (green) -> off', () => {
    expect(cycleWeekdayState('off')).toBe('work');
    expect(cycleWeekdayState('work')).toBe('office');
    expect(cycleWeekdayState('office')).toBe('off');
  });

  it('determines when monthly working days must be remeasured (missing, schedule changed, or > 30 days old)', () => {
    const schedule = createDefaultWeeklySchedule();
    const hash = serializeWeeklySchedule(schedule);
    const now = Date.now();

    // 1. Missing cache -> true
    expect(shouldRemeasureMonth(undefined, schedule, now)).toBe(true);

    const validCache: MonthlyMeasurementCache = {
      monthKey: '2026-10',
      workingDaysCount: 22,
      holidays: [],
      weeklyScheduleHash: hash,
      measuredAt: now - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      holidaySourceVersion: HOLIDAY_SOURCE_VERSION,
    };

    // Valid cache -> false
    expect(shouldRemeasureMonth(validCache, schedule, now)).toBe(false);

    // 2. Weekly schedule changed -> true
    const modifiedSchedule = { ...schedule, fri: 'off' as const };
    expect(shouldRemeasureMonth(validCache, modifiedSchedule, now)).toBe(true);

    // 3. Cache older than 30 days -> true
    const expiredCache: MonthlyMeasurementCache = {
      ...validCache,
      measuredAt: now - 31 * 24 * 60 * 60 * 1000,
    };
    expect(shouldRemeasureMonth(expiredCache, schedule, now)).toBe(true);
  });

  it('calculates working days in month subtracting Vietnam public holidays on working weekdays', () => {
    const schedule = createDefaultWeeklySchedule();
    // September 2026 has 30 days: 22 Mon-Fri weekdays.
    // Vietnam National Day holidays: 2026-09-01 (Tue) & 2026-09-02 (Wed) -> 22 - 2 = 20 working days
    const holidays = getBuiltInVietnamHolidays(2026);
    const sepWorkingDays = calculateMonthlyWorkingDays(2026, 9, schedule, holidays);
    expect(sepWorkingDays).toBe(20);

    // October 2026 has 31 days: 22 Mon-Fri weekdays, 0 public holidays -> 22 working days
    const octWorkingDays = calculateMonthlyWorkingDays(2026, 10, schedule, holidays);
    expect(octWorkingDays).toBe(22);

    // Fallback year outside explicit lunar map still returns fixed solar holidays
    const fallbackHolidays = getBuiltInVietnamHolidays(2035);
    expect(fallbackHolidays.some((h) => h.date === '2035-09-02')).toBe(true);
  });

  it('calculates required office days for both monthly and weekly profile calculation methods', () => {
    const [staff, manager] = createDefaultProfiles();
    // 22 working days * 36% = 7.92 -> ceil = 8 days
    expect(calculateRequiredOfficeDays(staff, 22)).toBe(8);
    // 22 working days * 55% = 12.1 -> ceil = 13 days
    expect(calculateRequiredOfficeDays(manager, 22)).toBe(13);

    // Weekly method: e.g. 40% of 5 days/week = 2 days/week -> across 20 working days (4 weeks) = 8 days
    const weeklyProfile = {
      ...staff,
      calculationMethod: 'weekly' as const,
      minRequirementPercent: 40,
    };
    expect(calculateRequiredOfficeDays(weeklyProfile, 20)).toBe(8);

    // Edge case: 0 working days or all off days in schedule
    expect(calculateRequiredOfficeDays(staff, 0)).toBe(0);
    const allOffProfile = {
      ...weeklyProfile,
      weeklySchedule: {
        mon: 'off' as const,
        tue: 'off' as const,
        wed: 'off' as const,
        thu: 'off' as const,
        fri: 'off' as const,
        sat: 'off' as const,
        sun: 'off' as const,
      },
    };
    expect(calculateRequiredOfficeDays(allOffProfile, 10)).toBe(0);
  });
});

describe('EPIC-02 & EPIC-03: Main Button Alert States, Progress Bar Metrics & Calendar Grid', () => {
  it('resolves the 4 Main Button states accurately (normal, priority, warning, danger)', () => {
    // Normal green
    expect(resolveMainButtonState(3, 5, false)).toBe('normal');
    // Priority dark green when today is priority office day and enough remaining days
    expect(resolveMainButtonState(3, 5, true)).toBe('priority');
    // Warning orange when remaining required == remaining working days (> 0)
    expect(resolveMainButtonState(4, 4, false)).toBe('warning');
    expect(resolveMainButtonState(4, 4, true)).toBe('warning');
    // Danger red when remaining required > remaining working days
    expect(resolveMainButtonState(5, 3, false)).toBe('danger');
    // When target already met (0 remaining required), never warning/danger
    expect(resolveMainButtonState(0, 0, false)).toBe('normal');
  });

  it('builds monthly calendar cells with gray/yellow/green colors, locks off/holiday days, and computes scenario metrics', () => {
    const [staff] = createDefaultProfiles();
    // Make Wednesday a priority office day in profile settings
    staff.weeklySchedule.wed = 'office';

    const holidays = getBuiltInVietnamHolidays(2026);
    const dayLogs: DayLogMap = {
      '2026-10-05': 'office', // Past attended office day
      '2026-10-06': 'leave', // Leave day
      '2026-10-20': 'work', // Explicit work day override
      '2026-10-26': 'office', // Future scenario office day (today is 2026-10-21)
    };

    const cells = buildMonthCalendarDays(2026, 10, staff, holidays, dayLogs, '2026-10-21');
    expect(cells).toHaveLength(31);

    // 2026-10-03 is Saturday -> off, gray, not editable
    const satCell = cells.find((c) => c.dateStr === '2026-10-03')!;
    expect(satCell.effectiveState).toBe('off');
    expect(satCell.color).toBe('gray');
    expect(satCell.isEditable).toBe(false);

    // 2026-10-05 is attended office -> orange, editable, not future scenario
    const attendedCell = cells.find((c) => c.dateStr === '2026-10-05')!;
    expect(attendedCell.effectiveState).toBe('office');
    expect(attendedCell.color).toBe('green');
    expect(attendedCell.isEditable).toBe(true);
    expect(attendedCell.isPlanned).toBe(false);

    // 2026-10-06 is leave -> gray, editable
    const leaveCell = cells.find((c) => c.dateStr === '2026-10-06')!;
    expect(leaveCell.effectiveState).toBe('leave');
    expect(leaveCell.color).toBe('gray');
    expect(leaveCell.isEditable).toBe(true);

    // 2026-10-26 is future office -> orange, editable, isPlanned = true
    const scenarioCell = cells.find((c) => c.dateStr === '2026-10-26')!;
    expect(scenarioCell.effectiveState).toBe('office');
    expect(scenarioCell.color).toBe('green');
    expect(scenarioCell.isPlanned).toBe(true);

    // Verify progress calculation for October 2026
    const progress = calculateMonthlyProgress(2026, 10, staff, 22, holidays, dayLogs, '2026-10-21');
    expect(progress.workingDaysInMonth).toBe(22);
    expect(progress.leaveDaysCount).toBe(1);
    expect(progress.effectiveWorkingDays).toBe(21);
    // ceil(21 * 0.36) = ceil(7.56) = 8
    expect(progress.requiredOfficeDays).toBe(8);
    expect(progress.attendedOfficeDays).toBe(1);
    expect(progress.plannedOfficeDays).toBe(1);
    // 2026-10-21 is Wednesday (priority office day in staff.weeklySchedule)
    expect(progress.buttonVariant).toBe('priority');

    expect(formatMonthKey(2026, 9)).toBe('2026-09');
    expect(getWeekdayKeyFromDate(new Date(2026, 9, 21))).toBe('wed');
  });
});

describe('planOfficeDays', () => {
  const profile = createDefaultProfiles()[0];
  const cells = buildMonthCalendarDays(2026, 10, profile, [], {}, '2026-10-21');

  it('plans from today onward by start, end, or priority', () => {
    const start = planOfficeDays(cells, 3, 0, 'start', '2026-10-21');
    expect(Object.keys(start)).toEqual(['2026-10-21', '2026-10-22', '2026-10-23']);
    expect(Object.values(start)).toEqual(['planned', 'planned', 'planned']);
    const end = planOfficeDays(cells, 2, 0, 'end', '2026-10-21');
    expect(Object.keys(end).sort()).toEqual(['2026-10-29', '2026-10-30']);
    expect(planOfficeDays(cells, 5, 5, 'start', '2026-10-21')).toEqual({});
  });

  it('cycles day status by time of day', () => {
    const today = '2026-10-21';
    expect(cycleDayStatus('work', '2026-10-05', today)).toBe('office');
    expect(cycleDayStatus('office', '2026-10-05', today)).toBe('leave');
    expect(cycleDayStatus('work', today, today)).toBe('planned');
    expect(cycleDayStatus('planned', today, today)).toBe('office');
    expect(cycleDayStatus('work', '2026-10-26', today)).toBe('planned');
    expect(cycleDayStatus('planned', '2026-10-26', today)).toBe('leave');
    expect(cycleDayStatus('leave', '2026-10-26', today)).toBe('work');
  });

  it('turns unconfirmed planned days into remote once the day has passed', () => {
    const logs: DayLogMap = { '2026-10-20': 'planned', '2026-10-21': 'planned' };
    const c = buildMonthCalendarDays(2026, 10, profile, [], logs, '2026-10-21');
    expect(c.find((x) => x.dateStr === '2026-10-20')!.effectiveState).toBe('work');
    expect(c.find((x) => x.dateStr === '2026-10-21')!.isPlanned).toBe(true);
  });
});

beforeAll(async () => {
  const mod = await import('../public/holidays/vn.json');
  setHolidayData(mod.default as HolidayData);
});
afterAll(() => setHolidayData(null));

describe('Vietnam holiday source & office lockdown', () => {
  it('reads 24/11 Culture Day from the external holiday file, not a hard-coded rule', () => {
    expect(getBuiltInVietnamHolidays(2026).some((h) => h.date === '2026-11-24')).toBe(true);
    expect(getBuiltInVietnamHolidays(2027).some((h) => h.date === '2027-11-24')).toBe(true);
    expect(getBuiltInVietnamHolidays(2025).some((h) => h.date === '2025-11-24')).toBe(false);
  });

  it('forces re-measure of caches made with an older holiday source', () => {
    const schedule = createDefaultWeeklySchedule();
    const now = Date.now();
    const old: MonthlyMeasurementCache = {
      monthKey: '2026-11', workingDaysCount: 21, holidays: [],
      weeklyScheduleHash: serializeWeeklySchedule(schedule), measuredAt: now,
    };
    expect(shouldRemeasureMonth(old, schedule, now)).toBe(true);
  });

  it('lockdown days can never be office/planned and are excluded from planning', () => {
    const profile = createDefaultProfiles()[0];
    const logs: DayLogMap = { '2026-10-26': 'office', '2026-10-27': 'planned' };
    const lock = ['2026-10-26', '2026-10-27'];
    const cells = buildMonthCalendarDays(2026, 10, profile, [], logs, '2026-10-21', lock);
    const c26 = cells.find((c) => c.dateStr === '2026-10-26')!;
    expect(c26.isLockdown).toBe(true);
    expect(c26.effectiveState).toBe('work');
    const plan = planOfficeDays(cells, 30, 0, 'start', '2026-10-21');
    expect(plan['2026-10-26']).toBeUndefined();
    expect(plan['2026-10-27']).toBeUndefined();
  });

  it('cycles lockdown days between leave and remote only, and rejects past dates', () => {
    expect(cycleLockdownDayStatus('leave')).toBe('work');
    expect(cycleLockdownDayStatus('work')).toBe('leave');
    expect(addLockdownDates(['2026-12-24'], ['2026-12-23', '2026-10-01'], '2026-10-21')).toEqual([
      '2026-12-23',
      '2026-12-24',
    ]);
  });
});

describe('listUpcomingOffDays', () => {
  it('lists holidays, leave and lockdown days across months, one entry per date, past excluded', () => {
    const schedule = createDefaultWeeklySchedule();
    const list = listUpcomingOffDays(
      '2026-10-21',
      schedule,
      { '2026-10-22': 'leave', '2026-10-24': 'leave', '2026-10-01': 'leave', '2026-11-24': 'leave' },
      ['2026-12-23', '2026-12-24', '2026-10-01'],
      [{ date: '2026-11-24', nameVi: 'Văn hoá', nameEn: 'Culture' }, { date: '2026-09-02', nameVi: 'x', nameEn: 'x' }]
    );
    expect(list.map((d) => `${d.date}:${d.kind}`)).toEqual([
      '2026-10-22:leave', // Sat 10-24 leave ignored (weekly off), past 10-01 dropped
      '2026-11-24:holiday', // holiday wins over leave
      '2026-12-23:lockdown',
      '2026-12-24:lockdown',
    ]);
  });
});
