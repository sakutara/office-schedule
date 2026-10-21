import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CalendarDays, Settings, Globe, Wifi } from 'lucide-react';
import { getTranslations } from './domains/i18n';
import {
  isBlankSwipeTarget,
  resolveNextTabIndex,
  type SwipePoint,
} from './domains/navigation/swipeTabLogic';
import type {
  AppPersistedState,
  EditableDayStatus,
  EmployeeProfile,
  WeekdayKey,
} from './domains/office/types';
import {
  buildMonthCalendarDays,
  calculateMonthlyProgress,
  cycleWeekdayState,
  formatDateStr,
  formatMonthKey,
  shouldRemeasureMonth,
} from './domains/office/officeEngine';
import { getVpReminderReasons, isVpReminderDue } from './domains/office/vpReminder';
import { loadAppState, saveAppState } from './services/storageService';
import {
  buildInstantMonthMeasurement,
  ensureMonthMeasurement,
} from './services/holidayService';
import {
  disableVpReminder,
  enableVpReminder,
  getLastEvaluatedDate,
  getVpReminderStatus,
  setLastEvaluatedDate,
  showVpReminderNotification,
  type VpReminderStatus,
} from './services/vpReminderService';
import logoUrl from './assets/logo.svg';
import { TopProgressBar } from './components/TopProgressBar';
import { MainTab } from './pages/MainTab';
import { CalendarTab } from './pages/CalendarTab';
import { SettingsTab } from './pages/SettingsTab';

type TabKey = 'main' | 'calendar' | 'settings';
const TABS: TabKey[] = ['main', 'calendar', 'settings'];

interface AppProps {
  initialTodayStr?: string;
}

