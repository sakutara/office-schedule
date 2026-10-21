import React from 'react';
import { Building2, CalendarOff, CalendarCheck, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import type {
  CalendarDayCell,
  EditableDayStatus,
  MonthlyProgressMetrics,
} from '../domains/office/types';
import type { LanguageCode, TranslationDictionary } from '../domains/i18n';

interface MainTabProps {
  todayStr: string;
  metrics: MonthlyProgressMetrics;
  monthCells: CalendarDayCell[];
  language: LanguageCode;
  todayStatus: EditableDayStatus | undefined;
  onSetDayStatus: (dateStr: string, status: EditableDayStatus) => void;
  t: TranslationDictionary;
}

export const MainTab: React.FC<MainTabProps> = ({
  todayStr,
  metrics,
  monthCells,
  language,
  todayStatus,
  onSetDayStatus,
  t,
}) => {
  const variant = metrics.buttonVariant;

  const variantConfig = {
    normal: {
      bgClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400',
      title: t.btnCheckInNormal,
      sub: t.btnCheckInNormalSub,
      Icon: Building2,
    },
    priority: {
      bgClass: 'bg-emerald-800 hover:bg-emerald-700 text-emerald-50 border-emerald-500',
      title: t.btnCheckInPriority,
      sub: t.btnCheckInPrioritySub,
      Icon: Sparkles,
    },
    warning: {
      bgClass: 'bg-orange-500 hover:bg-orange-400 text-slate-950 border-orange-300',
      title: t.btnCheckInWarning,
      sub: t.btnCheckInWarningSub,
      Icon: AlertTriangle,
    },
    danger: {
      bgClass: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400',
      title: t.btnCheckInDanger,
      sub: t.btnCheckInDangerSub,
      Icon: ShieldAlert,
    },
  }[variant];

  const MainIcon = variantConfig.Icon;

  // Buttons are shown while today is remote or planned-but-not-yet-confirmed.
  const showButtons = todayStatus === undefined || todayStatus === 'work' || todayStatus === 'planned';

  const upcomingOffDays = monthCells
    .filter(
      (c) => (c.effectiveState === 'holiday' || c.effectiveState === 'leave') && c.dateStr >= todayStr
    )
    .slice(0, 10);

  const infoRows: [string, number, string][] = [
    ['info-attended', metrics.attendedOfficeDays, t.infoAttended],
    ['info-planned', metrics.plannedOfficeDays, t.infoPlanned],
    ['info-required', metrics.requiredOfficeDays, t.infoRequired],
    ['info-working', metrics.workingDaysInMonth, t.infoWorkingDays],
  ];

  return (
    <div
      data-testid="main-tab"
      className="flex-1 flex flex-col gap-3 px-4 py-3 overflow-y-auto"
    >
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs">
        <span className="text-slate-400">{t.todayDateLabel}: </span>
        <span className="font-semibold text-slate-100">{todayStr}</span>
      </div>

      {showButtons ? (
        <div className="flex flex-col items-center justify-center gap-3 my-auto py-2">
          <button
            type="button"
            data-testid="btn-checkin-office"
            data-variant={variant}
            aria-label={variantConfig.title}
            onClick={() => onSetDayStatus(todayStr, 'office')}
            className={`w-full max-w-md rounded-2xl border-2 p-5 shadow-lg transition-transform active:scale-98 flex flex-col items-center text-center gap-2 ${variantConfig.bgClass}`}
          >
            <MainIcon className="w-10 h-10" />
            <span className="text-xl font-extrabold tracking-tight">
              {variantConfig.title}
            </span>
            <span className="text-xs font-medium opacity-90 max-w-xs">
              {variantConfig.sub}
            </span>
          </button>

          <button
            type="button"
            data-testid="btn-mark-leave"
            aria-label={t.btnMarkLeave}
            onClick={() => onSetDayStatus(todayStr, 'leave')}
            className="w-full max-w-xs rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm py-2.5 px-4 shadow border border-slate-200 flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <CalendarOff className="w-4 h-4 text-slate-700" />
            <span>{t.btnMarkLeave}</span>
          </button>
        </div>
      ) : (
        <>
          <div
            data-testid="today-status-indicator"
            data-status={todayStatus}
            className={`w-full py-3 flex items-center justify-center gap-3 text-2xl font-extrabold ${
              todayStatus === 'office' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {todayStatus === 'office' ? (
              <CalendarCheck className="w-8 h-8" />
            ) : (
              <CalendarOff className="w-8 h-8" />
            )}
            <span>{todayStatus === 'office' ? t.todayIsOffice : t.todayIsLeave}</span>
          </div>

          <div
            data-testid="info-panel"
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-sm"
          >
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              {infoRows.map(([id, value, label]) => (
                <div key={id} className="flex items-center justify-between">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd data-testid={id} className="font-bold text-slate-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400 mb-1">{t.infoUpcomingOff}</div>
              {upcomingOffDays.length === 0 ? (
                <div data-testid="info-no-off" className="text-xs text-slate-500">
                  {t.noUpcomingOff}
                </div>
              ) : (
                <ul data-testid="info-upcoming-off" className="flex flex-col gap-1">
                  {upcomingOffDays.map((c) => (
                    <li key={c.dateStr} className="flex items-center justify-between text-xs">
                      <span className="text-slate-200">
                        {c.dateStr.slice(8)}/{c.dateStr.slice(5, 7)}
                      </span>
                      <span className="text-slate-400 truncate ml-2">
                        {c.effectiveState === 'leave'
                          ? t.btnMarkLeave
                          : language === 'vi'
                            ? c.holidayNameVi
                            : c.holidayNameEn}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
