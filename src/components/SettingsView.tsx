import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Printer,
  Receipt,
  Barcode,
  Save,
  CheckCircle2,
  Sliders,
  Bell,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentBusiness, currentLocation } = useApp();

  const [activeTab, setActiveTab] = useState<'store' | 'pos' | 'tax' | 'printer' | 'backup'>('store');
  const [savedToast, setSavedToast] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState(currentBusiness.name);
  const [gstin, setGstin] = useState(currentBusiness.gstin);
  const [phone, setPhone] = useState(currentBusiness.phone);
  const [email, setEmail] = useState(currentBusiness.email);
  const [address, setAddress] = useState(currentBusiness.address);

  // POS settings
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [enableRoundOff, setEnableRoundOff] = useState(true);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState('25');
  const [requireCustomerPhone, setRequireCustomerPhone] = useState(false);

  // Printer settings
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [receiptHeader, setReceiptHeader] = useState('Thank you for shopping with us!');
  const [receiptFooter, setReceiptFooter] = useState('Goods once sold cannot be returned without original bill.');

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Store Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store details, tax rules, billing preferences, and receipt printers.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          {savedToast ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'store'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Business & Location</span>
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>POS Billing Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('tax')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tax'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>GST & Taxes</span>
        </button>

        <button
          onClick={() => setActiveTab('printer')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'printer'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Thermal Printer</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Data & Export</span>
        </button>
      </div>

      {/* Tab 1: Store & Location Details */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-2xs">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            Store Profile & Tax Identifiers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store / Company Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN Number (15 Characters)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>These details automatically appear on your customer receipts and tax invoices.</span>
          </div>
        </div>
      )}

      {/* Tab 2: POS Rules */}
      {activeTab === 'pos' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-2xs">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            Billing Counter Preferences
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">Auto-Print Thermal Receipt</div>
                <div className="text-[11px] text-slate-500">Automatically trigger ESC/POS print dialog upon payment completion.</div>
              </div>
              <input
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">Audio Beep Feedback</div>
                <div className="text-[11px] text-slate-500">Play a crisp confirmation beep on barcode scanner or item addition.</div>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">Round Off Grand Total</div>
                <div className="text-[11px] text-slate-500">Round final bill amount to the nearest whole rupee (₹).</div>
              </div>
              <input
                type="checkbox"
                checked={enableRoundOff}
                onChange={(e) => setEnableRoundOff(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>

            <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-900">Maximum Cashier Discount Allowed</div>
                <div className="text-[11px] text-slate-500">Cashiers cannot apply line item discounts exceeding this percentage without manager PIN.</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={maxDiscountPercent}
                  onChange={(e) => setMaxDiscountPercent(e.target.value)}
                  className="w-16 px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
                <span className="text-xs font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tax Slabs */}
      {activeTab === 'tax' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Active GST Tax Slabs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated deterministically into CGST and SGST for intrastate sales.
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
              Deterministic Tax Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Exempt / Nil', rate: 0, desc: 'Fresh fruits, milk, grains' },
              { label: 'Essential', rate: 5, desc: 'Packaged food, edible oils' },
              { label: 'Standard I', rate: 12, desc: 'Processed food, dairy butter' },
              { label: 'Standard II', rate: 18, desc: 'Electronics, soaps, biscuits' },
              { label: 'Luxury / Cess', rate: 28, desc: 'Premium beverages, appliances' },
            ].map((slab) => (
              <div key={slab.rate} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-lg font-black font-heading text-slate-900">{slab.rate}%</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">{slab.label}</div>
                <div className="text-[10px] text-slate-400 mt-1">{slab.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Printer */}
      {activeTab === 'printer' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-2xs">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            Receipt Customization
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Paper Roll Width
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="width"
                    checked={paperWidth === '80mm'}
                    onChange={() => setPaperWidth('80mm')}
                  />
                  <span>80mm (Standard Desktop Thermal)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="width"
                    checked={paperWidth === '58mm'}
                    onChange={() => setPaperWidth('58mm')}
                  />
                  <span>58mm (Handheld Mobile Thermal)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt Header Note
              </label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt Footer Terms & Policy
              </label>
              <textarea
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Data & Backup */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-2xs">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            Export Store Records
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="font-bold text-xs text-slate-900">Catalogue & Price List (CSV)</div>
              <p className="text-[11px] text-slate-500">
                Download all products with SKUs, barcodes, HSN codes, cost, selling prices, and live stock.
              </p>
              <button
                onClick={() => {
                  const csvContent = 'data:text/csv;charset=utf-8,SKU,Name,Category,Price,Stock\n';
                  const encoded = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encoded);
                  link.setAttribute('download', 'dukaaniq_catalogue.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download Catalogue CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="font-bold text-xs text-slate-900">GSTR-1 Tax Summary Report</div>
              <p className="text-[11px] text-slate-500">
                Download GST breakdown file ready for your chartered accountant or GST portal upload.
              </p>
              <button
                onClick={() => {
                  const csvContent = 'data:text/csv;charset=utf-8,InvoiceNo,Date,Customer,TaxableValue,CGST,SGST,Total\n';
                  const encoded = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encoded);
                  link.setAttribute('download', 'gstr1_report.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export GSTR-1 File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
