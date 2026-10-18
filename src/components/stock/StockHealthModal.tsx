import React from 'react';
import { ComputedStockProduct } from './types';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Package } from 'lucide-react';

interface StockHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ComputedStockProduct[];
}

export const StockHealthModal: React.FC<StockHealthModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  if (!isOpen) return null;

  const good = items.filter((i) => i.status === 'Good');
  const soon = items.filter((i) => i.status === 'Order soon');
  const urgent = items.filter((i) => i.status === 'Urgent');
  const tooMuch = items.filter((i) => i.status === 'Too much stock');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E4E1D8]  flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[18px] text-[#1B2420] ">
              Stock Health Breakdown
            </h3>
            <p className="text-xs text-[#66726C]  mt-0.5">
              Detailed condition of all {items.length} items at Delhi Flagship store
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#66726C] hover:text-[#1B2420]  rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Section: Urgent */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#C2410C]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C]"></span>
              <span>Urgent ({urgent.length} items) — Need order today</span>
            </div>
            <div className="divide-y divide-[#E4E1D8]/60  bg-[#FDE4DA]/40  rounded-xl p-3 border border-[#FDE4DA] ">
              {urgent.length === 0 ? (
                <div className="text-[#66726C]">No urgent shortages.</div>
              ) : (
                urgent.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#1B2420] ">
                        {item.imageEmoji} {item.name}
                      </span>
                      <p className="text-[11px] text-[#66726C] ">
                        Only {item.inStock} left • Sells {item.likelySales} in 30 days
                      </p>
                    </div>
                    <span className="font-extrabold text-[#C2410C]">
                      Order {item.suggestedOrder} pcs
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Order Soon */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#B45309]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
              <span>Order Soon ({soon.length} items) — 1 to 2 weeks of stock left</span>
            </div>
            <div className="divide-y divide-[#E4E1D8]/60  bg-[#FDEFD3]/40  rounded-xl p-3 border border-[#FDEFD3] ">
              {soon.length === 0 ? (
                <div className="text-[#66726C]">No items in this category.</div>
              ) : (
                soon.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#1B2420] ">
                        {item.imageEmoji} {item.name}
                      </span>
                      <p className="text-[11px] text-[#66726C] ">
                        {item.inStock} left ({item.daysLeft} days remaining)
                      </p>
                    </div>
                    <span className="font-extrabold text-[#B45309]">
                      Order {item.suggestedOrder} pcs
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Too Much Stock */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#4338CA]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4338CA]"></span>
              <span>Too Much Stock ({tooMuch.length} items) — Cash is locked</span>
            </div>
            <div className="divide-y divide-[#E4E1D8]/60  bg-[#E6E4FB]/40  rounded-xl p-3 border border-[#E6E4FB] ">
              {tooMuch.length === 0 ? (
                <div className="text-[#66726C]">No excess inventory.</div>
              ) : (
                tooMuch.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#1B2420] ">
                        {item.imageEmoji} {item.name}
                      </span>
                      <p className="text-[11px] text-[#66726C] ">
                        {item.inStock} in stock • Rs {item.moneyStuck.toLocaleString('en-IN')} locked
                      </p>
                    </div>
                    <span className="font-extrabold text-[#4338CA]">Do not order</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Good */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#15803D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]"></span>
              <span>Good ({good.length} items) — Balanced stock</span>
            </div>
            <div className="divide-y divide-[#E4E1D8]/60  bg-[#DFF3E6]/40  rounded-xl p-3 border border-[#DFF3E6] ">
              {good.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B2420] ">
                      {item.imageEmoji} {item.name}
                    </span>
                    <p className="text-[11px] text-[#66726C] ">
                      {item.inStock} units in stock • Lasts for {item.daysLeft} days
                    </p>
                  </div>
                  <span className="font-bold text-[#15803D]">Healthy</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E1D8]  flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-xs cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
