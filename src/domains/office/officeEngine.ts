import type {
  CalendarDayCell,
  DayLogMap,
  EditableDayStatus,
  EmployeeProfile,
  HolidayItem,
  MainButtonVariant,
  MonthlyMeasurementCache,
  MonthlyProgressMetrics,
  WeekdayKey,
  WeekdaySettingState,
} from './types';
import { WEEKDAY_ORDER } from './types';

/** Bump when the built-in holiday list changes so cached months are re-measured. */
export const HOLIDAY_SOURCE_VERSION = 3;

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function createDefaultWeeklySchedule(): Record<WeekdayKey, WeekdaySettingState> {
  return {
    mon: 'work',
    tue: 'work',
    wed: 'work',
    thu: 'work',
    fri: 'work',
    sat: 'off',
    sun: 'off',
  };
}

export function createDefaultProfiles(): EmployeeProfile[] {
  return [
    {
      id: 'profile-nab-staff',
      name: 'Nhân viên NAB',
      calculationMethod: 'monthly',
      minRequirementPercent: 36,
      weeklySchedule: createDefaultWeeklySchedule(),
      note: 'Hồ sơ mặc định Nhân viên NAB: Tính theo tháng, tối thiểu 36% số ngày làm việc.',
    },
    {
      id: 'profile-nab-manager',
      name: 'Quản lý NAB',
      calculationMethod: 'monthly',
      minRequirementPercent: 55,
      weeklySchedule: createDefaultWeeklySchedule(),
      note: 'Hồ sơ mặc định Quản lý NAB: Tính theo tháng, tối thiểu 55% số ngày làm việc.',
    },
  ];
}

export function cycleWeekdayState(current: WeekdaySettingState): WeekdaySettingState {
  if (current === 'off') return 'work';
  if (current === 'work') return 'office';
  return 'off';
}

export function serializeWeeklySchedule(schedule: Record<WeekdayKey, WeekdaySettingState>): string {
  return WEEKDAY_ORDER.map((k) => `${k}:${schedule[k]}`).join('|');
}

export function shouldRemeasureMonth(
  cache: MonthlyMeasurementCache | undefined,
  currentSchedule: Record<WeekdayKey, WeekdaySettingState>,
  nowMs: number
): boolean {
  if (!cache) return true;
  if ((cache.holidaySourceVersion ?? 0) < HOLIDAY_SOURCE_VERSION) return true;
  if (cache.weeklyScheduleHash !== serializeWeeklySchedule(currentSchedule)) return true;
  if (nowMs - cache.measuredAt > THIRTY_DAYS_MS) return true;
  return false;
}

export function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getWeekdayKeyFromDate(date: Date): WeekdayKey {
  const jsDay = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const map: Record<number, WeekdayKey> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };
  return map[jsDay];
}

export function getDaysInMonthCount(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function calculateMonthlyWorkingDays(
  year: number,
  month: number,
  schedule: Record<WeekdayKey, WeekdaySettingState>,
  holidays: HolidayItem[]
): number {
  const monthPrefix = `${formatMonthKey(year, month)}-`;
  const holidayDates = new Set(holidays.filter((h) => h.date.startsWith(monthPrefix)).map((h) => h.date));
  const totalDays = getDaysInMonthCount(year, month);
  let workingDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month - 1, day);
    const weekdayKey = getWeekdayKeyFromDate(dateObj);
    const settingState = schedule[weekdayKey];
    const dateStr = formatDateStr(year, month, day);

    if (settingState !== 'off' && !holidayDates.has(dateStr)) {
      workingDays++;
    }
  }

  return workingDays;
}

export function calculateRequiredOfficeDays(profile: EmployeeProfile, effectiveWorkingDays: number): number {
  if (effectiveWorkingDays <= 0) return 0;
  const ratio = Math.max(0, Math.min(100, profile.minRequirementPercent)) / 100;

  if (profile.calculationMethod === 'weekly') {
    const workingDaysPerWeek = WEEKDAY_ORDER.filter((k) => profile.weeklySchedule[k] !== 'off').length;
    if (workingDaysPerWeek === 0) return 0;
    const weeklyTarget = Math.ceil(workingDaysPerWeek * ratio);
    return Math.ceil((effectiveWorkingDays / workingDaysPerWeek) * weeklyTarget);
  }

  return Math.ceil(effectiveWorkingDays * ratio);
}

export function resolveMainButtonState(
  remainingRequiredDays: number,
  remainingWorkingDaysInMonth: number,
  isTodayPriorityOfficeDay: boolean
): MainButtonVariant {
  if (remainingRequiredDays > remainingWorkingDaysInMonth) {
    return 'danger';
  }
  if (remainingRequiredDays > 0 && remainingRequiredDays === remainingWorkingDaysInMonth) {
    return 'warning';
  }
  if (isTodayPriorityOfficeDay) {
    return 'priority';
  }
  return 'normal';
}

