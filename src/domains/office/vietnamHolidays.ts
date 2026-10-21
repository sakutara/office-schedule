import type { HolidayItem } from './types';

export interface HolidayData {
  years: number[];
  holidays: HolidayItem[];
}

/**
 * Per-year holiday plan (Tết, bridge days, new holidays like 24/11) downloaded from
 * `holidays/vn.json` and cached locally by holidayDataService. Lives outside the bundle so
 * it can be refreshed without a rebuild; years it does not cover use the fallback table below.
 */
let holidayData: HolidayData | null = null;

export function setHolidayData(data: HolidayData | null): void {
  holidayData = data;
}

/**
 * Fallback table (Solar + Lunar), used only for years missing from the downloaded plan.
 */
const LUNAR_HOLIDAYS_BY_YEAR: Record<number, Array<{ mmdd: string; nameVi: string; nameEn: string }>> = {
  2024: [
    { mmdd: '02-08', nameVi: 'Nghỉ Tết Nguyên Đán', nameEn: 'Lunar New Year Holiday' },
    { mmdd: '02-09', nameVi: 'Giao thừa Tết Giáp Thìn', nameEn: 'Lunar New Year Eve' },
    { mmdd: '02-12', nameVi: 'Tết Nguyên Đán (Nghỉ bù)', nameEn: 'Lunar New Year' },
    { mmdd: '02-13', nameVi: 'Tết Nguyên Đán (Nghỉ bù)', nameEn: 'Lunar New Year' },
    { mmdd: '02-14', nameVi: 'Tết Nguyên Đán (Nghỉ bù)', nameEn: 'Lunar New Year' },
    { mmdd: '04-18', nameVi: 'Giỗ Tổ Hùng Vương (10/3 ÂL)', nameEn: 'Hung Kings Commemoration Day' },
  ],
  2025: [
    { mmdd: '01-27', nameVi: 'Nghỉ Tết Nguyên Đán', nameEn: 'Lunar New Year Holiday' },
    { mmdd: '01-28', nameVi: 'Giao thừa Tết Ất Tỵ', nameEn: 'Lunar New Year Eve' },
    { mmdd: '01-29', nameVi: 'Mùng 1 Tết Ất Tỵ', nameEn: 'Lunar New Year Day 1' },
    { mmdd: '01-30', nameVi: 'Mùng 2 Tết Ất Tỵ', nameEn: 'Lunar New Year Day 2' },
    { mmdd: '01-31', nameVi: 'Mùng 3 Tết Ất Tỵ', nameEn: 'Lunar New Year Day 3' },
    { mmdd: '04-07', nameVi: 'Giỗ Tổ Hùng Vương (10/3 ÂL)', nameEn: 'Hung Kings Commemoration Day' },
  ],
  2026: [
    { mmdd: '02-16', nameVi: '29 Tết Bính Ngọ', nameEn: 'Lunar New Year Eve' },
    { mmdd: '02-17', nameVi: 'Mùng 1 Tết Bính Ngọ', nameEn: 'Lunar New Year Day 1' },
    { mmdd: '02-18', nameVi: 'Mùng 2 Tết Bính Ngọ', nameEn: 'Lunar New Year Day 2' },
    { mmdd: '02-19', nameVi: 'Mùng 3 Tết Bính Ngọ', nameEn: 'Lunar New Year Day 3' },
    { mmdd: '02-20', nameVi: 'Mùng 4 Tết Bính Ngọ', nameEn: 'Lunar New Year Day 4' },
    { mmdd: '04-26', nameVi: 'Giỗ Tổ Hùng Vương (10/3 ÂL)', nameEn: 'Hung Kings Commemoration Day' },
    { mmdd: '04-27', nameVi: 'Nghỉ bù Giỗ Tổ Hùng Vương', nameEn: 'Hung Kings Holiday Observed' },
  ],
  2027: [
    { mmdd: '02-05', nameVi: '29 Tết Đinh Mùi', nameEn: 'Lunar New Year Eve' },
    { mmdd: '02-08', nameVi: 'Mùng 3 Tết Đinh Mùi', nameEn: 'Lunar New Year Day 3' },
    { mmdd: '02-09', nameVi: 'Mùng 4 Tết Đinh Mùi', nameEn: 'Lunar New Year Day 4' },
    { mmdd: '02-10', nameVi: 'Mùng 5 Tết Đinh Mùi', nameEn: 'Lunar New Year Day 5' },
    { mmdd: '04-16', nameVi: 'Giỗ Tổ Hùng Vương (10/3 ÂL)', nameEn: 'Hung Kings Commemoration Day' },
  ],
  2028: [
    { mmdd: '01-26', nameVi: 'Mùng 1 Tết Mậu Thân', nameEn: 'Lunar New Year Day 1' },
    { mmdd: '01-27', nameVi: 'Mùng 2 Tết Mậu Thân', nameEn: 'Lunar New Year Day 2' },
    { mmdd: '01-28', nameVi: 'Mùng 3 Tết Mậu Thân', nameEn: 'Lunar New Year Day 3' },
    { mmdd: '04-04', nameVi: 'Giỗ Tổ Hùng Vương (10/3 ÂL)', nameEn: 'Hung Kings Commemoration Day' },
  ],
};

export function getBuiltInVietnamHolidays(year: number): HolidayItem[] {
  if (holidayData?.years.includes(year)) {
    return holidayData.holidays.filter((h) => h.date.startsWith(`${year}-`));
  }

  // Fallback for years outside the snapshot: fixed solar + hand-maintained lunar table
  const fixedSolar: Array<{ mmdd: string; nameVi: string; nameEn: string }> = [
    { mmdd: '01-01', nameVi: 'Tết Dương lịch', nameEn: 'New Year Day' },
    { mmdd: '04-30', nameVi: 'Ngày Giải phóng miền Nam', nameEn: 'Reunification Day' },
    { mmdd: '05-01', nameVi: 'Ngày Quốc tế Lao động', nameEn: 'International Labor Day' },
    { mmdd: '09-01', nameVi: 'Nghỉ lễ Quốc khánh', nameEn: 'National Day Holiday' },
    { mmdd: '09-02', nameVi: 'Ngày Quốc khánh Việt Nam', nameEn: 'Vietnam National Day' },
  ];

  const lunar = LUNAR_HOLIDAYS_BY_YEAR[year] ?? [];
  const all = [...fixedSolar, ...lunar];
  const map = new Map<string, HolidayItem>();

  for (const item of all) {
    const date = `${year}-${item.mmdd}`;
    map.set(date, {
      date,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
    });
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/** Last day (inclusive) of the "upcoming" window: same day-of-month, `months` ahead. */
export function getUpcomingWindowEnd(todayStr: string, months = 2): string {
  const d = new Date(Number(todayStr.slice(0, 4)), Number(todayStr.slice(5, 7)) - 1 + months, Number(todayStr.slice(8, 10)));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Holidays from today up to two months ahead, at most `max` items. */
export function getUpcomingHolidays(todayStr: string, months = 2, max = 10): HolidayItem[] {
  const end = getUpcomingWindowEnd(todayStr, months);
  const startYear = Number(todayStr.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  const all: HolidayItem[] = [];
  for (let y = startYear; y <= endYear; y++) all.push(...getBuiltInVietnamHolidays(y));
  return all
    .filter((h) => h.date >= todayStr && h.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, max);
}
