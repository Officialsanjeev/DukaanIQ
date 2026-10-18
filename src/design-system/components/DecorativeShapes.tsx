import React from 'react';

export const BarcodeStripe: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`h-4 w-full flex items-center gap-1 opacity-25 select-none pointer-events-none ${className}`}
    >
      {[2, 4, 1, 3, 5, 2, 6, 2, 1, 4, 2, 5, 3, 2, 4, 1, 3, 6, 2, 4, 1, 5, 2, 3, 4, 2, 1, 5, 3, 2, 4].map(
        (width, idx) => (
          <div
            key={idx}
            className="h-full bg-slate-900 rounded-2xs"
            style={{ width: `${width * 2}px` }}
          />
        )
      )}
    </div>
  );
};

export const DotGridPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none opacity-20 ${className}`}
      style={{
        backgroundImage: 'radial-gradient(#1E293B 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
};

export const RetailBlob: React.FC<{
  color?: 'indigo' | 'violet' | 'amber' | 'pink';
  className?: string;
}> = ({ color = 'indigo', className = '' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500/25',
    violet: 'bg-violet-500/25',
    amber: 'bg-amber-400/20',
    pink: 'bg-pink-400/20',
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full blur-3xl pointer-events-none select-none ${colorClasses[color]} ${className}`}
    />
  );
};

export const ShelfProblemSolutionVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 bg-white rounded-2xl border-2 border-slate-900 shadow-pop ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-heading">
            The Retail Shelf Dilemma
          </span>
          <h4 className="text-base font-extrabold text-slate-900 font-heading">
            Manual Guesswork vs. DukaanIQ AI Engine
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
            <span>Stockout Gap</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
            <span>AI Optimized</span>
          </span>
        </div>
      </div>

      {/* Shelf Rows Visualization */}
      <div className="space-y-4 pt-2">
        {/* Shelf 1: Traditional Store (Gaps) */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
            <span>Traditional Store (Spreadsheet ordering)</span>
            <span className="text-red-600 font-bold font-mono">28% Stockout Rate</span>
          </div>
          <div className="flex items-end gap-2 p-2 bg-[#FBFAF7] rounded-xl border border-slate-200 h-20">
            <div className="w-12 h-14 bg-indigo-200 border-2 border-slate-900 rounded-md" />
            <div className="w-10 h-10 bg-indigo-200 border-2 border-slate-900 rounded-md" />
            {/* The GAP */}
            <div className="flex-1 h-16 border-2 border-dashed border-red-400 bg-red-50/70 rounded-md flex flex-col items-center justify-center text-center p-1">
              <span className="text-[10px] font-bold text-red-700 uppercase font-heading leading-tight">
                Out of Stock Risk
              </span>
              <span className="text-[8px] text-red-500 font-mono">Lost ₹42,000/wk</span>
            </div>
            <div className="w-12 h-12 bg-indigo-200 border-2 border-slate-900 rounded-md" />
            <div className="w-10 h-8 bg-indigo-200 border-2 border-slate-900 rounded-md" />
          </div>
        </div>

        {/* Shelf 2: DukaanIQ AI Shelf (Full, Balanced) */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
            <span>DukaanIQ AI Shelf (Automated lead-time forecasting)</span>
            <span className="text-emerald-700 font-bold font-mono">99.4% Availability</span>
          </div>
          <div className="flex items-end gap-2 p-2 bg-indigo-50/40 rounded-xl border-2 border-indigo-200 h-20">
            <div className="w-12 h-14 bg-gradient-to-t from-indigo-700 to-indigo-600 border-2 border-slate-900 rounded-md" />
            <div className="w-10 h-10 bg-gradient-to-t from-indigo-700 to-indigo-600 border-2 border-slate-900 rounded-md" />
            <div className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 border-2 border-slate-900 rounded-md flex items-center justify-center text-white text-xs font-bold font-heading shadow-xs">
              AI Replenished · Perfect Par Level
            </div>
            <div className="w-12 h-12 bg-gradient-to-t from-indigo-700 to-indigo-600 border-2 border-slate-900 rounded-md" />
            <div className="w-10 h-8 bg-gradient-to-t from-indigo-700 to-indigo-600 border-2 border-slate-900 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