export function buildMonthCalendarDays(
  year: number,
  month: number,
  profile: EmployeeProfile,
  holidays: HolidayItem[],
  dayLogs: DayLogMap,
  todayStr: string,
  lockdownDates: readonly string[] = []
): CalendarDayCell[] {
  const lockdown = new Set(lockdownDates);
  const totalDays = getDaysInMonthCount(year, month);
  const holidayMap = new Map<string, HolidayItem>();
  for (const h of holidays) {
    holidayMap.set(h.date, h);
  }

  const cells: CalendarDayCell[] = [];
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = formatDateStr(year, month, day);
    const dateObj = new Date(year, month - 1, day);
    const weekdayKey = getWeekdayKeyFromDate(dateObj);
    const settingState = profile.weeklySchedule[weekdayKey];
    const holiday = holidayMap.get(dateStr);

    if (holiday) {
      cells.push({
        dateStr,
        dayOfMonth: day,
        weekdayKey,
        effectiveState: 'holiday',
        color: 'gray',
        isEditable: false,
        isPlanned: false,
        isUpcoming: false,
        isPriorityDay: false,
        holidayNameVi: holiday.nameVi,
        holidayNameEn: holiday.nameEn,
      });
      continue;
    }

    if (settingState === 'off') {
      cells.push({
        dateStr,
        dayOfMonth: day,
        weekdayKey,
        effectiveState: 'off',
        color: 'gray',
        isEditable: false,
        isPlanned: false,
        isUpcoming: false,
        isPriorityDay: false,
      });
      continue;
    }

    const isLockdown = lockdown.has(dateStr);
    let rawOverride = dayLogs[dateStr];
    // Office closed: only leave or remote is possible.
    if (isLockdown && (rawOverride === 'office' || rawOverride === 'planned')) rawOverride = 'work';
    // Planned days that were never confirmed fall back to remote once the day has passed.
    // Legacy future 'office' entries count as planned.
    const isUpcoming = dateStr > todayStr;
    const override: EditableDayStatus | undefined =
      rawOverride === 'planned' && dateStr < todayStr ? 'work' : rawOverride;
    const planned =
      override === 'planned' || (override === 'office' && isUpcoming);
    const isPriorityDay = settingState === 'office';

    if (override === 'leave') {
      cells.push({
        dateStr,
        dayOfMonth: day,
        weekdayKey,
        effectiveState: 'leave',
        color: 'gray',
        isEditable: true,
        isPlanned: false,
        isUpcoming,
        isPriorityDay,
        isLockdown,
      });
    } else if (override === 'office' || override === 'planned') {
      cells.push({
        dateStr,
        dayOfMonth: day,
        weekdayKey,
        effectiveState: 'office',
        color: 'green',
        isEditable: true,
        isPlanned: planned,
        isUpcoming,
        isPriorityDay,
        isLockdown,
      });
    } else {
      cells.push({
        dateStr,
        dayOfMonth: day,
        weekdayKey,
        effectiveState: 'work',
        color: 'yellow',
        isEditable: true,
        isPlanned: false,
        isRemoteConfirmed: override === 'remote',
        isUpcoming,
        isPriorityDay,
        isLockdown,
      });
    }
  }

  return cells;
}

export function calculateMonthlyProgress(
  year: number,
  month: number,
  profile: EmployeeProfile,
  measuredWorkingDays: number,
  holidays: HolidayItem[],
  dayLogs: DayLogMap,
  todayStr: string,
  lockdownDates: readonly string[] = []
): MonthlyProgressMetrics {
  const cells = buildMonthCalendarDays(year, month, profile, holidays, dayLogs, todayStr, lockdownDates);

  const leaveDaysCount = cells.filter((c) => c.effectiveState === 'leave').length;
  const effectiveWorkingDays = Math.max(0, measuredWorkingDays - leaveDaysCount);
  const requiredOfficeDays = calculateRequiredOfficeDays(profile, effectiveWorkingDays);

  const attendedOfficeDays = cells.filter((c) => c.effectiveState === 'office' && !c.isPlanned).length;
  const plannedOfficeDays = cells.filter((c) => c.effectiveState === 'office' && c.isPlanned).length;

  const remainingRequiredDays = Math.max(0, requiredOfficeDays - attendedOfficeDays);
  const remainingWorkingDaysInMonth = cells.filter(
    (c) => c.isEditable && !c.isLockdown && !c.isRemoteConfirmed && c.dateStr >= todayStr && c.effectiveState !== 'leave' && !(c.dateStr === todayStr && c.effectiveState === 'office' && !c.isPlanned)
  ).length;

  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
  const todayWeekday = getWeekdayKeyFromDate(new Date(tYear, tMonth - 1, tDay));
  const todayCell = cells.find((c) => c.dateStr === todayStr);
  const isTodayPriorityOfficeDay =
    profile.weeklySchedule[todayWeekday] === 'office' || !!todayCell?.isPlanned;

  const buttonVariant = resolveMainButtonState(
    remainingRequiredDays,
    remainingWorkingDaysInMonth,
    isTodayPriorityOfficeDay
  );

  return {
    workingDaysInMonth: measuredWorkingDays,
    leaveDaysCount,
    effectiveWorkingDays,
    requiredOfficeDays,
    attendedOfficeDays,
    plannedOfficeDays,
    remainingRequiredDays,
    remainingWorkingDaysInMonth,
    buttonVariant,
  };
}

