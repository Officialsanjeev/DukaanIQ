import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CriticalInventoryAlert,
  ThresholdFilterMode,
  Product,
} from '../../types';
import {
  AlertTriangle,
  Flame,
  ArrowRightLeft,
  ShoppingCart,
  TrendingDown,
  Clock,
  ShieldCheck,
  Building2,
  PackageCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Boxes,
} from 'lucide-react';
import { CandyButton } from '../../design-system/components/CandyButton';
import { StatusBadge } from '../../design-system/components/StatusBadge';

interface CriticalAlertsSectionProps {
  onOpenTransferModal: (product: Product, defaultQty?: number) => void;
  onOpenAdjustModal: (product: Product) => void;
}

export const CriticalAlertsSection: React.FC<CriticalAlertsSectionProps> = ({
  onOpenTransferModal,
  onOpenAdjustModal,
}) => {
  const {
    currentLocation,
    currentBusiness,
    createPurchaseOrderDraft,
    getCriticalStockAlerts,
    setActiveView,
  } = useApp();

  const [filterMode, setFilterMode] = useState<ThresholdFilterMode>('all_flagged');
  const [customThreshold, setCustomThreshold] = useState<number>(15);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'urgency' | 'revenue_risk' | 'stock_asc' | 'days_left'>('urgency');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [orderedItemIds, setOrderedItemIds] = useState<{ [id: string]: boolean }>({});
  const [batchOrderedSuccess, setBatchOrderedSuccess] = useState<boolean>(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Evaluate alerts using the defined threshold function
  const summary = getCriticalStockAlerts({
    mode: filterMode,
    customThresholdValue: customThreshold,
    categoryFilter: selectedCategory,
    sortBy,
  });

  const categories = [
    'All',
    'Audio',
    'Smartphones',
    'Chargers & Cables',
    'Screen Guards',
    'Power Banks',
    'Smart Wearables',
    'Protective Cases',
  ];

  const handleSingleOrder = (alertItem: CriticalInventoryAlert) => {
    const poNum = createPurchaseOrderDraft(alertItem.supplierId, [
      {
        productId: alertItem.productId,
        qty: alertItem.suggestedPurchaseQuantity,
        unitCost: alertItem.product.costPrice,
      },
    ]);
    setOrderedItemIds((prev) => ({ ...prev, [alertItem.productId]: true }));
    setActionNotification(`Draft PO ${poNum} successfully created for ${alertItem.product.name} (${alertItem.suggestedPurchaseQuantity} units).`);
    setTimeout(() => setActionNotification(null), 5000);
  };

  const handleBatchOrderAll = () => {
    const replenishableAlerts = summary.alerts.filter((a) => a.suggestedPurchaseQuantity > 0);
    if (replenishableAlerts.length === 0) {
      alert('All flagged items are already adequately covered by inbound stock or do not require replenishment.');
      return;
    }

    // Group alerts by supplier
    const supplierGroups = new Map<string, { productId: string; qty: number; unitCost: number }[]>();
    replenishableAlerts.forEach((alert) => {
      const items = supplierGroups.get(alert.supplierId) || [];
      items.push({
        productId: alert.productId,
        qty: alert.suggestedPurchaseQuantity,
        unitCost: alert.product.costPrice,
      });
      supplierGroups.set(alert.supplierId, items);
    });

    const poNumbers: string[] = [];
    supplierGroups.forEach((items, supplierId) => {
      const poNum = createPurchaseOrderDraft(supplierId, items);
      poNumbers.push(poNum);
    });

    const newOrderedIds: { [id: string]: boolean } = {};
    replenishableAlerts.forEach((a) => {
      newOrderedIds[a.productId] = true;
    });
    setOrderedItemIds(newOrderedIds);
    setBatchOrderedSuccess(true);
    setTimeout(() => setBatchOrderedSuccess(false), 6000);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-rose-200/80 shadow-trust overflow-hidden transition-all">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50/50 to-white p-5 border-b border-rose-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-rose-100">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 font-heading tracking-tight">
                Critical Stock Alerts & Depletion Radar
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>{summary.totalFlagged} SKUs Triggered</span>
              </span>
              {summary.canTransferFromWarehouseCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {summary.canTransferFromWarehouseCount} Available in Central Hub
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated threshold monitoring for <strong>{currentLocation.name}</strong>. Flagging stockouts, run-rate depletion, and lead-time risks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summary.totalFlagged > 0 && (
            <CandyButton
              size="sm"
              variant="primary"
              onClick={handleBatchOrderAll}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Auto-Draft All ({summary.totalFlagged} SKUs)</span>
            </CandyButton>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 space-y-5">
          {/* Batch Success Banner */}
          {batchOrderedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Successfully drafted purchase orders for all critical SKUs! Inbound quantities logged.
                </span>
              </div>
              <button
                onClick={() => setActiveView('purchasing')}
                className="font-bold underline text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                View in Purchasing →
              </button>
            </div>
          )}

          {/* Single Action Notification Banner */}
          {actionNotification && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">{actionNotification}</span>
              </div>
              <button
                onClick={() => setActionNotification(null)}
                className="text-blue-500 hover:text-blue-800 cursor-pointer text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Interactive Threshold Control Bar */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter Mode Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Threshold Rule:</span>
              </span>
              <button
                type="button"
                onClick={() => setFilterMode('all_flagged')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'all_flagged'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                All Flagged ({summary.totalFlagged})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('critical_only')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'critical_only'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Critical Buffer ({summary.criticalCount + summary.outOfStockCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('out_of_stock')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'out_of_stock'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Zero Stock ({summary.outOfStockCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('custom_qty')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'custom_qty'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Custom Threshold
              </button>

              {filterMode === 'custom_qty' && (
                <div className="flex items-center gap-1.5 ml-2 bg-white px-2.5 py-1 rounded-lg border border-rose-300">
                  <span className="text-[11px] text-slate-500 font-semibold">Stock &le;</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-1.5 py-0.5 border border-slate-200 rounded font-mono font-bold text-center text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[11px] text-slate-500">units</span>
                </div>
              )}
            </div>

            {/* Filter and Sort options */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="urgency">Sort by Urgency</option>
                <option value="revenue_risk">Sort by Revenue at Risk</option>
                <option value="stock_asc">Sort by Lowest Stock</option>
                <option value="days_left">Sort by Days Remaining</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Flagged Under Threshold
              </div>
              <div className="text-xl font-extrabold text-rose-900 font-mono mt-0.5">
                {summary.totalFlagged} Products
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">
                {summary.outOfStockCount} zero stock · {summary.criticalCount} critical lead buffer
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Total Shortage Units
              </div>
              <div className="text-xl font-extrabold text-amber-900 font-mono mt-0.5">
                {summary.totalShortageUnits} Units
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Replenishment needed for safety stock
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Daily Revenue at Risk
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                ₹{summary.totalDailyRevenueAtRisk.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Estimated sales lost per day if stocked out
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Instant Hub Transfer
              </div>
              <div className="text-xl font-extrabold text-indigo-900 font-mono mt-0.5">
                {summary.canTransferFromWarehouseCount} SKUs
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">
                Central Warehouse Hub has surplus stock
              </div>
            </div>
          </div>

          {/* Alert Cards Container */}
          {summary.alerts.length === 0 ? (
            /* Zero State: All Good */
            <div className="p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-emerald-950 font-heading">
                All Stock Levels Healthy
              </div>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                No items at <strong>{currentLocation.name}</strong> currently fall below the {filterMode === 'custom_qty' ? `custom threshold of ${customThreshold} units` : 'reorder and lead-time safety thresholds'}.
              </p>
            </div>
          ) : (
            /* Alert Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.alerts.map((alert) => {
                const isOrdered = orderedItemIds[alert.productId];
                const pctOfThreshold = Math.min(
                  100,
                  Math.round((alert.currentStock / (alert.threshold || 1)) * 100)
                );

                return (
                  <div
                    key={alert.productId}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.severity === 'out_of_stock'
                        ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-300'
                        : alert.severity === 'critical'
                        ? 'bg-amber-50/30 border-amber-300'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Severity & Code */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {alert.severity === 'out_of_stock' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                            <Flame className="w-3 h-3" />
                            <span>OUT OF STOCK</span>
                          </span>
                        ) : alert.severity === 'critical' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                            <AlertTriangle className="w-3 h-3" />
                            <span>CRITICAL BUFFER (&le; {alert.leadTimeDays}d lead)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-white">
                            <TrendingDown className="w-3 h-3" />
                            <span>BELOW REORDER POINT</span>
                          </span>
                        )}

                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {alert.product.sku}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400">
                        {alert.product.category}
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="font-extrabold text-sm text-slate-900 font-heading line-clamp-1" title={alert.product.name}>
                      {alert.product.name}
                    </div>

                    {/* Stock Progress Bar against Threshold */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Current Stock: <strong className="font-mono text-slate-900 text-xs">{alert.currentStock} {alert.product.unit}</strong>
                        </span>
                        <span className="text-slate-500">
                          Threshold: <strong className="font-mono text-slate-900">{alert.threshold} {alert.product.unit}</strong>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            alert.currentStock === 0
                              ? 'w-0'
                              : alert.severity === 'critical'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(5, pctOfThreshold)}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric Highlights */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                      <div>
                        <div className="text-slate-400 font-medium">Days Left</div>
                        <div className={`font-mono font-bold mt-0.5 ${
                          alert.daysOfSupplyRemaining <= 2 ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                        }`}>
                          {alert.currentStock === 0 ? '0 Days' : `${alert.daysOfSupplyRemaining} Days`}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 font-medium">Daily Velocity</div>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">
                          {alert.avgDailyDemand} /day
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 font-medium">Lost Revenue Risk</div>
                        <div className="font-mono font-bold text-rose-700 mt-0.5">
                          ₹{alert.potentialLostDailyRevenue.toLocaleString('en-IN')}/day
                        </div>
                      </div>
                    </div>

                    {/* Alternate Hub Transfer Notice if available */}
                    {alert.hasAlternateStockLocation && (
                      <div className="mt-3 p-2 rounded-lg bg-indigo-50 border border-indigo-200/80 text-[11px] text-indigo-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>
                            <strong>{alert.hasAlternateStockLocation.locationName}</strong> has{' '}
                            <strong>{alert.hasAlternateStockLocation.availableStock}</strong> units available.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenTransferModal(alert.product, alert.shortageQuantity)}
                          className="font-bold underline text-indigo-700 hover:text-indigo-950 cursor-pointer whitespace-nowrap ml-2"
                        >
                          Transfer Now
                        </button>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        Lead: {alert.leadTimeDays}d · {alert.supplierName}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenAdjustModal(alert.product)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Adjust
                        </button>

                        {alert.suggestedPurchaseQuantity > 0 ? (
                          <button
                            type="button"
                            disabled={isOrdered}
                            onClick={() => handleSingleOrder(alert)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isOrdered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                            }`}
                          >
                            {isOrdered ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>PO Drafted</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Draft PO ({alert.suggestedPurchaseQuantity})</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            Covered Inbound
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