function getSystemTodayStr(): string {
  const now = new Date();
  return formatDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export const App: React.FC<AppProps> = ({ initialTodayStr }) => {
  const todayStr = initialTodayStr ?? getSystemTodayStr();
  const [initYear, initMonth] = todayStr.split('-').map(Number);

  const [state, setState] = useState<AppPersistedState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabKey>('main');
  const [selectedYear, setSelectedYear] = useState<number>(initYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initMonth);

  // Always show the current month when switching tabs
  useEffect(() => {
    setSelectedYear(initYear);
    setSelectedMonth(initMonth);
  }, [activeTab, initYear, initMonth]);

  const swipeStartRef = useRef<SwipePoint | null>(null);

  const activeProfile = useMemo(
    () =>
      state.profiles.find((p) => p.id === state.activeProfileId) ??
      state.profiles[0],
    [state.profiles, state.activeProfileId]
  );

  const t = getTranslations(state.language);
  const activeMonthKey = formatMonthKey(selectedYear, selectedMonth);

  // Instant synchronous fallback measurement if cache is missing/stale, while async holiday query runs
  const currentMonthCache = useMemo(() => {
    const cached = state.monthlyCache[activeMonthKey];
    if (!shouldRemeasureMonth(cached, activeProfile.weeklySchedule, Date.now())) {
      return cached;
    }
    return buildInstantMonthMeasurement(
      selectedYear,
      selectedMonth,
      activeProfile.weeklySchedule,
      Date.now()
    );
  }, [state.monthlyCache, activeMonthKey, selectedYear, selectedMonth, activeProfile.weeklySchedule]);

  // Measure and persist monthly working days & holidays when month is selected or schedule changes
  useEffect(() => {
    let cancelled = false;
    ensureMonthMeasurement(
      selectedYear,
      selectedMonth,
      activeProfile.weeklySchedule,
      state.monthlyCache
    ).then(({ entry, didRemeasure }) => {
      if (!cancelled && didRemeasure) {
        setState((prev) => {
          const next = {
            ...prev,
            monthlyCache: {
              ...prev.monthlyCache,
              [entry.monthKey]: entry,
            },
          };
          saveAppState(next);
          return next;
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedYear, selectedMonth, activeProfile.weeklySchedule, state.monthlyCache]);

  const [vpReminderStatus, setVpReminderStatus] = useState<VpReminderStatus>(() =>
    getVpReminderStatus()
  );

  // Daily VP reminder: evaluated once per day from 07:00 while the app is running.
  // Uses the current month (not the month being viewed) so it always reflects today's quota.
  useEffect(() => {
    const check = () => {
      if (getVpReminderStatus() !== 'on') return;
      const now = new Date();
      if (!isVpReminderDue(now, todayStr, getLastEvaluatedDate())) return;
      setLastEvaluatedDate(todayStr);

      const [todayYear, todayMonth] = todayStr.split('-').map(Number);
      const nowMs = now.getTime();
      const cached = state.monthlyCache[formatMonthKey(todayYear, todayMonth)];
      const measurement = shouldRemeasureMonth(cached, activeProfile.weeklySchedule, nowMs)
        ? buildInstantMonthMeasurement(todayYear, todayMonth, activeProfile.weeklySchedule, nowMs)
        : cached;

      const reasons = getVpReminderReasons(activeProfile, measurement, state.dayLogs, todayStr);
      if (reasons.length === 0) return;

      const body =
        reasons[0] === 'quota-at-risk'
          ? t.vpReminderBodyAtRisk
          : reasons[0] === 'planned-today'
            ? t.vpReminderBodyPlanned
            : t.vpReminderBodyPriority;
      void showVpReminderNotification(t.vpReminderNotifTitle, body);
    };

    check();
    const intervalId = window.setInterval(check, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [todayStr, state.dayLogs, state.monthlyCache, activeProfile, state.language]);

  const handleToggleVpReminder = async () => {
    const next = vpReminderStatus === 'on' ? disableVpReminder() : await enableVpReminder();
    setVpReminderStatus(next);
  };

  const monthCells = useMemo(
    () =>
      buildMonthCalendarDays(
        selectedYear,
        selectedMonth,
        activeProfile,
        currentMonthCache.holidays,
        state.dayLogs,
        todayStr
      ),
    [
      selectedYear,
      selectedMonth,
      activeProfile,
      currentMonthCache.holidays,
      state.dayLogs,
      todayStr,
    ]
  );

  const metrics = useMemo(
    () =>
      calculateMonthlyProgress(
        selectedYear,
        selectedMonth,
        activeProfile,
        currentMonthCache.workingDaysCount,
        currentMonthCache.holidays,
        state.dayLogs,
        todayStr
      ),
    [
      selectedYear,
      selectedMonth,
      activeProfile,
      currentMonthCache.workingDaysCount,
      currentMonthCache.holidays,
      state.dayLogs,
      todayStr,
    ]
  );

  const updateStateAndPersist = (updater: (prev: AppPersistedState) => AppPersistedState) => {
    setState((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  const handleSetDayStatus = (dateStr: string, status: EditableDayStatus) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      dayLogs: {
        ...prev.dayLogs,
        [dateStr]: status,
      },
    }));
  };

  const handleApplyDayStatuses = (updates: Record<string, EditableDayStatus>) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      dayLogs: { ...prev.dayLogs, ...updates },
    }));
  };

  const handleSelectProfile = (profileId: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      activeProfileId: profileId,
    }));
  };

  const handleCycleActiveWeekday = (weekday: WeekdayKey) => {
    updateStateAndPersist((prev) => {
      const nextProfiles = prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        return {
          ...p,
          weeklySchedule: {
            ...p.weeklySchedule,
            [weekday]: cycleWeekdayState(p.weeklySchedule[weekday]),
          },
        };
      });
      return {
        ...prev,
        profiles: nextProfiles,
      };
    });
  };

  const handleCreateProfile = (newProfile: EmployeeProfile) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: newProfile.id,
    }));
  };

  const handleForceRemeasure = () => {
    const fresh = buildInstantMonthMeasurement(
      selectedYear,
      selectedMonth,
      activeProfile.weeklySchedule,
      Date.now()
    );
    updateStateAndPersist((prev) => ({
      ...prev,
      monthlyCache: {
        ...prev.monthlyCache,
        [fresh.monthKey]: fresh,
      },
    }));
  };

  const handleSwipeEnd = (endPoint: SwipePoint) => {
    if (!swipeStartRef.current) return;
    const currentIndex = TABS.indexOf(activeTab);
    const nextIndex = resolveNextTabIndex(
      currentIndex,
      TABS.length,
      swipeStartRef.current,
      endPoint
    );
    swipeStartRef.current = null;
    if (nextIndex !== currentIndex) {
      setActiveTab(TABS[nextIndex]);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto h-dvh flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Compact Header Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="" className="w-6 h-6 rounded-md" />
          <h1 className="text-sm font-bold tracking-tight text-slate-100">
            {t.appTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            title={t.offlineReady}
            className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full"
          >
            <Wifi className="w-3 h-3" />
            <span className="hidden sm:inline">{t.offlineReady}</span>
          </span>
          <button
            type="button"
            data-testid="btn-toggle-language"
            aria-label="Toggle Language"
            onClick={() =>
              updateStateAndPersist((prev) => ({
                ...prev,
                language: prev.language === 'vi' ? 'en' : 'vi',
              }))
            }
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{state.language.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* Persistent Top Progress Bar (Full on Main/Settings, Compact without numbers on Calendar) */}
      <TopProgressBar
        metrics={metrics}
        t={t}
        compact
      />

      {/* Swipeable Main Tab Viewport */}
      <main
        data-testid="swipe-viewport"
        onTouchStart={(e) => {
          if (!isBlankSwipeTarget(e.target)) return;
          const touch = e.touches[0];
          if (touch) swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0];
          if (touch) handleSwipeEnd({ x: touch.clientX, y: touch.clientY });
        }}
        onPointerDown={(e) => {
          if (!isBlankSwipeTarget(e.target)) return;
          swipeStartRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          handleSwipeEnd({ x: e.clientX, y: e.clientY });
        }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {activeTab === 'main' && (
          <MainTab
            todayStr={todayStr}
            metrics={metrics}
            monthCells={monthCells}
            language={state.language}
            todayStatus={state.dayLogs[todayStr]}
            onSetDayStatus={handleSetDayStatus}
            t={t}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            year={selectedYear}
            month={selectedMonth}
            onChangeMonth={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
            cells={monthCells}
            metrics={metrics}
            onSetDayStatus={handleSetDayStatus}
            onForceRemeasure={handleForceRemeasure}
            onApplyDayStatuses={handleApplyDayStatuses}
            todayStr={todayStr}
            language={state.language}
            t={t}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            profiles={state.profiles}
            activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile}
            onCycleActiveWeekday={handleCycleActiveWeekday}
            onCreateProfile={handleCreateProfile}
            vpReminderStatus={vpReminderStatus}
            onToggleVpReminder={handleToggleVpReminder}
            todayStr={todayStr}
            language={state.language}
            t={t}
          />
        )}
      </main>

      {/* Bottom Horizontal Tab Navigation Bar */}
      <nav
        aria-label="Bottom Navigation"
        className="grid grid-cols-3 bg-slate-900/95 border-t border-slate-800 px-2 py-1.5"
      >
        <button
          type="button"
          data-testid="tab-btn-main"
          aria-label={t.tabMain}
          onClick={() => setActiveTab('main')}
          className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors ${
            activeTab === 'main'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-7 h-7" />
        </button>

        <button
          type="button"
          data-testid="tab-btn-calendar"
          aria-label={t.tabCalendar}
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors ${
            activeTab === 'calendar'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-7 h-7" />
        </button>

        <button
          type="button"
          data-testid="tab-btn-settings"
          aria-label={t.tabSettings}
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors ${
            activeTab === 'settings'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-7 h-7" />
        </button>
      </nav>
    </div>
  );
};

export default App;
