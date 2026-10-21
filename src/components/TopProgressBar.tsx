import React from 'react';
import type { MonthlyProgressMetrics } from '../domains/office/types';
import type { TranslationDictionary } from '../domains/i18n';
import { formatMessage } from '../domains/i18n';

interface TopProgressBarProps {
  metrics: MonthlyProgressMetrics;
  t: TranslationDictionary;
  compact: boolean;
}

/**
 * One segment per required office day: attended (solid green),
 * planned (light green), still needed (empty).
 */
export const TopProgressBar: React.FC<TopProgressBarProps> = ({ metrics, t, compact }) => {
  // Segments never exceed the required days; any surplus is not shown.
  const total = metrics.requiredOfficeDays;
  const attended = Math.min(metrics.attendedOfficeDays, total);
  const planned = Math.min(metrics.plannedOfficeDays, total - attended);

  return (
    <section
      data-testid="top-progress-bar"
      data-mode={compact ? 'compact' : 'full'}
      className={`w-full bg-slate-900/95 border-b border-slate-800 ${
        compact ? 'px-3 py-1.5' : 'px-4 py-2.5'
      }`}
    >
      <div
        data-testid="progress-numbers"
        className="mb-1.5 text-xs font-semibold text-slate-200"
      >
        {formatMessage(t.progressSummary, {
          x: attended,
          y: metrics.requiredOfficeDays,
        })}
      </div>

      <div className="flex gap-1" data-testid="progress-segments">
        {Array.from({ length: total }).map((_, i) => {
          const kind = i < attended ? 'attended' : i < attended + planned ? 'planned' : 'empty';
          const cls = {
            attended: 'bg-emerald-400 border-emerald-400',
            planned: 'bg-emerald-400/20 border-emerald-400/40',
            empty: 'bg-transparent border-slate-700',
          }[kind];
          return (
            <div
              key={i}
              data-testid={`segment-${kind}`}
              className={`flex-1 rounded-sm border ${compact ? 'h-2.5' : 'h-3.5'} ${cls}`}
            />
          );
        })}
      </div>
    </section>
  );
};
