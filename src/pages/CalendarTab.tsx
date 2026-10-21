import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type {
  CalendarDayCell,
  EditableDayStatus,
  MonthlyProgressMetrics,
  WeekdayKey,
} from '../domains/office/types';
import { WEEKDAY_ORDER } from '../domains/office/types';
import { cycleDayStatus, cycleLockdownDayStatus, formatMonthKey, planOfficeDays, type PlanStrategy } from '../domains/office/officeEngine';
import type { LanguageCode, TranslationDictionary } from '../domains/i18n';
import { formatMessage } from '../domains/i18n';

interface CalendarTabProps {
  year: number;
  month: number;
  onChangeMonth: (nextYear: number, nextMonth: number) => void;
  cells: CalendarDayCell[];
  metrics: MonthlyProgressMetrics;
  onSetDayStatus: (dateStr: string, status: EditableDayStatus) => void;
  onForceRemeasure: () => void | Promise<void>;
  onApplyDayStatuses: (updates: Record<string, EditableDayStatus>) => void;
  todayStr: string;
  language: LanguageCode;
  t: TranslationDictionary;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  year,
  month,
  onChangeMonth,
  cells,
  metrics,
  onSetDayStatus,
  onForceRemeasure,
  onApplyDayStatuses,
  todayStr,
  language,
  t,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const weekdayLabels: Record<WeekdayKey, string> = {
    mon: t.dayMon,
    tue: t.dayTue,
    wed: t.dayWed,
    thu: t.dayThu,
    fri: t.dayFri,
    sat: t.daySat,
    sun: t.daySun,
  };

  const firstDayWeekday = cells[0]?.weekdayKey ?? 'mon';
  const leadingBlankCount = Math.max(0, WEEKDAY_ORDER.indexOf(firstDayWeekday));

  const handlePrevMonth = () => {
    if (month === 1) {
      onChangeMonth(year - 1, 12);
    } else {
      onChangeMonth(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onChangeMonth(year + 1, 1);
    } else {
      onChangeMonth(year, month + 1);
    }
  };

  const colorStyleMap = {
    gray: 'bg-slate-700/80 text-slate-300 border-slate-600',
    yellow: 'bg-amber-200 text-slate-900 border-amber-100',
    green: 'bg-emerald-400 text-slate-950 font-bold border-emerald-300',
  };
  // Lighter variants for days that have not happened yet (planned office, upcoming remote/leave)
  const lightStyleMap = {
    gray: 'bg-slate-700/30 text-slate-400 border-slate-700',
    yellow: 'bg-amber-200/20 text-amber-100 border-amber-200/40',
    green: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/40',
  };

  const handlePlan = (strategy: PlanStrategy) => {
    onApplyDayStatuses(
      planOfficeDays(
        cells,
        metrics.requiredOfficeDays,
        metrics.attendedOfficeDays,
        strategy,
        todayStr
      )
    );
  };

  const monthNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  const monthKey = formatMonthKey(year, month);

  return (
    <div
      data-testid="calendar-tab"
      className="flex-1 flex flex-col gap-2 px-4 py-2.5 overflow-hidden"
    >
      {/* Month Selector & Summary Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
        <button
          type="button"
          data-testid="btn-prev-month"
          aria-label="Previous month"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <button
            type="button"
            data-testid="calendar-month-label"
            aria-label="Pick month and year"
            onClick={() => {
              setPickerYear(year);
              setPickerOpen((o) => !o);
            }}
            className="text-sm font-bold text-slate-100 px-2 rounded hover:bg-slate-800"
          >
            {monthKey}
          </button>
          <div data-testid="calendar-working-days" className="text-[11px] text-slate-400">
            {formatMessage(t.workingDaysCount, {
              work: metrics.workingDaysInMonth,
            })}
          </div>
        </div>

        <button
          type="button"
          data-testid="btn-next-month"
          aria-label="Next month"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {pickerOpen && (
        <div
          data-testid="month-year-picker"
          className="bg-slate-900 border border-slate-700 rounded-xl p-2"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              type="button"
              data-testid="picker-prev-year"
              aria-label="Previous year"
              onClick={() => setPickerYear((y) => y - 1)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span data-testid="picker-year" className="text-sm font-bold">
              {pickerYear}
            </span>
            <button
              type="button"
              data-testid="picker-next-year"
              aria-label="Next year"
              onClick={() => setPickerYear((y) => y + 1)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {monthNumbers.map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`picker-month-${m}`}
                onClick={() => {
                  onChangeMonth(pickerYear, m);
                  setPickerOpen(false);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  pickerYear === year && m === month
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Planning buttons: distribute remaining required days */}
      <div className="flex flex-col gap-1">
      <div className="text-[11px] font-semibold text-slate-400">
        {t.quickAssignLabel}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['priority', t.planPriorityBtn],
            ['start', t.planStartBtn],
            ['end', t.planEndBtn],
          ] as [PlanStrategy, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            data-testid={`plan-${key}`}
            onClick={() => handlePlan(key)}
            className="py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30"
          >
            {label}
          </button>
        ))}
      </div>

      </div>

      {/* 7-Column Monthly Grid */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2">
        <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[11px] font-semibold text-slate-400">
          {WEEKDAY_ORDER.map((k) => (
            <div key={k}>{weekdayLabels[k]}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlankCount }).map((_, idx) => (
            <div key={`blank-${idx}`} className="h-11 rounded-lg bg-transparent" />
          ))}

          {cells.map((cell) => {
            return (
              <button
                key={cell.dateStr}
                type="button"
                data-testid={`cal-day-${cell.dateStr}`}
                data-color={cell.color}
                data-state={cell.effectiveState}
                data-today={cell.dateStr === todayStr ? 'true' : 'false'}
                data-planned={cell.isPlanned ? 'true' : 'false'}
                title={
                  language === 'vi' ? cell.holidayNameVi : cell.holidayNameEn
                }
                onClick={() => {
                  if (!cell.isEditable) return;
                  const current: EditableDayStatus = cell.isPlanned
                    ? 'planned'
                    : (cell.effectiveState as EditableDayStatus);
                  onSetDayStatus(
                    cell.dateStr,
                    cell.isLockdown
                      ? cycleLockdownDayStatus(current)
                      : cycleDayStatus(current, cell.dateStr, todayStr)
                  );
                }}
                className={`h-11 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  (cell.isPlanned || cell.isUpcoming) && cell.isEditable
                    ? lightStyleMap[cell.color]
                    : colorStyleMap[cell.color]
                } ${cell.isEditable ? '' : 'cursor-default'} ${
                  cell.dateStr === todayStr ? '!border-[3px] !border-red-700' : ''
                }`}
              >
                {cell.dayOfMonth}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-4 text-[11px] py-1">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" />
          {t.legendGray}
        </span>
        <span className="flex items-center gap-1.5 text-amber-200">
          <span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block" />
          {t.legendYellow}
        </span>
        <span className="flex items-center gap-1.5 text-emerald-300">
          <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
          {t.legendGreen}
        </span>
      </div>

      <button
        type="button"
        data-testid="btn-force-remeasure"
        onClick={onForceRemeasure}
        className="mt-auto flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{t.remeasureNowBtn}</span>
      </button>
    </div>
  );
};
