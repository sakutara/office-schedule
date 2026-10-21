import React, { useState } from 'react';
import { Plus, Minus, Check, ChevronDown } from 'lucide-react';
import type {
  CalculationMethod,
  EmployeeProfile,
  WeekdayKey,
  WeekdaySettingState,
} from '../domains/office/types';
import { WEEKDAY_ORDER } from '../domains/office/types';
import { getBuiltInVietnamHolidays } from '../domains/office/vietnamHolidays';
import {
  createDefaultWeeklySchedule,
  cycleWeekdayState,
} from '../domains/office/officeEngine';
import type { LanguageCode, TranslationDictionary } from '../domains/i18n';

interface SettingsTabProps {
  profiles: EmployeeProfile[];
  activeProfile: EmployeeProfile;
  onSelectProfile: (profileId: string) => void;
  onCycleActiveWeekday: (weekday: WeekdayKey) => void;
  onCreateProfile: (newProfile: EmployeeProfile) => void;
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

  const upcomingHolidays = getBuiltInVietnamHolidays(Number(todayStr.slice(0, 4)))
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

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
      className="flex-1 flex flex-col px-4 py-2.5 overflow-y-auto gap-2"
    >
      {/* 1. Employee selector + compact "new" icon button */}
      <section className="bg-slate-900/85 border border-slate-800 rounded-xl p-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          {t.profileSectionTitle}
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              id="select-employee-profile"
              data-testid="select-employee-profile"
              aria-label={t.selectProfileLabel}
              value={activeProfile.id}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="w-full appearance-none rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500/60 focus:border-emerald-400 focus:outline-none pl-3 pr-9 py-2.5 text-sm font-semibold text-slate-100"
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
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
          >
            {showNewForm ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400 truncate">{activeProfile.note}</p>

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

      <section className="bg-slate-900/85 border border-slate-800 rounded-xl p-3">
        <h3 className="text-xs font-bold text-slate-200 mb-2">{t.upcomingHolidaysTitle}</h3>
        {upcomingHolidays.length === 0 && (
          <div data-testid="no-upcoming-holidays" className="text-xs text-slate-500">
            {t.noUpcomingOff}
          </div>
        )}
        <ul data-testid="upcoming-holidays" className="flex flex-col gap-1">
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

      {/* 2. 7-Day Weekly Schedule Editor (Tap to cycle Gray -> Yellow -> Green) */}
      <section className="mt-auto bg-slate-900/85 border border-slate-800 rounded-xl p-3">
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
