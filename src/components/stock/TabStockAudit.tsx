import React, { useState } from 'react';
import { ComputedStockProduct, PlanScenario } from './types';
import { CheckCircle2, AlertOctagon, Scan, Save, RefreshCw, Check } from 'lucide-react';

interface TabStockAuditProps {
  items: ComputedStockProduct[];
  plan: PlanScenario;
  onUpdateItemStock?: (id: string, newCount: number) => void;
}

export const TabStockAudit: React.FC<TabStockAuditProps> = ({ items, onUpdateItemStock }) => {
  // Physical count state initialized to system count with slight sample discrepancy on cable
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    items.forEach((it) => {
      // Simulate 1 small discrepancy for realism (e.g. 69 cables instead of 70)
      map[it.id] = it.id === 'sp-6' ? 69 : it.inStock;
    });
    return map;
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [scanActive, setScanActive] = useState<boolean>(false);
  const [scannedItemName, setScannedItemName] = useState<string | null>(null);

  const handlePhysicalCountChange = (id: string, val: string) => {
    const num = parseInt(val, 10);
    setCounts((prev) => ({
      ...prev,
      [id]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleSaveAudit = () => {
    setSavedSuccess(true);
    if (onUpdateItemStock) {
      Object.entries(counts).forEach(([id, cnt]) => {
        onUpdateItemStock(id, cnt);
      });
    }
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const simulateScan = () => {
    setScanActive(true);
    setTimeout(() => {
      setScanActive(false);
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setScannedItemName(`Verified: ${randomItem.name} (Barcode 8901234001015). Shelf count verified.`);
      setTimeout(() => setScannedItemName(null), 4000);
    }, 1200);
  };

  // Discrepancy stats
  let totalDifferenceValue = 0;
  let mismatchedItemsCount = 0;

  items.forEach((it) => {
    const physical = counts[it.id] ?? it.inStock;
    const diff = physical - it.inStock;
    if (diff !== 0) {
      mismatchedItemsCount += 1;
      totalDifferenceValue += diff * it.costPrice;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1B2420] ">
            Stock Audit & Shelf Count
          </h2>
          <p className="text-sm text-[#66726C]  mt-0.5">
            Is my stock count correct? Match actual physical counts on shelves with the software ledger.
          </p>
        </div>

        {/* Audit Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-[#E3F4F1]  px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#0F766E] ">
            Last Audit: <span className="font-extrabold text-[#1B2420] ">14 Oct 2026</span>
          </div>
          <div className="bg-[#DFF3E6]  px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#15803D] ">
            Accuracy: <span className="font-extrabold">99.6%</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="bg-[#DFF3E6] border border-[#86EFAC] rounded-[18px] p-4 text-xs sm:text-sm text-[#15803D] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Stock count reconciled! Store stock ledger updated to matched shelf values.</span>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {scannedItemName && (
        <div className="bg-[#DDF1EE] border border-[#0F766E]/30 rounded-[18px] p-4 text-xs sm:text-sm text-[#0F766E] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <Scan className="w-5 h-5 shrink-0" />
            <span>{scannedItemName}</span>
          </div>
          <button
            onClick={() => setScannedItemName(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Audit Card */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D8]/60 ">
          <div>
            <h3 className="text-[16px] font-bold text-[#1B2420] ">
              Shelf Verification (7 Items)
            </h3>
            <p className="text-xs text-[#66726C]  mt-0.5">
              Type the physical quantity found on the shop counter or shelf
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulateScan}
              disabled={scanActive}
              className="min-h-[44px] px-4 bg-[#F6F4EF]  border border-[#E4E1D8]  hover:bg-slate-200 text-[#1B2420]  rounded-[12px] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Scan className="w-4 h-4 text-[#0F766E]" />
              <span>{scanActive ? 'Scanning Barcode...' : 'Scan Shelf Barcode'}</span>
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4E1D8]  text-[#66726C]  font-bold">
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-2 text-right">System Ledger</th>
                <th className="py-3 px-4 text-center">Physical Count (Shelf)</th>
                <th className="py-3 px-2 text-right">Difference</th>
                <th className="py-3 px-3 text-right">Value Impact</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1D8]/60 ">
              {items.map((item) => {
                const physical = counts[item.id] ?? item.inStock;
                const diff = physical - item.inStock;
                const valueDiff = diff * item.costPrice;

                let tagConfig = {
                  bg: 'bg-[#DFF3E6]',
                  text: 'text-[#15803D]',
                  dot: 'bg-[#15803D]',
                  label: 'Matched',
                };

                if (diff < 0) {
                  tagConfig = {
                    bg: 'bg-[#FDE4DA]',
                    text: 'text-[#C2410C]',
                    dot: 'bg-[#C2410C]',
                    label: `Shortage (${diff})`,
                  };
                } else if (diff > 0) {
                  tagConfig = {
                    bg: 'bg-[#E6E4FB]',
                    text: 'text-[#4338CA]',
                    dot: 'bg-[#4338CA]',
                    label: `Excess (+${diff})`,
                  };
                }

                return (
                  <tr key={item.id} className="hover:bg-[#F6F4EF]/40  transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.imageEmoji}</span>
                        <div>
                          <div className="font-bold text-[#1B2420] ">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#66726C] ">
                            SKU: {item.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#1B2420] ">
                      {item.inStock} pcs
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          value={physical}
                          onChange={(e) => handlePhysicalCountChange(item.id, e.target.value)}
                          className={`w-20 py-1.5 text-center font-extrabold text-sm rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] ${
                            diff !== 0
                              ? 'border-amber-400 bg-amber-50/50 text-[#B45309]'
                              : 'border-[#E4E1D8]  bg-white  text-[#1B2420] '
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-bold">
                      {diff === 0 ? (
                        <span className="text-[#15803D]">0</span>
                      ) : diff > 0 ? (
                        <span className="text-[#4338CA]">+{diff}</span>
                      ) : (
                        <span className="text-[#C2410C]">{diff}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#1B2420] ">
                      {valueDiff === 0 ? (
                        <span className="text-[#66726C]">—</span>
                      ) : (
                        <span className={valueDiff < 0 ? 'text-[#C2410C]' : 'text-[#4338CA]'}>
                          {valueDiff > 0 ? '+' : ''}Rs {valueDiff.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${tagConfig.bg} ${tagConfig.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tagConfig.dot}`}></span>
                        {tagConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer & Save Button */}
        <div className="mt-6 pt-5 border-t border-[#E4E1D8]  flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#66726C] ">
            {mismatchedItemsCount === 0 ? (
              <span className="text-[#15803D] font-bold">
                ✓ All items match the system stock records perfectly.
              </span>
            ) : (
              <span className="text-[#B45309] font-bold">
                Notice: {mismatchedItemsCount} item difference detected (Total impact: Rs{' '}
                {totalDifferenceValue.toLocaleString('en-IN')}).
              </span>
            )}
          </div>

          <button
            onClick={handleSaveAudit}
            className="min-h-[44px] px-6 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Stock Reconciliation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
