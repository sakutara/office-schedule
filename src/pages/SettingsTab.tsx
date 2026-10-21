import React, { useState } from 'react';
import { Plus, Minus, Check, Bell, BellOff, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  CalculationMethod,
  EmployeeProfile,
  WeekdayKey,
  WeekdaySettingState,
} from '../domains/office/types';
import { WEEKDAY_ORDER } from '../domains/office/types';
import { getUpcomingHolidays } from '../domains/office/vietnamHolidays';
import {
  formatDateStr,
  getDaysInMonthCount,
  createDefaultWeeklySchedule,
  cycleWeekdayState,
} from '../domains/office/officeEngine';
import type { LanguageCode, TranslationDictionary } from '../domains/i18n';
import type { VpReminderStatus } from '../services/vpReminderService';

interface SettingsTabProps {
  profiles: EmployeeProfile[];
  activeProfile: EmployeeProfile;
  onSelectProfile: (profileId: string) => void;
  onCycleActiveWeekday: (weekday: WeekdayKey) => void;
  onCreateProfile: (newProfile: EmployeeProfile) => void;
  vpReminderStatus: VpReminderStatus;
  onToggleVpReminder: () => void;
  lockdownDates: string[];
  onAddLockdownDates: (dates: string[]) => void;
  onRemoveLockdownDate: (dateStr: string) => void;
  todayStr: string;
  language: LanguageCode;
  t: TranslationDictionary;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onCycleActiveWeekday,
  onCreateProfile,
  vpReminderStatus,
  onToggleVpReminder,
  lockdownDates,
  onAddLockdownDates,
  onRemoveLockdownDate,
  todayStr,
  language,
  t,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [name, setName] = useState('');
  const [method, setMethod] = useState<CalculationMethod>('monthly');
  const [minPercent, setMinPercent] = useState('40');
  const [newSchedule, setNewSchedule] = useState<Record<WeekdayKey, WeekdaySettingState>>(
    createDefaultWeeklySchedule()
  );
  const [note, setNote] = useState('');

  // Office lockdown date picker (multi-select, no past days)
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(Number(todayStr.slice(0, 4)));
  const [pickerMonth, setPickerMonth] = useState(Number(todayStr.slice(5, 7)));
  const [picked, setPicked] = useState<string[]>([]);

