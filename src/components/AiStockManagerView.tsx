import React, { useState, useMemo } from 'react';
import {
  PlanScenario,
  INITIAL_STOCK_PRODUCTS,
  computeStockMetrics,
  ComputedStockProduct,
} from './stock/types';
import { TabOverview } from './stock/TabOverview';
import { TabDemandForecast } from './stock/TabDemandForecast';
import { TabWhatToOrder } from './stock/TabWhatToOrder';
import { TabSlowMovers } from './stock/TabSlowMovers';
import { TabStockAudit } from './stock/TabStockAudit';
import { TabSuppliers } from './stock/TabSuppliers';
import { StockAskModal } from './stock/StockAskModal';
import { StockHealthModal } from './stock/StockHealthModal';
import {
  Download,
  Printer,
  Share2,
  FileSpreadsheet,
  ChevronDown,
  Check,
  Calendar,
} from 'lucide-react';

export const AiStockManagerView: React.FC = () => {
  // Plan Scenario: 'normal' | 'diwali' | 'sale'
  const [plan, setPlan] = useState<PlanScenario>('normal');

  // 6 Tabs
  const [activeTab, setActiveTab] = useState<number>(0);

  // Products stock state (can be updated by Stock Audit reconciliation)
  const [products, setProducts] = useState(INITIAL_STOCK_PRODUCTS);

  // Export dropdown state
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Health breakdown modal
  const [healthModalOpen, setHealthModalOpen] = useState(false);

  // Compute metrics dynamically based on active plan scenario
  const {
    items,
    totalStockValue,
    itemsToOrderCount,
    urgentCount,
    moneyStuckTotal,
  } = useMemo(() => {
    return computeStockMetrics(products, plan);
  }, [products, plan]);

  // Tab definitions answering one question each
  const tabs = [
    { id: 'overview', label: 'Overview', question: 'How is my stock today?' },
    { id: 'forecast', label: 'Demand Forecast', question: 'How much will I sell next month?' },
    { id: 'order', label: 'What to Order', question: 'What should I order right now?' },
    { id: 'slow', label: 'Slow Movers', question: 'Where is my money stuck?' },
    { id: 'audit', label: 'Stock Audit', question: 'Is my stock count correct?' },
    { id: 'suppliers', label: 'Suppliers', question: 'Who delivers on time and cheapest?' },
  ];

  // Quick Order jump from Overview or Forecast to What to Order
  const handleQuickOrder = (item: ComputedStockProduct) => {
    setActiveTab(2); // Jump to Tab 3 (What to Order)
  };

  const handleUpdateItemStock = (id: string, newCount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: newCount } : p))
    );
  };

  // Export handlers
  const handleDownloadCsv = () => {
    setExportMenuOpen(false);
    const headers = ['Item Name', 'SKU', 'Category', 'Price (Rs)', 'Cost (Rs)', 'In Stock', 'Likely Sales (30d)', 'Days Left', 'Suggested Order', 'Status'];
    const rows = items.map((i) => [
      `"${i.name}"`,
      i.sku,
      i.category,
      i.price,
      i.costPrice,
      i.inStock,
      i.likelySales,
      i.daysLeft,
      i.suggestedOrder,
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaanIQ_Stock_${plan}_16Oct2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Downloaded stock spreadsheet (CSV).');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrintPdf = () => {
    setExportMenuOpen(false);
    window.print();
  };

  const handleShareWhatsApp = () => {
    setExportMenuOpen(false);
    const text = `*DukaanIQ Stock Report - Delhi Flagship*\nPlan: ${plan === 'diwali' ? 'Diwali Month' : plan === 'sale' ? 'Big Sale (20% off)' : 'Normal Month'}\nTotal Stock Value: Rs ${totalStockValue.toLocaleString('en-IN')}\nItems to Order: ${itemsToOrderCount}\nUrgent Shortages: ${urgentCount}\nCash Stuck in Slow Items: Rs ${moneyStuckTotal.toLocaleString('en-IN')}`;
    navigator.clipboard.writeText(text);
    setExportNotice('Summary copied! Opening WhatsApp...');
    setTimeout(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      setExportNotice(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF]  text-[#1B2420]  font-sans antialiased transition-colors pb-24">
      {/* Top Header Area */}
      <header className="sticky top-0 z-30 bg-[#F6F4EF]/95  backdrop-blur-md border-b border-[#E4E1D8]  px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title Area */}
          <div>
            <p className="text-xs text-[#66726C]  font-medium tracking-wide">
              Delhi Flagship, Connaught Place
            </p>
            <h1 className="text-[26px] font-bold text-[#1B2420]  leading-tight mt-0.5">
              AI Stock Manager
            </h1>
          </div>

          {/* Controls: Plan for dropdown + Export button */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* "Plan for" Dropdown */}
            <div className="flex items-center gap-2 bg-white  border border-[#E4E1D8]  rounded-[12px] px-3.5 py-2 shadow-xs">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#66726C]  font-bold uppercase tracking-wider">
                  Plan for
                </span>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanScenario)}
                  className="bg-transparent text-xs font-bold text-[#1B2420]  cursor-pointer focus:outline-hidden"
                >
                  <option value="normal" className="text-black">Normal month</option>
                  <option value="diwali" className="text-black">Diwali month (8 Nov)</option>
                  <option value="sale" className="text-black">Big sale (20% off)</option>
                </select>
              </div>
            </div>

            {/* Export Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="min-h-[44px] px-4 bg-white  border border-[#E4E1D8]  hover:bg-[#F6F4EF]  text-[#1B2420]  rounded-[12px] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-xs"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#66726C]" />
              </button>

              {/* Export Menu Dropdown */}
              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white  border border-[#E4E1D8]  rounded-[14px] shadow-xl p-2 z-40 space-y-1">
                  <button
                    onClick={handleDownloadCsv}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#1B2420]  hover:bg-[#F6F4EF]  flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>Download Excel file (CSV)</span>
                  </button>
                  <button
                    onClick={handlePrintPdf}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#1B2420]  hover:bg-[#F6F4EF]  flex items-center gap-2.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Print or save as PDF</span>
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#1B2420]  hover:bg-[#F6F4EF]  flex items-center gap-2.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Share summary on WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6 Pill Tabs Under the Top Bar */}
        <div className="max-w-7xl mx-auto mt-4 pt-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap focus:outline-hidden focus:ring-3 focus:ring-blue-500/40 ${
                  activeTab === idx
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs'
                    : 'bg-white  text-[#66726C]  hover:text-[#1B2420]  border border-[#E4E1D8] '
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Notice Toast */}
        {exportNotice && (
          <div className="mb-4 bg-[#DFF3E6] border border-[#86EFAC] rounded-[18px] p-4 text-xs font-bold text-[#15803D] flex items-center gap-2 shadow-xs">
            <Check className="w-4 h-4" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Active Tab View */}
        {activeTab === 0 && (
          <TabOverview
            items={items}
            totalStockValue={totalStockValue}
            itemsToOrderCount={itemsToOrderCount}
            urgentCount={urgentCount}
            moneyStuckTotal={moneyStuckTotal}
            plan={plan}
            onNavigateTab={(idx) => setActiveTab(idx)}
            onOpenDetailsModal={() => setHealthModalOpen(true)}
            onQuickOrder={handleQuickOrder}
          />
        )}

        {activeTab === 1 && (
          <TabDemandForecast
            items={items}
            plan={plan}
            onQuickOrder={handleQuickOrder}
          />
        )}

        {activeTab === 2 && (
          <TabWhatToOrder
            items={items}
            plan={plan}
            onNavigateTab={(idx) => setActiveTab(idx)}
          />
        )}

        {activeTab === 3 && (
          <TabSlowMovers
            items={items}
            plan={plan}
          />
        )}

        {activeTab === 4 && (
          <TabStockAudit
            items={items}
            plan={plan}
            onUpdateItemStock={handleUpdateItemStock}
          />
        )}

        {activeTab === 5 && (
          <TabSuppliers
            plan={plan}
          />
        )}
      </main>

      {/* Health Breakdown Modal */}
      <StockHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        items={items}
      />

      {/* Persistent Floating "Ask about stock" Button & Popup */}
      <StockAskModal
        items={items}
        plan={plan}
      />
    </div>
  );
};
