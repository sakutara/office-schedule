import { describe, expect, it, vi } from 'vitest';
import { loadAppState, saveAppState } from '../src/services/storageService';
import { ensureMonthMeasurement, fetchVietnamHolidaysForYear } from '../src/services/holidayService';
import { createDefaultWeeklySchedule } from '../src/domains/office/officeEngine';

describe('Offline Storage & Holiday Query/Cache Services', () => {
  it('loads default state when localStorage is empty or corrupted, and persists state changes', () => {
    const initial = loadAppState();
    expect(initial.profiles).toHaveLength(2);
    expect(initial.activeProfileId).toBe(initial.profiles[0].id);
    expect(initial.language).toBe('vi');

    const updated = {
      ...initial,
      language: 'en' as const,
      dayLogs: { '2026-10-21': 'office' as const },
    };
    saveAppState(updated);

    const reloaded = loadAppState();
    expect(reloaded.language).toBe('en');
    expect(reloaded.dayLogs['2026-10-21']).toBe('office');

    // Corrupted JSON fallback
    localStorage.setItem('office_tracker_state_v1', '{invalid-json');
    const recovered = loadAppState();
    expect(recovered.profiles).toHaveLength(2);

    // Partial JSON fallback (empty profiles array & unknown activeProfileId)
    localStorage.setItem(
      'office_tracker_state_v1',
      JSON.stringify({ profiles: [], activeProfileId: 'missing-id' })
    );
    const partialRecovered = loadAppState();
    expect(partialRecovered.profiles).toHaveLength(2);
    expect(partialRecovered.activeProfileId).toBe(partialRecovered.profiles[0].id);
  });

  it('queries public holiday API when available and merges with built-in Vietnam holidays', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          date: '2026-09-02',
          localName: 'Quốc khánh',
          name: 'National Day',
        },
        {
          date: '2026-12-25',
          localName: 'Lễ kỷ niệm đặc biệt',
          name: 'Special Holiday',
        },
        {
          date: '2026-12-26',
        },
      ],
    });

    const holidays = await fetchVietnamHolidaysForYear(2026, mockFetch as unknown as typeof fetch);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(holidays.some((h) => h.date === '2026-09-02')).toBe(true);
    expect(holidays.some((h) => h.date === '2026-12-25')).toBe(true);
  });

  it('falls back gracefully to built-in Vietnam holidays when offline or API fails', async () => {
    const failingFetch = vi.fn().mockRejectedValue(new Error('Offline'));
    const holidays = await fetchVietnamHolidaysForYear(2026, failingFetch as unknown as typeof fetch);
    expect(holidays.length).toBeGreaterThan(5);
    expect(holidays.some((h) => h.date === '2026-09-02')).toBe(true);

    const nonOkFetch = vi.fn().mockResolvedValue({ ok: false });
    const holidays2 = await fetchVietnamHolidaysForYear(2026, nonOkFetch as unknown as typeof fetch);
    expect(holidays2.some((h) => h.date === '2026-01-01')).toBe(true);
  });

  it('measures monthly working days only once and reuses cache unless missing, schedule changed, or > 30 days old', async () => {
    const schedule = createDefaultWeeklySchedule();
    const failingFetch = vi.fn().mockRejectedValue(new Error('Offline mode'));
    const now = 1760000000000;

    // 1st call: cache miss -> measures and stores
    const res1 = await ensureMonthMeasurement(2026, 9, schedule, {}, now, failingFetch as unknown as typeof fetch);
    expect(res1.didRemeasure).toBe(true);
    expect(res1.entry.workingDaysCount).toBe(20);
    expect(failingFetch).toHaveBeenCalledTimes(1);

    // 2nd call (5 days later, same schedule): cache hit -> does NOT remeasure
    const cacheAfter1 = { '2026-09': res1.entry };
    const res2 = await ensureMonthMeasurement(
      2026,
      9,
      schedule,
      cacheAfter1,
      now + 5 * 86400 * 1000,
      failingFetch as unknown as typeof fetch
    );
    expect(res2.didRemeasure).toBe(false);
    expect(res2.entry).toEqual(res1.entry);
    expect(failingFetch).toHaveBeenCalledTimes(1);

    // 3rd call (31 days later): cache expired -> remeasures
    const res3 = await ensureMonthMeasurement(
      2026,
      9,
      schedule,
      cacheAfter1,
      now + 31 * 86400 * 1000,
      failingFetch as unknown as typeof fetch
    );
    expect(res3.didRemeasure).toBe(true);
    expect(failingFetch).toHaveBeenCalledTimes(2);
  });
});
