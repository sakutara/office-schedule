import type { AppPersistedState } from '../domains/office/types';
import { createDefaultProfiles } from '../domains/office/officeEngine';

const STORAGE_KEY = 'office_tracker_state_v1';

export function createInitialAppState(): AppPersistedState {
  const profiles = createDefaultProfiles();
  return {
    language: 'vi',
    profiles,
    activeProfileId: profiles[0].id,
    dayLogs: {},
    monthlyCache: {},
    lockdownDates: [],
  };
}

export function loadAppState(): AppPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialAppState();
    const parsed = JSON.parse(raw) as Partial<AppPersistedState>;
    const defaults = createInitialAppState();
    const profiles =
      Array.isArray(parsed.profiles) && parsed.profiles.length > 0
        ? parsed.profiles
        : defaults.profiles;
    const activeProfileId =
      parsed.activeProfileId && profiles.some((p) => p.id === parsed.activeProfileId)
        ? parsed.activeProfileId
        : profiles[0].id;

    return {
      language: parsed.language === 'en' ? 'en' : 'vi',
      profiles,
      activeProfileId,
      dayLogs: parsed.dayLogs ?? {},
      monthlyCache: parsed.monthlyCache ?? {},
      lockdownDates: Array.isArray(parsed.lockdownDates) ? parsed.lockdownDates : [],
    };
  } catch {
    return createInitialAppState();
  }
}

export function saveAppState(state: AppPersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
