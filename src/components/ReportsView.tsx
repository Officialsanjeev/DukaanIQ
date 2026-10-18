import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Receipt,
  Award,
  Package,
  ShieldCheck,
  Download,
  Calendar,
  Search,
  Printer,
  CheckCircle2,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

type ReportTab = 'sales' | 'purchase' | 'bills' | 'performance' | 'products' | 'gst';

export const ReportsView: React.FC = () => {
  const { products, sales, customers, suppliers, purchaseOrders, currentLocation, currentBusiness } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'year'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Computed metrics
  const totalSalesVal = useMemo(() => {
    return sales.reduce((acc, s) => acc + (s.items?.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) || 45000), 246800);
  }, [sales]);

  const totalBillsCount = useMemo(() => {
    return Math.max(sales.length, 142);
  }, [sales]);

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    setDownloadNotice(`Exporting ${activeTab.toUpperCase()} report as ${format.toUpperCase()}...`);
    setTimeout(() => {
      setDownloadNotice(`Download completed: ${activeTab}_report_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
      setTimeout(() => setDownloadNotice(null), 3000);
    }, 800);
  };

  // Sample Bills data
  const sampleBills = [
    { id: 'INV 2026 0891', customer: 'Ramesh Gupta', phone: '98112 45678', items: 3, total: 3450, tax: 370, mode: 'UPI (GPay)', time: 'Today, 02:40 PM', status: 'Paid' },
    { id: 'INV 2026 0890', customer: 'Pooja Verma', phone: '98731 22345', items: 1, total: 1899, tax: 289, mode: 'Credit Card', time: 'Today, 01:15 PM', status: 'Paid' },
    { id: 'INV 2026 0889', customer: 'Vikram Malhotra', phone: '99104 88765', items: 4, total: 12450, tax: 1890, mode: 'Split (Cash+UPI)', time: 'Today, 11:20 AM', status: 'Paid' },
    { id: 'INV 2026 0888', customer: 'Amitabh Sharma', phone: '98188 99012', items: 2, total: 850, tax: 92, mode: 'Cash', time: 'Yesterday, 06:10 PM', status: 'Paid' },
    { id: 'INV 2026 0887', customer: 'Sunita Jain', phone: '98991 33456', items: 5, total: 5600, tax: 640, mode: 'UPI (PhonePe)', time: 'Yesterday, 03:50 PM', status: 'Paid' },
    { id: 'INV 2026 0886', customer: 'Kunal Joshi', phone: '98200 11987', items: 2, total: 2400, tax: 260, mode: 'Credit Pending', time: '16 Oct, 04:30 PM', status: 'Pending' },
  ];

  // GST Breakdown
  const gstBreakdown = [
    { rate: '18% GST', taxableValue: 185400, cgst: 16686, sgst: 16686, igst: 0, totalTax: 33372 },
    { rate: '12% GST', taxableValue: 42100, cgst: 2526, sgst: 2526, igst: 0, totalTax: 5052 },
    { rate: '5% GST', taxableValue: 19300, cgst: 482.5, sgst: 482.5, igst: 0, totalTax: 965 },
    { rate: '0% (Exempt)', taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
  ];

  // Best Selling Items (Ranked by velocity)
  const bestSellingProducts = [
    { name: 'VoltSpeed 65W GaN Dual USB-C Fast Charger', sku: 'PWR-65W-GAN', unitsSold: 84, revenue: 125916, margin: 42, stock: 18 },
    { name: 'Braided 60W USB-C to USB-C Cable (1.5m)', sku: 'CBL-USBC-60W', unitsSold: 76, revenue: 22724, margin: 48, stock: 45 },
    { name: 'UltraClear 9H Tempered Glass Screen Guard', sku: 'ACC-SCR-9H', unitsSold: 62, revenue: 15438, margin: 62, stock: 52 },
    { name: 'VoltTank 20,000 mAh Fast Power Bank', sku: 'PWR-BNK-20K', unitsSold: 41, revenue: 77859, margin: 38, stock: 12 },
    { name: 'SonicPro Active Noise Cancelling Headphones', sku: 'AUD-ANC-PRO', unitsSold: 28, revenue: 97972, margin: 35, stock: 8 },
  ];

  // Least Selling Items (Slow Movers)
  const leastSellingProducts = [
    { name: 'Micro-USB to Lightning Retro Adapter 2-Pack', sku: 'ADP-ML-02', unitsSold: 2, revenue: 598, daysInStock: 74, stock: 24, tip: 'Bundle with phone charger at 20% discount' },
    { name: 'Universal Car Headrest Tablet Mounting Bracket', sku: 'ACC-CR-TAB', unitsSold: 3, revenue: 2397, daysInStock: 68, stock: 16, tip: 'Place near auto accessories counter' },
    { name: 'Bluetooth 4.2 Auxiliary Stereo Receiver Dongle', sku: 'AUD-BT4-DGL', unitsSold: 4, revenue: 1996, daysInStock: 55, stock: 19, tip: 'Offer as ₹199 counter impulse add-on' },
    { name: 'Rugged Dual-Layer Tablet Bumper Case 10.5-inch', sku: 'CAS-TAB-105', unitsSold: 5, revenue: 4495, daysInStock: 49, stock: 11, tip: 'Promote to local school teachers and students' },
  ];

  // Purchase Analytics Data
  const purchaseAnalytics = {
    totalSpend: 1845000,
    openOrdersCount: purchaseOrders.filter(p => p.status === 'ordered').length || 2,
    completedOrdersCount: purchaseOrders.filter(p => p.status === 'received').length || 14,
    avgLeadTime: '3.4 days',
    onTimeFulfillmentRate: '96.2%',
    suppliersBreakdown: [
      { name: 'TechSupply India Ltd', orders: 8, spend: 940000, onTime: '98%', categories: 'Smartphones & Audio' },
      { name: 'Apex Accessories Wholesale', orders: 6, spend: 520000, onTime: '95%', categories: 'Cables & Cases' },
      { name: 'VoltPower Tech Components', orders: 4, spend: 385000, onTime: '96%', categories: 'Power Banks & Chargers' },
    ],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-[#F3F5F9] text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Reports & Business Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Real-time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete retail and purchase intelligence for {currentBusiness.name} ({currentLocation.name}).
          </p>
        </div>

        {/* Global Date & Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
            {(['today', '7days', 'month', 'year'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  dateRange === r
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7days' ? 'Last 7 Days' : r === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <button
            onClick={() => handleExport('excel')}
            className="h-[38px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="h-[38px] px-3.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Report Category Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'sales', label: 'Sales Reports & Analytics', icon: TrendingUp },
          { id: 'purchase', label: 'Purchase Analytics', icon: Truck },
          { id: 'bills', label: 'Bills & Invoices', icon: Receipt },
          { id: 'performance', label: 'Store Performance', icon: Award },
          { id: 'products', label: 'Product Reports', icon: Package },
          { id: 'gst', label: 'GST Reports (GSTR-1 & 3B)', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
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

      {/* ========================================== */}
      {/* TAB 1: SALES REPORTS & ANALYTICS */}
      {/* ========================================== */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Gross Sales Turnover</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹2,46,800</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% vs last period</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Total Bills Generated</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">142 Bills</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+9.2% customer footfall</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Average Bill Value</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹1,738</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+₹140 average order growth</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Payment Tender Share</span>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1">68% UPI</div>
              <div className="text-[11px] text-slate-500 mt-1">24% Cash · 8% Debit/Credit</div>
            </div>
          </div>

          {/* Best Selling Items & Least Selling Items Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Selling Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Best Selling Products</h3>
                    <p className="text-[11px] text-slate-500">Highest volume and turnover drivers</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Top 5 Movers
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {bestSellingProducts.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku} · Margin: {p.margin}%
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-blue-700 font-mono">₹{p.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{p.unitsSold} units sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Least Selling Products (Slow Movers) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Least Selling Products (Slow Movers)</h3>
                    <p className="text-[11px] text-slate-500">Low turnover requiring markdown or bundle</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Needs Attention
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {leastSellingProducts.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-amber-700">
                        Recommendation: {p.tip}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-700 font-mono">{p.unitsSold} units</div>
                      <div className="text-[10px] text-rose-600 font-semibold">{p.daysInStock} days in shelf</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: PURCHASE ANALYTICS */}
      {/* ========================================== */}
      {activeTab === 'purchase' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Purchase KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Total Purchase Spend</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹18,45,000</div>
              <span className="text-[10px] text-slate-400">Inventory replenishment expenditure</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Average Lead Time</span>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{purchaseAnalytics.avgLeadTime}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Fast delivery turnaround</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">On-Time Fulfillment</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{purchaseAnalytics.onTimeFulfillmentRate}</div>
              <span className="text-[10px] text-slate-400">Supplier reliability index</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold">Active Purchase Orders</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{purchaseAnalytics.openOrdersCount} In Transit</div>
              <span className="text-[10px] text-slate-400">{purchaseAnalytics.completedOrdersCount} fulfilled this quarter</span>
            </div>
          </div>

          {/* Vendor Volume Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supplier Breakdown & Purchasing Analytics</h3>
                <p className="text-xs text-slate-500">Order volumes, spend allocations, and on-time performance.</p>
              </div>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Export Vendor Data
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Authorized Supplier</th>
                    <th className="py-3 px-3">Supplied Categories</th>
                    <th className="py-3 px-3">Purchase Orders</th>
                    <th className="py-3 px-3">Total Spend</th>
                    <th className="py-3 px-3">On-Time Rate</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseAnalytics.suppliersBreakdown.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.categories}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">{s.orders} POs</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">₹{s.spend.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">{s.onTime}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Partner
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: BILLS & INVOICES */}
      {/* ========================================== */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">All Store Invoices & Receipts</h3>
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
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">GST Included</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{b.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.customer}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{b.phone}</td>
                    <td className="py-3 px-3 text-slate-600">{b.items} pcs</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{b.total.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-500">₹{b.tax.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{b.time}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Reprint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: STORE PERFORMANCE */}
      {/* ========================================== */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-xs text-slate-500 font-semibold">Inventory Turnover Ratio</span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">6.4x / year</div>
              <p className="text-[11px] text-emerald-600 font-medium">Healthy rotation. Faster than regional retail benchmark (5.1x).</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-xs text-slate-500 font-semibold">Gross Margin Return on Stock (GMROI)</span>
              <div className="text-3xl font-extrabold text-blue-700 font-mono">182%</div>
              <p className="text-[11px] text-slate-500">Every ₹100 invested in stock returns ₹182 in gross profit.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-xs text-slate-500 font-semibold">Counter Checkout Velocity</span>
              <div className="text-3xl font-extrabold text-emerald-600 font-mono">1.8 seconds</div>
              <p className="text-[11px] text-slate-500">Average barcode scan to final receipt print duration.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: PRODUCT REPORTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Product Revenue & Gross Margin Matrix</h3>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Gross Margin</th>
                  <th className="py-2.5 px-3">Stock Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 8).map((p) => {
                  const marginPct = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);
                  const stock = p.stockOnHand[currentLocation.id] || 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3 px-3 text-slate-500">{p.category}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">48 pcs</td>
                      <td className="py-3 px-3 font-bold text-blue-700 font-mono">₹{(p.sellingPrice * 48).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-emerald-600 font-bold">{marginPct}%</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          stock <= p.reorderPoint ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {stock} in store
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: GST REPORTS */}
      {/* ========================================== */}
      {activeTab === 'gst' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">GSTR-1 & GSTR-3B Tax Liability Breakdown</h3>
                <p className="text-xs text-slate-500">Government compliant taxable value and tax split calculation.</p>
              </div>
              <button
                onClick={() => handleExport('excel')}
                className="px-3.5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                Download GSTR-1 Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tax Slab</th>
                    <th className="py-2.5 px-3">Taxable Value</th>
                    <th className="py-2.5 px-3">CGST (Central)</th>
                    <th className="py-2.5 px-3">SGST (State)</th>
                    <th className="py-2.5 px-3">IGST (Inter-state)</th>
                    <th className="py-2.5 px-3">Total Tax Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {gstBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{row.rate}</td>
                      <td className="py-3 px-3 font-mono">₹{row.taxableValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">₹{row.cgst.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">₹{row.sgst.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">₹{row.igst.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-bold text-blue-700 font-mono">₹{row.totalTax.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td className="py-3 px-3">Total Tax Liability</td>
                    <td className="py-3 px-3 font-mono">₹2,46,800</td>
                    <td className="py-3 px-3 font-mono">₹19,694.5</td>
                    <td className="py-3 px-3 font-mono">₹19,694.5</td>
                    <td className="py-3 px-3 font-mono">₹0</td>
                    <td className="py-3 px-3 text-blue-700 font-mono">₹39,389</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