  const shiftPickerMonth = (delta: number) => {
    const d = new Date(pickerYear, pickerMonth - 1 + delta, 1);
    setPickerYear(d.getFullYear());
    setPickerMonth(d.getMonth() + 1);
  };
  const togglePicked = (dateStr: string) =>
    setPicked((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  const closePicker = () => {
    setPickerOpen(false);
    setPicked([]);
  };
  const confirmPicked = () => {
    onAddLockdownDates(picked);
    closePicker();
  };
  const pickerLeadingBlanks = (new Date(pickerYear, pickerMonth - 1, 1).getDay() + 6) % 7; // Monday-first
  const sortedLockdown = [...lockdownDates].sort();

  const weekdayLabels: Record<WeekdayKey, string> = {
    mon: t.dayMon,
    tue: t.dayTue,
    wed: t.dayWed,
    thu: t.dayThu,
    fri: t.dayFri,
    sat: t.daySat,
    sun: t.daySun,
  };

  const stateColorMap: Record<WeekdaySettingState, string> = {
    off: 'bg-slate-700 text-slate-300 border-slate-600', // Màu xám: ngày nghỉ
    work: 'bg-amber-200 text-slate-950 font-bold border-amber-100', // Vàng nhạt: làm ở nhà
    office: 'bg-emerald-400 text-slate-950 font-bold border-emerald-300', // Màu xanh lá: ngày lên vp
  };

  const upcomingHolidays = getUpcomingHolidays(todayStr);

  const handleSaveNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim() || 'Hồ sơ mới';
    const pct = Math.max(0, Math.min(100, Number(minPercent) || 0));
    const created: EmployeeProfile = {
      id: `profile-custom-${Date.now()}`,
      name: trimmedName,
      calculationMethod: method,
      minRequirementPercent: pct,
      weeklySchedule: newSchedule,
      note: note.trim() || `${trimmedName} (${pct}%)`,
    };
    onCreateProfile(created);
    setShowNewForm(false);
    setName('');
    setNote('');
  };

  return (
    <div
      data-testid="settings-tab"
      className="flex-1 min-h-0 flex flex-col px-4 py-2.5 overflow-y-auto gap-2"
    >
      {/* 1. Employee selector + compact "new" icon button */}
      <section className="shrink-0 bg-slate-900/85 border border-slate-800 rounded-xl p-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              id="select-employee-profile"
              data-testid="select-employee-profile"
              aria-label={t.selectProfileLabel}
              value={activeProfile.id}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="w-full appearance-none rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500/60 focus:border-emerald-400 focus:outline-none pl-3 pr-9 py-1.5 text-sm font-semibold text-slate-100"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.calculationMethod === 'monthly' ? t.methodMonthly : t.methodWeekly} ({p.minRequirementPercent}%)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          </div>
          <button
            type="button"
            data-testid="btn-toggle-new-profile"
            aria-label={t.createNewProfileBtn}
            title={t.createNewProfileBtn}
            onClick={() => setShowNewForm((prev) => !prev)}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
          >
            {showNewForm ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>

        {/* Accordion: grid-rows animates 0fr <-> 1fr; collapsed form stays inert */}
        <div
          aria-hidden={!showNewForm}
          inert={!showNewForm}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            showNewForm ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <form
              data-testid="new-profile-form"
              onSubmit={handleSaveNewProfile}
              className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs"
            >
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-400 mb-0.5">
                  {t.fieldProfileName}
                </label>
                <input
                  type="text"
                  data-testid="input-profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Chuyên gia NAB"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">
                  {t.fieldCalcMethod}
                </label>
                <select
                  data-testid="input-profile-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as CalculationMethod)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-slate-100"
                >
                  <option value="monthly">{t.methodMonthly}</option>
                  <option value="weekly">{t.methodWeekly}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">
                  {t.fieldMinPercent}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  data-testid="input-profile-percent"
                  value={minPercent}
                  onChange={(e) => setMinPercent(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <span className="block text-[11px] text-slate-400 mb-1">
                  {t.fieldWeeklySchedule}
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAY_ORDER.map((k) => {
                    const st = newSchedule[k];
                    return (
                      <button
                        key={k}
                        type="button"
                        data-testid={`new-weekday-btn-${k}`}
                        onClick={() =>
                          setNewSchedule((prev) => ({
                            ...prev,
                            [k]: cycleWeekdayState(prev[k]),
                          }))
                        }
                        className={`py-1 rounded border text-[11px] ${stateColorMap[st]}`}
                      >
                        {weekdayLabels[k]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] text-slate-400 mb-0.5">
                  {t.fieldNote}
                </label>
                <input
                  type="text"
                  data-testid="input-profile-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú quy tắc..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  data-testid="btn-save-new-profile"
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.saveProfileBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Notifications: daily office reminder at 07:00 */}
      <section className="shrink-0 bg-slate-900/85 border border-slate-800 rounded-xl px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-200">{t.vpReminderTitle}</h3>
          <button
            type="button"
            data-testid="btn-toggle-vp-reminder"
            aria-pressed={vpReminderStatus === 'on'}
            aria-label={vpReminderStatus === 'on' ? t.vpReminderOn : t.vpReminderOff}
            title={vpReminderStatus === 'on' ? t.vpReminderOn : t.vpReminderOff}
            disabled={vpReminderStatus === 'unsupported' || vpReminderStatus === 'blocked'}
            onClick={onToggleVpReminder}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 ${
              vpReminderStatus === 'on'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {vpReminderStatus === 'on' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 truncate">{t.vpReminderDesc}</p>
        {vpReminderStatus === 'blocked' && (
          <p data-testid="vp-reminder-blocked" className="text-[11px] text-amber-400 truncate">
            {t.vpReminderBlocked}
          </p>
        )}
        {vpReminderStatus === 'unsupported' && (
          <p data-testid="vp-reminder-unsupported" className="text-[11px] text-amber-400 truncate">
            {t.vpReminderUnsupported}
          </p>
        )}
      </section>

      {/* Office lockdown: days the office is closed */}
      <section data-testid="lockdown-section" className="shrink-0 bg-slate-900/85 border border-slate-800 rounded-xl px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold text-slate-200">{t.lockdownTitle}</h3>
          <button
            type="button"
            data-testid="btn-add-lockdown"
            aria-label={t.lockdownAddBtn}
            title={t.lockdownAddBtn}
            onClick={() => (pickerOpen ? closePicker() : setPickerOpen(true))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
          >
            {pickerOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {pickerOpen && (
          <div data-testid="lockdown-picker" className="mb-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                aria-label={t.lockdownPrevMonth}
                data-testid="lockdown-prev-month"
                onClick={() => shiftPickerMonth(-1)}
                className="p-1 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-100">
                {String(pickerMonth).padStart(2, '0')}/{pickerYear}
              </span>
              <button
                type="button"
                aria-label={t.lockdownNextMonth}
                data-testid="lockdown-next-month"
                onClick={() => shiftPickerMonth(1)}
                className="p-1 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 mb-1">
              {WEEKDAY_ORDER.map((k) => (
                <span key={k}>{weekdayLabels[k]}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: pickerLeadingBlanks }, (_, i) => (
                <span key={`b${i}`} />
              ))}
              {Array.from({ length: getDaysInMonthCount(pickerYear, pickerMonth) }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDateStr(pickerYear, pickerMonth, day);
                const isPast = dateStr < todayStr;
                const already = lockdownDates.includes(dateStr);
                const isPicked = picked.includes(dateStr);
                return (
                  <button
                    key={dateStr}
                    type="button"
                    data-testid={`lockdown-pick-${dateStr}`}
                    aria-pressed={isPicked}
                    disabled={isPast || already}
                    onClick={() => togglePicked(dateStr)}
                    className={`h-8 rounded-md border text-[11px] disabled:opacity-30 ${
                      isPicked
                        ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-300'
                        : 'bg-slate-900 text-slate-200 border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-2 text-xs">
              <button type="button" onClick={closePicker} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
                {t.cancelBtn}
              </button>
              <button
                type="button"
                data-testid="btn-confirm-lockdown"
                disabled={picked.length === 0}
                onClick={confirmPicked}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold disabled:opacity-40"
              >
                {t.lockdownConfirmBtn}
              </button>
            </div>
          </div>
        )}

        {sortedLockdown.length === 0 ? (
          <div data-testid="lockdown-empty" className="text-xs text-slate-500">
            {t.lockdownEmpty}
          </div>
        ) : (
          <ul data-testid="lockdown-list" className="flex flex-wrap gap-1.5">
            {sortedLockdown.map((d) => (
              <li
                key={d}
                data-testid={`lockdown-item-${d}`}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <span>
                  {d.slice(8)}/{d.slice(5, 7)}
                </span>
                <button
                  type="button"
                  data-testid={`btn-remove-lockdown-${d}`}
                  aria-label={`${t.lockdownRemoveBtn} ${d}`}
                  onClick={() => onRemoveLockdownDate(d)}
                  className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming holidays: next 2 months, max 10; only the list scrolls */}
      <section className="min-h-0 flex-1 flex flex-col bg-slate-900/85 border border-slate-800 rounded-xl p-3">
        <h3 className="shrink-0 text-xs font-bold text-slate-200 mb-2">{t.upcomingHolidaysTitle}</h3>
        {upcomingHolidays.length === 0 && (
          <div data-testid="no-upcoming-holidays" className="text-xs text-slate-500">
            {t.noUpcomingOff}
          </div>
        )}
        <ul data-testid="upcoming-holidays" className="flex flex-col gap-1 min-h-0 overflow-y-auto">
          {upcomingHolidays.map((h) => (
            <li key={h.date} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {h.date.slice(8)}/{h.date.slice(5, 7)}
              </span>
              <span className="text-slate-400 truncate ml-2">
                {language === 'vi' ? h.nameVi : h.nameEn}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. 7-Day Weekly Schedule Editor (Tap to cycle Gray -> Yellow -> Green) */}
      <section className="shrink-0 bg-slate-900/85 border border-slate-800 rounded-xl p-3">
        <h3 className="text-xs font-bold text-slate-200 mb-2">
          {t.weeklyEditorTitle}
        </h3>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_ORDER.map((k) => {
            const st = activeProfile.weeklySchedule[k];
            return (
              <button
                key={k}
                type="button"
                data-testid={`weekday-btn-${k}`}
                data-state={st}
                onClick={() => onCycleActiveWeekday(k)}
                className={`py-3 px-1 rounded-xl border flex items-center justify-center transition-transform active:scale-95 ${stateColorMap[st]}`}
              >
                <span className="text-xs font-extrabold">{weekdayLabels[k]}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
