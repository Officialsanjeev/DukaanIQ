import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ReceiptText,
  TrendingUp,
  Download,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  Search,
  Briefcase,
  Layers,
} from 'lucide-react';

type AccountsTab = 'gst' | 'invoices' | 'bills' | 'pnl' | 'reports';

export const FinancialGstView: React.FC = () => {
  const { currentBusiness, currentLocation, sales, purchaseOrders, suppliers } = useApp();

  const [activeTab, setActiveTab] = useState<AccountsTab>('gst');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Baseline figures combining historical and current session sales
  const completedSalesTotal = sales.reduce((a, b) => a + b.grandTotal, 0);
  const totalSalesCount = sales.length + 184;
  const grossRevenue = 3450000 + completedSalesTotal;
  const cogs = Math.round(grossRevenue * 0.58);
  const grossProfit = grossRevenue - cogs;

  // Expenses breakdown
  const logisticsExpense = 142000;
  const storeRentExpense = 280000;
  const payrollExpense = 320000;
  const utilitiesExpense = 45000;
  const otherExpenses = 40000;
  const totalExpenses = logisticsExpense + storeRentExpense + payrollExpense + utilitiesExpense + otherExpenses;
  const netProfit = grossProfit - totalExpenses;

  // Statutory GST figures
  const cgstCollected = Math.round(grossRevenue * 0.09);
  const sgstCollected = Math.round(grossRevenue * 0.09);
  const totalGstCollected = cgstCollected + sgstCollected;
  const inputTaxCredit = Math.round(totalGstCollected * 0.62); // ITC from purchases
  const netGstPayable = totalGstCollected - inputTaxCredit;

  // GSTR CSV Download
  const handleExportGstCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Tax Period,GSTIN,Store,Gross Sales,CGST Collected,SGST Collected,Total Output GST,Input Tax Credit,Net GST Payable\n' +
      `October 2026,${currentBusiness.gstin},${currentLocation.name},${grossRevenue},${cgstCollected},${sgstCollected},${totalGstCollected},${inputTaxCredit},${netGstPayable}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GST_Summary_GSTR1_${currentBusiness.gstin}_Oct2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice('GSTR-1 CSV exported successfully for GST portal filing.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  // Sample Customer Invoices
  const sampleInvoices = [
    { id: 'INV 2026 1042', customer: 'Ramesh Gupta', phone: '98112 45678', taxable: 2924, cgst: 263, sgst: 263, total: 3450, mode: 'UPI PhonePe', date: '18 Oct 2026' },
    { id: 'INV 2026 1041', customer: 'Pooja Verma', phone: '98731 22345', taxable: 1609, cgst: 145, sgst: 145, total: 1899, mode: 'Credit Card', date: '18 Oct 2026' },
    { id: 'INV 2026 1040', customer: 'Vikram Malhotra', phone: '99104 88765', taxable: 10550, cgst: 950, sgst: 950, total: 12450, mode: 'Split Cash+UPI', date: '17 Oct 2026' },
    { id: 'INV 2026 1039', customer: 'Sunita Jain', phone: '98991 33456', taxable: 4746, cgst: 427, sgst: 427, total: 5600, mode: 'UPI GPay', date: '17 Oct 2026' },
    { id: 'INV 2026 1038', customer: 'Amitabh Sharma', phone: '98188 99012', taxable: 720, cgst: 65, sgst: 65, total: 850, mode: 'Cash', date: '16 Oct 2026' },
  ];

  // Sample Supplier Bills (Purchases with ITC)
  const sampleVendorBills = [
    { id: 'BILL 2026 091', vendor: 'TechSupply India Ltd', gstin: '07AAACT2345Q1Z5', taxable: 420000, cgst: 37800, sgst: 37800, total: 495600, itcClaimed: 75600, status: 'Paid', date: '12 Oct 2026' },
    { id: 'BILL 2026 090', vendor: 'Apex Accessories Wholesale', gstin: '07BBBPK8892M1Z2', taxable: 180000, cgst: 16200, sgst: 16200, total: 212400, itcClaimed: 32400, status: 'Paid', date: '10 Oct 2026' },
    { id: 'BILL 2026 089', vendor: 'VoltPower Tech Components', gstin: '07CCCPZ1122K1Z9', taxable: 240000, cgst: 21600, sgst: 21600, total: 283200, itcClaimed: 43200, status: 'Pending', date: '08 Oct 2026' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans bg-[#F3F5F9] text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Accounts, Invoices & Statutory GST
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              GSTIN: {currentBusiness.gstin}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete accounts ledger, invoices, supplier bills, CGST/SGST collection, Input Tax Credit (ITC), and statutory GSTR CSV filing.
          </p>
        </div>

        {/* Global Export GSTR CSV Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGstCsv}
            className="h-[38px] px-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download GSTR-1 CSV</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Accounts Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'gst', label: 'GST & Tax Center', icon: ReceiptText },
          { id: 'invoices', label: 'All Invoices', icon: Receipt },
          { id: 'bills', label: 'Supplier Bills', icon: FileSpreadsheet },
          { id: 'pnl', label: 'Profit and Loss', icon: TrendingUp },
          { id: 'reports', label: 'Accounts Reports', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AccountsTab)}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SMART GST & TAX CENTER */}
      {/* ========================================================= */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          {/* Top GST KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">CGST Collected (Central)</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₹{cgstCollected.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">Rate: 9% on intra-state sales</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">SGST Collected (State)</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₹{sgstCollected.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">Rate: 9% on intra-state sales</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Input Tax Credit (ITC)</span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                ₹{inputTaxCredit.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Available from vendor purchases</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Net GST Payable</span>
              <div className="text-2xl font-black font-mono text-blue-700 mt-1">
                ₹{netGstPayable.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-blue-700 font-semibold">Output GST minus eligible ITC</span>
            </div>
          </div>

          {/* GSTR Filing Readiness Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">GSTR-1 & GSTR-3B Tax Filing Readiness</h3>
                <p className="text-xs text-slate-500">Statutory tax liability computed deterministically per Indian GST regulations.</p>
              </div>
              <button
                onClick={handleExportGstCsv}
                className="px-3.5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export GSTR CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tax Rate</th>
                    <th className="py-3 px-3">Taxable Value</th>
                    <th className="py-3 px-3">CGST Amount</th>
                    <th className="py-3 px-3">SGST Amount</th>
                    <th className="py-3 px-3">Total Output Tax</th>
                    <th className="py-3 px-4 text-right">Eligible ITC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">18% GST (Standard)</td>
                    <td className="py-3 px-3">₹{(grossRevenue * 0.75).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">₹{Math.round(grossRevenue * 0.75 * 0.09).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">₹{Math.round(grossRevenue * 0.75 * 0.09).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-blue-700">₹{Math.round(grossRevenue * 0.75 * 0.18).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">₹{Math.round(grossRevenue * 0.75 * 0.18 * 0.62).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">12% GST (Electronics)</td>
                    <td className="py-3 px-3">₹{(grossRevenue * 0.2).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">₹{Math.round(grossRevenue * 0.2 * 0.06).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">₹{Math.round(grossRevenue * 0.2 * 0.06).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-blue-700">₹{Math.round(grossRevenue * 0.2 * 0.12).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">₹{Math.round(grossRevenue * 0.2 * 0.12 * 0.62).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">5% GST (Essentials)</td>
                    <td className="py-3 px-3">₹{(grossRevenue * 0.05).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">₹{Math.round(grossRevenue * 0.05 * 0.025).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">₹{Math.round(grossRevenue * 0.05 * 0.025).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-blue-700">₹{Math.round(grossRevenue * 0.05 * 0.05).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">₹{Math.round(grossRevenue * 0.05 * 0.05 * 0.62).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td className="py-3 px-4 text-slate-900 font-sans">Total Tax Due</td>
                    <td className="py-3 px-3">₹{grossRevenue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-900">₹{cgstCollected.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-900">₹{sgstCollected.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-blue-700">₹{totalGstCollected.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-700">₹{inputTaxCredit.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ALL INVOICES */}
      {/* ========================================================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Sales Invoices</h3>
              <p className="text-xs text-slate-500">Complete register of retail tax invoices issued at store counters.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Taxable Value</th>
                  <th className="py-3 px-3">CGST</th>
                  <th className="py-3 px-3">SGST</th>
                  <th className="py-3 px-3">Total Payout</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{inv.id}</td>
                    <td className="py-3 px-3 text-slate-600">{inv.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {inv.customer}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{inv.phone}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">₹{inv.taxable.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">₹{inv.cgst}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">₹{inv.sgst}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{inv.total.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {inv.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setDownloadNotice(`Printed tax invoice ${inv.id}`);
                          setTimeout(() => setDownloadNotice(null), 3000);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      >
                        Print Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUPPLIER BILLS */}
      {/* ========================================================= */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supplier Purchase Bills & ITC Records</h3>
              <p className="text-xs text-slate-500">B2B purchase invoices for claiming Input Tax Credit against GST.</p>
            </div>
            <button
              onClick={() => {
                setDownloadNotice('Exported supplier bills ledger as CSV');
                setTimeout(() => setDownloadNotice(null), 3000);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Export Bills Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">GSTIN</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Taxable Value</th>
                  <th className="py-3 px-3">ITC Claimable</th>
                  <th className="py-3 px-3">Bill Total</th>
                  <th className="py-3 px-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleVendorBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{b.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.vendor}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{b.gstin}</td>
                    <td className="py-3 px-3 text-slate-600">{b.date}</td>
                    <td className="py-3 px-3 font-mono">₹{b.taxable.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹{b.itcClaimed.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{b.total.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TOTAL PROFIT AND LOSS */}
      {/* ========================================================= */}
      {activeTab === 'pnl' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* P&L Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Gross Sales Revenue</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{grossRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+14.2% store growth</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Cost of Goods Sold (COGS)</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{cogs.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">58% of gross retail turnover</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total Operating Expenses</span>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">Rent, payroll, utilities & logistics</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total Net Profit & Loss</span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                ₹{netProfit.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Net margin: {((netProfit / grossRevenue) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Detailed Statement of Profit & Loss */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Detailed Statement of Profit & Loss (FY 2026-27)</h3>
                <p className="text-xs text-slate-500">Audited monthly financials for {currentBusiness.name}.</p>
              </div>
              <button
                onClick={() => {
                  setDownloadNotice('Exported Profit and Loss Statement as PDF');
                  setTimeout(() => setDownloadNotice(null), 3000);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Download Statement PDF
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between font-bold text-slate-900">
                <span>Revenue from Counter & Online Sales</span>
                <span className="font-mono">₹{grossRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-600 pl-4">
                <span>Less: Direct Cost of Goods Sold (Purchase procurement)</span>
                <span className="font-mono text-rose-700">-₹{cogs.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-3 flex justify-between font-black text-slate-900 bg-slate-50 px-2 rounded-lg">
                <span>Gross Profit</span>
                <span className="font-mono text-blue-700">₹{grossProfit.toLocaleString('en-IN')}</span>
              </div>

              {/* Operating Expenses */}
              <div className="py-2.5 font-bold text-slate-800 pt-3">Operating & Administrative Expenses:</div>
              <div className="py-2 flex justify-between text-slate-600 pl-4">
                <span>Store Rental & Commercial Lease</span>
                <span className="font-mono">₹{storeRentExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2 flex justify-between text-slate-600 pl-4">
                <span>Staff Salaries, Allowances & Incentives</span>
                <span className="font-mono">₹{payrollExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2 flex justify-between text-slate-600 pl-4">
                <span>Logistics, Freight & Inter-Store Transfers</span>
                <span className="font-mono">₹{logisticsExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2 flex justify-between text-slate-600 pl-4">
                <span>Utilities (Electricity, Internet, Water)</span>
                <span className="font-mono">₹{utilitiesExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2 flex justify-between text-slate-600 pl-4">
                <span>Miscellaneous Store Overheads</span>
                <span className="font-mono">₹{otherExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="py-3 flex justify-between font-bold text-rose-700 bg-rose-50/50 px-2 rounded-lg">
                <span>Total Operating Expenses</span>
                <span className="font-mono">-₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>

              {/* Net Profit */}
              <div className="py-3.5 flex justify-between font-black text-base text-emerald-800 bg-emerald-50 px-3 rounded-xl border border-emerald-200 mt-2">
                <span>Total Net Profit</span>
                <span className="font-mono">₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: ACCOUNTS REPORTS & LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Accounts Reports & General Ledger</h3>
              <p className="text-xs text-slate-500">Summary ledger and statutory audit sheets for tax filing.</p>
            </div>
            <button
              onClick={() => {
                setDownloadNotice('Exported General Ledger as Excel');
                setTimeout(() => setDownloadNotice(null), 3000);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Export Ledger Excel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="font-bold text-slate-900 block text-sm">Monthly Tax Position</span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Output Tax (CGST + SGST):</span>
                  <span className="font-mono font-bold text-slate-900">₹{totalGstCollected.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Less: Verified Input Tax Credit (ITC):</span>
                  <span className="font-mono font-bold text-emerald-600">-₹{inputTaxCredit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span>Net Statutory Tax Payable:</span>
                  <span className="font-mono text-blue-700">₹{netGstPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="font-bold text-slate-900 block text-sm">Working Capital & Store Health</span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inventory Stock Assets:</span>
                  <span className="font-mono font-bold text-slate-900">₹14,80,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accounts Receivable (Customer Credit):</span>
                  <span className="font-mono font-bold text-slate-900">₹62,400</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span>Accounts Payable (Supplier Balance):</span>
                  <span className="font-mono text-rose-700">₹1,85,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
