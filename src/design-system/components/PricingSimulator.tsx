import React, { useState } from 'react';
import { Tag, TrendingUp, Percent, Sparkles, CheckCircle2 } from 'lucide-react';
import { PriceTagBadge } from './PriceTagBadge';
import { CandyButton } from './CandyButton';

interface PricingSimulatorProps {
  basePrice?: number;
  baseCost?: number;
  baseUnitsPerMonth?: number;
  productName?: string;
  onApplyPromo?: (discountPercent: number) => void;
  className?: string;
}

export const PricingSimulator: React.FC<PricingSimulatorProps> = ({
  basePrice = 1499,
  baseCost = 850,
  baseUnitsPerMonth = 420,
  productName = 'VoltSpeed 65W GaN Dual Fast Charger',
  onApplyPromo,
  className = '',
}) => {
  const [discountPercent, setDiscountPercent] = useState<number>(12);
  const [applied, setApplied] = useState(false);

  // Elasticity calculation
  // Price elasticity of demand: ~1.8 for electronics accessories
  const elasticity = 1.8;
  const unitMultiplier = 1 + (discountPercent / 100) * elasticity;
  const simulatedUnits = Math.round(baseUnitsPerMonth * unitMultiplier);
  const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100));

  const baselineRevenue = basePrice * baseUnitsPerMonth;
  const simulatedRevenue = discountedPrice * simulatedUnits;
  const revenueUpliftPercent = Math.round(((simulatedRevenue - baselineRevenue) / baselineRevenue) * 100);

  const baselineProfit = (basePrice - baseCost) * baseUnitsPerMonth;
  const simulatedProfit = (discountedPrice - baseCost) * simulatedUnits;
  const profitUpliftPercent = Math.round(((simulatedProfit - baselineProfit) / baselineProfit) * 100);
  const marginPercent = Math.round(((discountedPrice - baseCost) / discountedPrice) * 100);

  const handleApply = () => {
    setApplied(true);
    if (onApplyPromo) onApplyPromo(discountPercent);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 space-y-5 relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 font-heading">
              Dynamic Pricing & Margin Simulator
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate demand elasticity for <strong>{productName}</strong>
          </p>
        </div>

        <PriceTagBadge color="mint" rotated={true}>
          {profitUpliftPercent >= 0 ? `+${profitUpliftPercent}% Net Profit` : 'Protects Margin'}
        </PriceTagBadge>
      </div>

      {/* Interactive Slider with Candy-style thumb */}
      <div className="space-y-3 bg-[#FBFAF7] p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-700 font-heading">
            Promotional Discount %
          </label>
          <span className="text-xl font-extrabold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
            {discountPercent}% OFF
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="35"
          step="1"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0% (MRP ₹{basePrice})</span>
          <span>15% Optimal sweetspot</span>
          <span>35% Clearance</span>
        </div>
      </div>

      {/* Live Calculated Outcome Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Offer Price
          </div>
          <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
            ₹{discountedPrice.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 line-through">MRP ₹{basePrice}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Units
          </div>
          <div className="text-lg font-extrabold font-mono text-indigo-700 mt-0.5">
            {simulatedUnits} pcs
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            +{Math.round((unitMultiplier - 1) * 100)}% volume
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gross Margin
          </div>
          <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
            {marginPercent}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Cost: ₹{baseCost}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gross Revenue
          </div>
          <div className="text-lg font-extrabold font-mono text-emerald-700 mt-0.5">
            ₹{simulatedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium font-mono">
            {revenueUpliftPercent >= 0 ? `+${revenueUpliftPercent}%` : `${revenueUpliftPercent}%`}
          </div>
        </div>
      </div>

      {/* Simulator Footer CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Price Recommendation: 12% to 15% maximizes turnover & cash flow.</span>
        </div>

        <CandyButton size="sm" variant="primary" onClick={handleApply}>
          {applied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Applied to Store</span>
            </>
          ) : (
            <span>Publish Price</span>
          )}
        </CandyButton>
      </div>
    </div>
  );
};