export type PlanStrategy = 'priority' | 'start' | 'end';

/**
 * Distributes the remaining required office days over working days from today
 * onward according to the strategy. Returns the day statuses to write:
 * chosen days become 'planned', previously planned days not chosen revert to 'work'.
 */
export function planOfficeDays(
  cells: CalendarDayCell[],
  requiredOfficeDays: number,
  attendedOfficeDays: number,
  strategy: PlanStrategy,
  todayStr: string
): Record<string, EditableDayStatus> {
  const candidates = cells.filter(
    (c) =>
      c.isEditable &&
      !c.isLockdown &&
      !c.isRemoteConfirmed &&
      c.dateStr >= todayStr &&
      c.effectiveState !== 'leave' &&
      !(c.effectiveState === 'office' && !c.isPlanned)
  );
  const remaining = Math.max(0, requiredOfficeDays - attendedOfficeDays);

  let ordered = [...candidates];
  if (strategy === 'end') {
    ordered.reverse();
  } else if (strategy === 'priority') {
    ordered = [
      ...candidates.filter((c) => c.isPriorityDay),
      ...candidates.filter((c) => !c.isPriorityDay),
    ];
  }

  const chosen = new Set(ordered.slice(0, remaining).map((c) => c.dateStr));
  const updates: Record<string, EditableDayStatus> = {};
  for (const c of candidates) {
    if (chosen.has(c.dateStr)) updates[c.dateStr] = 'planned';
    else if (c.isPlanned) updates[c.dateStr] = 'work';
  }
  return updates;
}

/** Tap cycle: past work→office→leave; today work→planned→office→leave; future work→planned→leave. */
export function cycleDayStatus(
  current: EditableDayStatus,
  dateStr: string,
  todayStr: string
): EditableDayStatus {
  if (current === 'remote') current = 'work'; // confirmed remote re-opens like an open remote day
  if (dateStr < todayStr) {
    return current === 'work' ? 'office' : current === 'office' ? 'leave' : 'work';
  }
  if (dateStr === todayStr) {
    if (current === 'work') return 'planned';
    if (current === 'planned') return 'office';
    return current === 'office' ? 'leave' : 'work';
  }
  if (current === 'work') return 'planned';
  return current === 'planned' ? 'leave' : 'work';
}

/** Locked day cycle: only leave <-> remote work. */
export function cycleLockdownDayStatus(current: EditableDayStatus): EditableDayStatus {
  return current === 'leave' ? 'work' : 'leave';
}

/** Adds dates (never in the past) to the sorted, de-duplicated lockdown list. */
export function addLockdownDates(
  existing: readonly string[],
  toAdd: readonly string[],
  todayStr: string
): string[] {
  const set = new Set(existing);
  for (const d of toAdd) if (d >= todayStr) set.add(d);
  return Array.from(set).sort();
}

export interface UpcomingOffDay {
  date: string; // 'YYYY-MM-DD'
  kind: 'holiday' | 'leave' | 'lockdown';
  nameVi?: string;
  nameEn?: string;
}

/**
 * Every upcoming day (today onward, any month) the user will not be in the office:
 * lockdown days, public holidays and leave days. One entry per date, lockdown first,
 * then holiday, then leave. Leave on a weekly off day is not a real leave day.
 */
export function listUpcomingOffDays(
  todayStr: string,
  schedule: Record<WeekdayKey, WeekdaySettingState>,
  dayLogs: DayLogMap,
  lockdownDates: readonly string[],
  holidays: readonly HolidayItem[]
): UpcomingOffDay[] {
  const byDate = new Map<string, UpcomingOffDay>();
  for (const d of lockdownDates) {
    if (d >= todayStr) byDate.set(d, { date: d, kind: 'lockdown' });
  }
  for (const h of holidays) {
    if (h.date >= todayStr && !byDate.has(h.date)) {
      byDate.set(h.date, { date: h.date, kind: 'holiday', nameVi: h.nameVi, nameEn: h.nameEn });
    }
  }
  for (const [date, status] of Object.entries(dayLogs)) {
    if (status !== 'leave' || date < todayStr || byDate.has(date)) continue;
    const [y, m, d] = date.split('-').map(Number);
    if (schedule[getWeekdayKeyFromDate(new Date(y, m - 1, d))] === 'off') continue;
    byDate.set(date, { date, kind: 'leave' });
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
