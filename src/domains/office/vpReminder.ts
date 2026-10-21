import type { DayLogMap, EmployeeProfile, HolidayItem } from './types';
import {
  buildMonthCalendarDays,
  calculateMonthlyProgress,
} from './officeEngine';

/** Local hour (24h) at or after which the daily VP reminder is due. */
export const VP_REMINDER_HOUR = 7;

/**
 * Why today's VP reminder fires. Listed most-urgent first; only ONE notification is
 * sent per day, using the first matching reason.
 * - 'quota-at-risk': từ hôm nay tới cuối tháng, không lên VP liên tục sẽ thiếu chỉ tiêu
 * - 'planned-today': hôm nay là ngày dự kiến lên VP
 * - 'priority-quota-open': hôm nay là ngày ưu tiên lên VP và chưa đủ số ngày
 */
export type VpReminderReason = 'quota-at-risk' | 'planned-today' | 'priority-quota-open';

export interface MonthMeasurementInput {
  workingDaysCount: number;
  holidays: HolidayItem[];
}

/**
 * Returns the reasons (may be empty) that today's VP reminder should fire.
 * Uses the same calculation as the main-tab button so the reminder never disagrees with the UI.
 */
export function getVpReminderReasons(
  profile: EmployeeProfile,
  measurement: MonthMeasurementInput,
  dayLogs: DayLogMap,
  todayStr: string
): VpReminderReason[] {
  const [year, month] = todayStr.split('-').map(Number);
  const cells = buildMonthCalendarDays(
    year,
    month,
    profile,
    measurement.holidays,
    dayLogs,
    todayStr
  );
  const metrics = calculateMonthlyProgress(
    year,
    month,
    profile,
    measurement.workingDaysCount,
    measurement.holidays,
    dayLogs,
    todayStr
  );
  const today = cells.find((c) => c.dateStr === todayStr);

  // Only remind on days that can actually go to the office: an editable day that is either
  // still open ('work') or planned. Weekends, holidays, leave and confirmed office days are silent.
  const canGoToOffice = !!today && today.isEditable && (today.effectiveState === 'work' || today.isPlanned);
  if (!today || !canGoToOffice) return [];

  const reasons: VpReminderReason[] = [];
  if (metrics.remainingRequiredDays > 0 && metrics.remainingRequiredDays >= metrics.remainingWorkingDaysInMonth) {
    reasons.push('quota-at-risk');
  }
  if (today.isPlanned) {
    reasons.push('planned-today');
  }
  if (today.isPriorityDay && metrics.remainingRequiredDays > 0) {
    reasons.push('priority-quota-open');
  }

  return reasons;
}

/**
 * Due once per local day, from VP_REMINDER_HOUR onward.
 * `lastSentDate` is the 'YYYY-MM-DD' of the last evaluation, so a reminder is never repeated the same day.
 */
export function isVpReminderDue(now: Date, todayStr: string, lastSentDate: string | undefined): boolean {
  if (now.getHours() < VP_REMINDER_HOUR) return false;
  return lastSentDate !== todayStr;
}
