import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Check, X, Sliders } from 'lucide-react';
import { CandyButton } from './CandyButton';

export interface DriverFactor {
  label: string;
  impact: string; // e.g. "+18% seasonal run-rate"
  value: string;
}

interface AiInsightCardProps {
  headline: string;
  reason: string;
  confidenceScore: number; // 0 to 100
  confidenceLabel?: string;
  drivers?: DriverFactor[];
  onApprove?: () => void;
  onEdit?: () => void;
  onDismiss?: () => void;
  approveLabel?: string;
  className?: string;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({
  headline,
  reason,
  confidenceScore,
  confidenceLabel = 'High confidence',
  drivers = [
    { label: 'Sales Velocity', impact: '+24%', value: '4.8 units/day average' },
    { label: 'Supplier Lead Time', impact: '2.4 days', value: 'TechSupply Ltd' },
    { label: 'Upcoming Festive Demand', impact: '+15%', value: 'Diwali week historical' },
  ],
  onApprove,
  onEdit,
  onDismiss,
  approveLabel = 'Approve Order',
  className = '',
}) => {
  const [showWhy, setShowWhy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'approved' | 'dismissed'>('idle');

  if (status === 'dismissed') return null;

  return (
    <div
      className={`relative bg-white rounded-xl border border-slate-200/90 shadow-trust p-4.5 overflow-hidden transition-all hover:-translate-y-0.5 ${className}`}
    >
      {/* 4px Indigo-to-Violet gradient left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-600 to-violet-600" />

      <div className="pl-2 space-y-3">
        {/* Header row: AI Chip and Confidence */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 fill-indigo-600/20" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 font-heading">
              AI Operational Insight
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-500">
              {confidenceLabel} ({confidenceScore}%)
            </span>
          </div>
        </div>

        {/* Plain-Language Headline */}
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 font-heading leading-snug">
            {headline}
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{reason}</p>
        </div>

        {/* "Why this?" Disclosure */}
        <div>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Why this recommendation?</span>
            {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showWhy && (
            <div className="mt-2.5 p-3 bg-[#FBFAF7] rounded-lg border border-slate-200 text-xs space-y-1.5 animate-in fade-in duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Inputs & Demand Drivers Evaluated:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {drivers.map((d, i) => (
                  <div key={i} className="p-2 bg-white rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">{d.label}</div>
                    <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{d.impact}</div>
                    <div className="text-[9px] text-slate-400 truncate">{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-[10px] text-slate-400">Human approval required</div>
          <div className="flex items-center gap-2">
            {onDismiss && (
              <button
                onClick={() => {
                  setStatus('dismissed');
                  onDismiss();
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold cursor-pointer"
              >
                Edit Parameters
              </button>
            )}
            <CandyButton
              size="sm"
              variant="primary"
              onClick={() => {
                setStatus('approved');
                if (onApprove) onApprove();
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{approveLabel}</span>
            </CandyButton>
          </div>
        </div>
      </div>
    </div>
  );
};
