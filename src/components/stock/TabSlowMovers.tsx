import React, { useState, useEffect } from 'react';
import { ComputedStockProduct, PlanScenario } from './types';
import { Tag, ArrowRight, RotateCcw, Check, Sparkles, AlertCircle, X } from 'lucide-react';

interface TabSlowMoversProps {
  items: ComputedStockProduct[];
  plan: PlanScenario;
}

export const TabSlowMovers: React.FC<TabSlowMoversProps> = ({ items }) => {
  // Items with slow movement or excess stock
  const slowItems = items.filter(
    (it) => it.status === 'Too much stock' || it.moneyStuck > 0 || it.inStock > 25
  );

  const totalStuck = slowItems.reduce((acc, it) => acc + it.moneyStuck, 0);

  // Discount modal state
  const [discountModalItem, setDiscountModalItem] = useState<ComputedStockProduct | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState<string | null>(null);

  // Clearance ideas from Gemini
  const [clearanceIdeas, setClearanceIdeas] = useState<Record<string, string[]>>({});
  const [loadingIdeas, setLoadingIdeas] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchIdeas = async () => {
      setLoadingIdeas(true);
      try {
        const primarySlow = slowItems[0] || items[0];
        if (!primarySlow) return;

        const res = await fetch('/api/ai/stock/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemName: primarySlow.name,
            stuckAmount: primarySlow.moneyStuck,
            stockCount: primarySlow.inStock,
          }),
        });

        if (!res.ok) throw new Error('Ideas fetch failed');
        const data = await res.json();
        if (isMounted && data.ideas) {
          setClearanceIdeas({ [primarySlow.id]: data.ideas });
        }
      } catch {
        if (isMounted) {
          setClearanceIdeas({
            'sp-6': [
              'Offer a 15% discount combo when bought with any charger.',
              'Keep 5 pieces on the billing counter as quick add-ons for Rs 199.',
            ],
            'sp-5': [
              'Bundle power bank with phone purchase at Rs 1,499 special price.',
              'Display in weekend gadget special basket near shop entrance.',
            ],
          });
        }
      } finally {
        if (isMounted) setLoadingIdeas(false);
      }
    };

    fetchIdeas();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const handleApplyDiscount = () => {
    if (!discountModalItem) return;
    const newPrice = Math.round(
      discountModalItem.price * ((100 - discountPercent) / 100)
    );
    setDiscountSuccessMessage(
      `Special offer applied: ${discountModalItem.name} discounted from Rs ${discountModalItem.price.toLocaleString(
        'en-IN'
      )} to Rs ${newPrice.toLocaleString('en-IN')} (${discountPercent}% off)`
    );
    setDiscountModalItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1B2420] ">
            Slow Movers & Extra Stock
          </h2>
          <p className="text-sm text-[#66726C]  mt-0.5">
            Where is my money stuck? Find slow items, clear stock, and free up cash for fast sellers.
          </p>
        </div>

        {/* Money Stuck Card */}
        <div className="bg-[#ECE9FB]  px-5 py-3.5 rounded-2xl flex items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#4338CA]  uppercase block">
              Total Money Locked
            </span>
            <span className="text-2xl font-extrabold text-[#4338CA] ">
              Rs {totalStuck.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-l border-[#4338CA]/20 pl-4 text-xs font-semibold text-[#4338CA] ">
            {slowItems.length} products with excess stock
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {discountSuccessMessage && (
        <div className="bg-[#DFF3E6] border border-[#86EFAC] rounded-[18px] p-4 text-xs sm:text-sm text-[#15803D] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <Check className="w-5 h-5 shrink-0" />
            <span>{discountSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDiscountSuccessMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Slow Moving Products Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slowItems.map((item) => {
          const ideas = clearanceIdeas[item.id] || [
            `Bundle 1 unit with VoltSpeed Charger for quick checkout.`,
            `Offer 10% discount to clear ${item.inStock} units in 14 days.`,
          ];

          return (
            <div
              key={item.id}
              className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-[#F6F4EF] ">
                      {item.imageEmoji}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#1B2420]  leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#66726C]  mt-0.5">
                        {item.category} • Cost: Rs {item.costPrice}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6E4FB] text-[#4338CA]">
                    Slow Stock
                  </span>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-2 mt-4 bg-[#F6F4EF]  p-3 rounded-xl border border-[#E4E1D8]/60 ">
                  <div>
                    <span className="text-[11px] text-[#66726C]  font-medium block">
                      In stock
                    </span>
                    <span className="text-base font-extrabold text-[#1B2420] ">
                      {item.inStock} pieces
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#4338CA]  font-medium block">
                      Money stuck
                    </span>
                    <span className="text-base font-extrabold text-[#4338CA] ">
                      Rs {item.moneyStuck.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* AI Ideas Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-[#ECE9FB]/60  text-xs text-[#4338CA]  space-y-1.5 border border-[#4338CA]/10">
                  <span className="font-bold uppercase tracking-wide text-[10px] block opacity-80">
                    Ideas to clear this stock
                  </span>
                  {ideas.map((idea, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 font-medium leading-relaxed">
                      <span className="font-bold">•</span>
                      <span>{idea}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E4E1D8]/60 ">
                <button
                  onClick={() => setDiscountModalItem(item)}
                  className="flex-1 min-h-[44px] bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Put on Sale</span>
                </button>
                <button
                  onClick={() =>
                    setDiscountSuccessMessage(
                      `Marked 10 units of ${item.name} for vendor return exchange with ${item.supplierName}.`
                    )
                  }
                  className="min-h-[44px] px-3.5 bg-white  border border-[#E4E1D8]  hover:bg-[#F6F4EF]  text-[#1B2420]  rounded-[12px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                  title="Return excess units to supplier"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Return</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Put on Sale Modal */}
      {discountModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8]  pb-3">
              <h3 className="font-bold text-[16px] text-[#1B2420] ">
                Put {discountModalItem.name} on Sale
              </h3>
              <button
                onClick={() => setDiscountModalItem(null)}
                className="text-[#66726C] hover:text-[#1B2420] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#66726C] ">
              Select a quick discount percentage to sell faster and recover Rs {discountModalItem.moneyStuck.toLocaleString('en-IN')} stuck in {discountModalItem.inStock} pieces.
            </p>

            {/* Discount selector pills */}
            <div className="flex items-center gap-3">
              {[10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    discountPercent === pct
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs'
                      : 'bg-[#F6F4EF]  text-[#1B2420]  border border-[#E4E1D8] '
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}
            </div>

            {/* Price Preview */}
            <div className="p-3.5 rounded-xl bg-[#F6F4EF]  text-xs space-y-1">
              <div className="flex justify-between text-[#66726C]">
                <span>Current MRP/Price:</span>
                <span className="line-through font-bold">Rs {discountModalItem.price}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-[#0F766E]">
                <span>New Sale Price:</span>
                <span>
                  Rs {Math.round(discountModalItem.price * ((100 - discountPercent) / 100))}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#15803D]">
                <span>Profit margin remaining:</span>
                <span>
                  Rs{' '}
                  {Math.round(
                    discountModalItem.price * ((100 - discountPercent) / 100) -
                      discountModalItem.costPrice
                  )}{' '}
                  per unit
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDiscountModalItem(null)}
                className="flex-1 min-h-[44px] bg-white  border border-[#E4E1D8]  text-[#1B2420]  rounded-[12px] font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 min-h-[44px] bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-xs cursor-pointer shadow-xs"
              >
                Apply Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
