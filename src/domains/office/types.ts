import type { LanguageCode } from '../i18n';

export type CalculationMethod = 'monthly' | 'weekly';

/**
 * 7-day editor states in Settings:
 * - 'off': Gray (ngày nghỉ)
 * - 'work': Light yellow (làm ở nhà)
 * - 'office': Green (ngày ưu tiên lên VP)
 */
export type WeekdaySettingState = 'off' | 'work' | 'office';

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const WEEKDAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * Employee Profile ("Loại nhân viên") with 5 pieces of information:
 * 1. name: Tên nhu cầu
 * 2. calculationMethod: Phương pháp tính ('monthly' | 'weekly')
 * 3. minRequirementPercent: Yêu cầu tối thiểu (x%)
 * 4. weeklySchedule: Cấu hình 7 ngày trong tuần
 * 5. note: Ghi chú / mô tả
 */
export interface EmployeeProfile {
  id: string;
  name: string;
  calculationMethod: CalculationMethod;
  minRequirementPercent: number;
  weeklySchedule: Record<WeekdayKey, WeekdaySettingState>;
  note: string;
}

export interface HolidayItem {
  date: string; // 'YYYY-MM-DD'
  nameVi: string;
  nameEn: string;
}

export interface MonthlyMeasurementCache {
  monthKey: string; // 'YYYY-MM'
  workingDaysCount: number;
  holidays: HolidayItem[];
  weeklyScheduleHash: string;
  measuredAt: number; // epoch ms
  holidaySourceVersion?: number; // bump HOLIDAY_SOURCE_VERSION to force re-measure
}

/** 'planned' = dự kiến lên VP; becomes remote ('work') once its day has passed unconfirmed. */
export type EditableDayStatus = 'work' | 'planned' | 'office' | 'leave';
export type DayLogMap = Record<string, EditableDayStatus>;

export type EffectiveDayState = 'off' | 'holiday' | 'leave' | 'work' | 'office';
export type CalendarDayColor = 'gray' | 'yellow' | 'green';

export interface CalendarDayCell {
  dateStr: string; // 'YYYY-MM-DD'
  dayOfMonth: number;
  weekdayKey: WeekdayKey;
  effectiveState: EffectiveDayState;
  color: CalendarDayColor;
  isEditable: boolean;
  isPlanned: boolean;
  isUpcoming: boolean; // editable day after today
  isLockdown?: boolean; // office closed: cannot be office/planned
  isPriorityDay: boolean;
  holidayNameVi?: string;
  holidayNameEn?: string;
}

/**
 * Main button visual alert states:
 * - 'normal': Green (Bình thường)
 * - 'priority': Dark Green (Ngày ưu tiên lên VP)
 * - 'warning': Orange (Số ngày cần lên VP == số ngày làm việc còn lại)
 * - 'danger': Red (Số ngày cần lên VP > số ngày làm việc còn lại)
 */
export type MainButtonVariant = 'normal' | 'priority' | 'warning' | 'danger';

export interface MonthlyProgressMetrics {
  workingDaysInMonth: number;
  leaveDaysCount: number;
  effectiveWorkingDays: number;
  requiredOfficeDays: number;
  attendedOfficeDays: number;
  plannedOfficeDays: number;
  remainingRequiredDays: number;
  remainingWorkingDaysInMonth: number;
  buttonVariant: MainButtonVariant;
}

export interface AppPersistedState {
  language: LanguageCode;
  profiles: EmployeeProfile[];
  activeProfileId: string;
  dayLogs: DayLogMap;
  monthlyCache: Record<string, MonthlyMeasurementCache>;
  /** Office lockdown: 'YYYY-MM-DD' dates the office is closed (leave by default, remote at most). */
  lockdownDates: string[];
}
