import type {
  HolidayItem,
  MonthlyMeasurementCache,
  WeekdayKey,
  WeekdaySettingState,
} from '../domains/office/types';
import {
  calculateMonthlyWorkingDays,
  formatMonthKey,
  serializeWeeklySchedule,
  shouldRemeasureMonth,
} from '../domains/office/officeEngine';
import { getBuiltInVietnamHolidays } from '../domains/office/vietnamHolidays';

interface NagerHolidayResponseItem {
  date: string;
  localName?: string;
  name?: string;
}

/**
 * Queries Vietnam public holidays for a given year from Nager.Date API when online,
 * merging with built-in Lunar/Solar Vietnam holidays so it works 100% offline.
 */
export async function fetchVietnamHolidaysForYear(
  year: number,
  fetchImpl: typeof fetch = fetch
): Promise<HolidayItem[]> {
  const builtIn = getBuiltInVietnamHolidays(year);
  const map = new Map<string, HolidayItem>();
  for (const h of builtIn) {
    map.set(h.date, h);
  }

  try {
    const res = await fetchImpl(`https://date.nager.at/api/v3/PublicHolidays/${year}/VN`);
    if (res.ok) {
      const data = (await res.json()) as NagerHolidayResponseItem[];
      for (const item of data) {
        if (item.date && !map.has(item.date)) {
          map.set(item.date, {
            date: item.date,
            nameVi: item.localName || item.name || 'Ngày nghỉ lễ',
            nameEn: item.name || item.localName || 'Public Holiday',
          });
        }
      }
    }
  } catch {
    // Offline or network error: built-in Vietnam holidays provide full fallback
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildInstantMonthMeasurement(
  year: number,
  month: number,
  schedule: Record<WeekdayKey, WeekdaySettingState>,
  nowMs: number,
  holidaysOverride?: HolidayItem[]
): MonthlyMeasurementCache {
  const monthKey = formatMonthKey(year, month);
  const allYearHolidays = holidaysOverride ?? getBuiltInVietnamHolidays(year);
  const monthHolidays = allYearHolidays.filter((h) => h.date.startsWith(`${monthKey}-`));
  const workingDaysCount = calculateMonthlyWorkingDays(year, month, schedule, monthHolidays);

  return {
    monthKey,
    workingDaysCount,
    holidays: monthHolidays,
    weeklyScheduleHash: serializeWeeklySchedule(schedule),
    measuredAt: nowMs,
  };
}

/**
 * Ensures the month's working days and Vietnam public holidays are measured ONLY once
 * and cached, re-measuring ONLY when:
 * 1. Value is missing
 * 2. Weekly working-day schedule changed
 * 3. Last measurement is older than 30 days
 */
export async function ensureMonthMeasurement(
  year: number,
  month: number,
  schedule: Record<WeekdayKey, WeekdaySettingState>,
  cacheMap: Record<string, MonthlyMeasurementCache>,
  nowMs: number = Date.now(),
  fetchImpl: typeof fetch = fetch
): Promise<{ entry: MonthlyMeasurementCache; didRemeasure: boolean }> {
  const monthKey = formatMonthKey(year, month);
  const existing = cacheMap[monthKey];

  if (!shouldRemeasureMonth(existing, schedule, nowMs)) {
    return { entry: existing, didRemeasure: false };
  }

  const yearHolidays = await fetchVietnamHolidaysForYear(year, fetchImpl);
  const entry = buildInstantMonthMeasurement(year, month, schedule, nowMs, yearHolidays);

  return { entry, didRemeasure: true };
}
