import { describe, expect, it } from 'vitest';
import {
  createDefaultProfiles,
  calculateMonthlyWorkingDays,
} from '../src/domains/office/officeEngine';
import {
  getVpReminderReasons,
  isVpReminderDue,
  VP_REMINDER_HOUR,
} from '../src/domains/office/vpReminder';
import type { DayLogMap, EmployeeProfile, WeekdayKey } from '../src/domains/office/types';

// October 2026: 22 working days (Mon–Fri, no holidays). 2026-10-21 is a Wednesday.
const TODAY_WED = '2026-10-21';
const TODAY_SAT = '2026-10-24';

function makeProfile(minRequirementPercent: number, officeWeekdays: WeekdayKey[] = []): EmployeeProfile {
  const base = createDefaultProfiles()[0];
  const weeklySchedule = { ...base.weeklySchedule };
  for (const k of officeWeekdays) weeklySchedule[k] = 'office';
  return { ...base, minRequirementPercent, weeklySchedule };
}

function measurementFor(profile: EmployeeProfile) {
  return {
    workingDaysCount: calculateMonthlyWorkingDays(2026, 10, profile.weeklySchedule, []),
    holidays: [],
  };
}

describe('VP reminder conditions', () => {
  it('fires for a priority office day while the quota is not yet met', () => {
    // 10% of 22 days = 3 required; 8 working days left, so not at risk.
    const profile = makeProfile(10, ['wed']);
    const reasons = getVpReminderReasons(profile, measurementFor(profile), {}, TODAY_WED);
    expect(reasons).toEqual(['priority-quota-open']);
  });

  it('does not fire the priority reason once the quota is met', () => {
    const profile = makeProfile(10, ['wed']);
    const dayLogs: DayLogMap = {
      '2026-10-01': 'office',
      '2026-10-02': 'office',
      '2026-10-05': 'office',
    };
    const reasons = getVpReminderReasons(profile, measurementFor(profile), dayLogs, TODAY_WED);
    expect(reasons).toEqual([]);
  });

  it('fires for a day planned to go to the office', () => {
    const profile = makeProfile(10);
    const dayLogs: DayLogMap = { [TODAY_WED]: 'planned' };
    const reasons = getVpReminderReasons(profile, measurementFor(profile), dayLogs, TODAY_WED);
    expect(reasons).toEqual(['planned-today']);
  });

  it('fires when skipping office from today to month end would miss the target', () => {
    // 36% of 22 = 8 required; 8 working days left from today (incl. today) → at risk.
    const profile = makeProfile(36);
    const reasons = getVpReminderReasons(profile, measurementFor(profile), {}, TODAY_WED);
    expect(reasons).toEqual(['quota-at-risk']);
  });

  it('stays silent on a weekend even when the quota is at risk', () => {
    const profile = makeProfile(36);
    const reasons = getVpReminderReasons(profile, measurementFor(profile), {}, TODAY_SAT);
    expect(reasons).toEqual([]);
  });

  it('stays silent on a public holiday', () => {
    const profile = makeProfile(36);
    const measurement = {
      workingDaysCount: measurementFor(profile).workingDaysCount,
      holidays: [{ date: TODAY_WED, nameVi: 'Lễ', nameEn: 'Holiday' }],
    };
    const reasons = getVpReminderReasons(profile, measurement, {}, TODAY_WED);
    expect(reasons).toEqual([]);
  });

  it('lists the at-risk reason first when several apply', () => {
    const profile = makeProfile(36, ['wed']);
    const dayLogs: DayLogMap = { [TODAY_WED]: 'planned' };
    const reasons = getVpReminderReasons(profile, measurementFor(profile), dayLogs, TODAY_WED);
    expect(reasons).toEqual(['quota-at-risk', 'planned-today', 'priority-quota-open']);
  });

  it('combines planned and priority reasons when both apply', () => {
    const profile = makeProfile(10, ['wed']);
    const dayLogs: DayLogMap = { [TODAY_WED]: 'planned' };
    const reasons = getVpReminderReasons(profile, measurementFor(profile), dayLogs, TODAY_WED);
    expect(reasons).toEqual(['planned-today', 'priority-quota-open']);
  });

  it('stays silent when today is already checked in as office', () => {
    const profile = makeProfile(10, ['wed']);
    const dayLogs: DayLogMap = { [TODAY_WED]: 'office' };
    const reasons = getVpReminderReasons(profile, measurementFor(profile), dayLogs, TODAY_WED);
    expect(reasons).toEqual([]);
  });

  it('stays silent on a leave day', () => {
    const profile = makeProfile(10, ['wed']);
    const dayLogs: DayLogMap = { [TODAY_WED]: 'leave' };
    const reasons = getVpReminderReasons(profile, measurementFor(profile), dayLogs, TODAY_WED);
    expect(reasons).toEqual([]);
  });

  it('stays silent when nothing applies', () => {
    const profile = makeProfile(10);
    const reasons = getVpReminderReasons(profile, measurementFor(profile), {}, TODAY_WED);
    expect(reasons).toEqual([]);
  });
});

describe('VP reminder schedule', () => {
  it('is not due before 07:00 local time', () => {
    const now = new Date(2026, 9, 21, VP_REMINDER_HOUR - 1, 59);
    expect(isVpReminderDue(now, TODAY_WED, undefined)).toBe(false);
  });

  it('is due from 07:00 when not yet evaluated today', () => {
    const now = new Date(2026, 9, 21, VP_REMINDER_HOUR, 0);
    expect(isVpReminderDue(now, TODAY_WED, undefined)).toBe(true);
  });

  it('is not repeated once evaluated today', () => {
    const now = new Date(2026, 9, 21, 17, 30);
    expect(isVpReminderDue(now, TODAY_WED, TODAY_WED)).toBe(false);
  });

  it('is due again on a new day', () => {
    const now = new Date(2026, 9, 22, 9, 0);
    expect(isVpReminderDue(now, '2026-10-22', TODAY_WED)).toBe(true);
  });
});
