import type { HolidayItem } from '../domains/office/types';
import { setHolidayData, type HolidayData } from '../domains/office/vietnamHolidays';

const HOLIDAY_DATA_KEY = 'office_tracker_holiday_data_v1';
// Primary: file refreshed monthly by .github/workflows/update-holidays.yml (CORS-enabled, no key).
// Fallback: copy deployed together with the app.
const HOLIDAY_FILE_URLS = [
  'https://raw.githubusercontent.com/sakutara/office-schedule/main/public/holidays/vn.json',
  `${import.meta.env.BASE_URL}holidays/vn.json`,
];

function parseHolidayData(raw: unknown): HolidayData | null {
  const obj = raw as { years?: unknown; holidays?: unknown } | null;
  if (!obj || !Array.isArray(obj.years) || !Array.isArray(obj.holidays)) return null;
  const holidays = (obj.holidays as Partial<HolidayItem>[]).filter(
    (h): h is HolidayItem => typeof h?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(h.date)
  );
  const years = (obj.years as unknown[]).filter((y): y is number => typeof y === 'number');
  if (holidays.length === 0 || years.length === 0) return null;
  return { years, holidays };
}

/** Loads the last synced holiday plan from local storage into the holiday registry. */
export function applyStoredHolidayData(): void {
  try {
    const raw = localStorage.getItem(HOLIDAY_DATA_KEY);
    setHolidayData(raw ? parseHolidayData(JSON.parse(raw)) : null);
  } catch {
    setHolidayData(null);
  }
}

/**
 * Downloads holidays/vn.json (bypassing HTTP caches), stores it locally and activates it.
 * Returns true when the plan changed, false when unchanged or unreachable (offline keeps old data).
 */
export async function syncHolidayData(fetchImpl: typeof fetch = fetch): Promise<boolean> {
  for (const url of HOLIDAY_FILE_URLS) {
    try {
      const res = await fetchImpl(`${url}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = parseHolidayData(await res.json());
      if (!data) continue;
      const serialized = JSON.stringify(data);
      if (localStorage.getItem(HOLIDAY_DATA_KEY) === serialized) return false;
      localStorage.setItem(HOLIDAY_DATA_KEY, serialized);
      setHolidayData(data);
      return true;
    } catch {
      // try the next source
    }
  }
  return false;
}
