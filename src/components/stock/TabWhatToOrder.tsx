import React, { useState } from 'react';
import { ComputedStockProduct, PlanScenario } from './types';
import { Plus, Minus, Check, Share2, FileText, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';

interface TabWhatToOrderProps {
  items: ComputedStockProduct[];
  plan: PlanScenario;
  onNavigateTab?: (tabIndex: number) => void;
}

export const TabWhatToOrder: React.FC<TabWhatToOrderProps> = ({ items, plan }) => {
  // Local quantity overrides for order sheet
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((it) => {
      initial[it.id] = it.suggestedOrder > 0 ? it.suggestedOrder : it.reorderPackSize;
    });
    return initial;
  });

  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'Urgent' | 'Order soon'>('All');
  const [orderCreatedPo, setOrderCreatedPo] = useState<string | null>(null);
  const [whatsappCopied, setWhatsappCopied] = useState<boolean>(false);

  // Filter items that need ordering
  const orderableItems = items.filter((it) => {
    const matchesUrgency =
      urgencyFilter === 'All'
        ? it.status === 'Urgent' || it.status === 'Order soon' || (quantities[it.id] || 0) > 0
        : it.status === urgencyFilter;
    const matchesSupplier =
      selectedSupplier === 'All' || it.supplierName === selectedSupplier;
    return matchesUrgency && matchesSupplier;
  });

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [id]: nextVal };
    });
  };

  const handleDirectQtyInput = (id: string, val: string) => {
    const num = parseInt(val, 10);
    setQuantities((prev) => ({
      ...prev,
      [id]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const totalOrderUnits = orderableItems.reduce((acc, it) => acc + (quantities[it.id] || 0), 0);
  const totalOrderCost = orderableItems.reduce(
    (acc, it) => acc + (quantities[it.id] || 0) * it.costPrice,
    0
  );

  const suppliersList = ['All', ...Array.from(new Set(items.map((it) => it.supplierName)))];

  const handleCreatePo = () => {
    const poNum = `PO-DEL-${Date.now().toString().slice(-5)}`;
    setOrderCreatedPo(poNum);
  };

  const handleShareWhatsApp = () => {
    const lines = [
      `*DukaanIQ Purchase Order - Delhi Flagship, Connaught Place*`,
      `Date: 16 Oct 2026 | Plan: ${plan === 'diwali' ? 'Diwali Order' : 'Regular Order'}`,
      `----------------------------------------`,
      ...orderableItems
        .filter((it) => (quantities[it.id] || 0) > 0)
        .map(
          (it) =>
            `• ${it.name}: ${quantities[it.id]} pcs @ Rs ${it.costPrice} = Rs ${((quantities[it.id] || 0) * it.costPrice).toLocaleString('en-IN')}`
        ),
      `----------------------------------------`,
      `*Total Estimated Amount: Rs ${totalOrderCost.toLocaleString('en-IN')}*`,
      `Please confirm dispatch date. Shukriya!`,
    ];

    const message = lines.join('\n');
    navigator.clipboard.writeText(message);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1B2420] ">
            What to Order
          </h2>
          <p className="text-sm text-[#66726C]  mt-0.5">
            What should I order right now? Review suggested pack quantities and generate purchase orders.
          </p>
        </div>

        {/* Total Cost Highlight */}
        <div className="flex items-center gap-4 bg-[#E3F4F1]  px-4 py-3 rounded-2xl">
          <div>
            <span className="text-[11px] font-semibold text-[#0F766E] uppercase block">
              Total Order Cost
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#0F766E] ">
              Rs {totalOrderCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-l border-[#0F766E]/20 pl-4">
            <span className="text-[11px] font-semibold text-[#0F766E] uppercase block">
              Total Items
            </span>
            <span className="text-xl font-bold text-[#1B2420] ">
              {totalOrderUnits} units
            </span>
          </div>
        </div>
      </div>

      {/* PO Success Banner */}
      {orderCreatedPo && (
        <div className="bg-[#DFF3E6] border border-[#86EFAC] rounded-[18px] p-4 text-xs sm:text-sm text-[#15803D] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
            <span>
              Purchase order #{orderCreatedPo} created successfully! Sent to Buying ledger.
            </span>
          </div>
          <button
            onClick={() => setOrderCreatedPo(null)}
            className="text-xs font-bold text-[#15803D] hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Supplier Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#66726C]  shrink-0">
            Supplier:
          </span>
          {suppliersList.map((sup) => (
            <button
              key={sup}
              onClick={() => setSelectedSupplier(sup)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSupplier === sup
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs'
                  : 'bg-[#F6F4EF]  text-[#66726C]  hover:text-[#1B2420] '
              }`}
            >
              {sup}
            </button>
          ))}
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#66726C]  shrink-0">
            Urgency:
          </span>
          {(['All', 'Urgent', 'Order soon'] as const).map((urg) => (
            <button
              key={urg}
              onClick={() => setUrgencyFilter(urg)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                urgencyFilter === urg
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs'
                  : 'bg-[#F6F4EF]  text-[#66726C]  hover:text-[#1B2420] '
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4E1D8]  text-[#66726C]  font-bold">
                <th className="py-3 px-3">Item & Category</th>
                <th className="py-3 px-2">Supplier</th>
                <th className="py-3 px-2 text-right">In Stock</th>
                <th className="py-3 px-2 text-right">Unit Buy Price</th>
                <th className="py-3 px-3 text-center">Order Quantity</th>
                <th className="py-3 px-3 text-right">Total Cost</th>
                <th className="py-3 px-2 text-center">Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1D8]/60 ">
              {orderableItems.map((item) => {
                const qty = quantities[item.id] || 0;
                const lineTotal = qty * item.costPrice;

                const statusPill = {
                  Urgent: { bg: 'bg-[#FDE4DA]', text: 'text-[#C2410C]', dot: 'bg-[#C2410C]' },
                  'Order soon': { bg: 'bg-[#FDEFD3]', text: 'text-[#B45309]', dot: 'bg-[#B45309]' },
                  'Too much stock': { bg: 'bg-[#E6E4FB]', text: 'text-[#4338CA]', dot: 'bg-[#4338CA]' },
                  Good: { bg: 'bg-[#DFF3E6]', text: 'text-[#15803D]', dot: 'bg-[#15803D]' },
                  Ordered: { bg: 'bg-[#DDF1EE]', text: 'text-[#0F766E]', dot: 'bg-[#0F766E]' },
                }[item.status];

                return (
                  <tr key={item.id} className="hover:bg-[#F6F4EF]/40  transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.imageEmoji}</span>
                        <div>
                          <div className="font-bold text-[#1B2420] ">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#66726C] ">
                            {item.category} • Pack of {item.reorderPackSize}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-[#1B2420] ">
                        {item.supplierName}
                      </div>
                      <div className="text-[11px] text-[#66726C] ">
                        Takes {item.supplierDeliveryDays} days
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold text-[#1B2420] ">
                      {item.inStock} pcs
                    </td>
                    <td className="py-3.5 px-2 text-right font-semibold text-[#1B2420] ">
                      Rs {item.costPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3">
                      {/* Counter +/- button */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQtyChange(item.id, -item.reorderPackSize)}
                          className="w-8 h-8 rounded-lg bg-[#F6F4EF]  border border-[#E4E1D8]  flex items-center justify-center text-[#1B2420]  hover:bg-slate-200 cursor-pointer transition-all active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) => handleDirectQtyInput(item.id, e.target.value)}
                          className="w-16 py-1.5 text-center font-bold text-sm bg-white  border border-[#E4E1D8]  rounded-lg text-[#1B2420]  focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                        />
                        <button
                          onClick={() => handleQtyChange(item.id, item.reorderPackSize)}
                          className="w-8 h-8 rounded-lg bg-[#F6F4EF]  border border-[#E4E1D8]  flex items-center justify-center text-[#1B2420]  hover:bg-slate-200 cursor-pointer transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-sm text-[#0F766E] ">
                      Rs {lineTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusPill.bg} ${statusPill.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dot}`}></span>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-6 pt-5 border-t border-[#E4E1D8]  flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#66726C] ">
            Prices shown are supplier buy cost. Pack sizes are recommended by supplier agreements.
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Share on WhatsApp Button */}
            <button
              onClick={handleShareWhatsApp}
              className="min-h-[44px] px-5 bg-white  border border-[#E4E1D8]  hover:bg-[#F6F4EF]  text-[#1B2420]  rounded-[12px] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              {whatsappCopied ? (
                <>
                  <Check className="w-4 h-4 text-[#15803D]" />
                  <span>Order Copied for WhatsApp!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Share on WhatsApp with Supplier</span>
                </>
              )}
            </button>

            {/* Create PO Button */}
            <button
              onClick={handleCreatePo}
              disabled={totalOrderUnits === 0}
              className="min-h-[44px] px-6 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white disabled:opacity-50 rounded-[12px] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
