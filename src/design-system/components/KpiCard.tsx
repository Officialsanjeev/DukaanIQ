import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string; // e.g. "+18.4%"
    isPositive: boolean;
    period?: string; // e.g. "vs last month"
  };
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  subtext,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-trust p-4.5 transition-all hover:shadow-trust-hover hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
          {label}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight tabular-nums">
          {value}
        </div>

        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
              delta.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {delta.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{delta.value}</span>
          </span>
        )}
      </div>

      {(subtext || delta?.period) && (
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>{subtext}</span>
          {delta?.period && <span className="text-slate-400 font-mono text-[10px]">{delta.period}</span>}
        </div>
      )}
    </div>
  );
};
