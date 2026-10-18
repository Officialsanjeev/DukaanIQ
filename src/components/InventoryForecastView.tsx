import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Package,
  Sparkles,
  ArrowRightLeft,
  Barcode,
  Search,
  Filter,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Printer,
  X,
  Boxes,
  FileSpreadsheet,
  Upload,
  Download,
} from 'lucide-react';
import { AiInsightCard } from '../design-system/components/AiInsightCard';
import { KpiCard } from '../design-system/components/KpiCard';
import { CandyButton } from '../design-system/components/CandyButton';
import { StatusBadge } from '../design-system/components/StatusBadge';
import { PriceTagBadge } from '../design-system/components/PriceTagBadge';
import { CsvBulkUploadModal } from './inventory/CsvBulkUploadModal';
import { CriticalAlertsSection } from './inventory/CriticalAlertsSection';

export const InventoryForecastView: React.FC = () => {
  const {
    products,
    currentLocation,
    currentBusiness,
    adjustStock,
    transferStock,
    createPurchaseOrderDraft,
    getDemandForecasts,
    getCriticalStockAlerts,
    setActiveView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'forecast'>('forecast');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals state
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Inventory Count Reconciliation');

  const [transferModalProduct, setTransferModalProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferTargetLoc, setTransferTargetLoc] = useState<string>(
    currentBusiness.locations.find((l) => l.id !== currentLocation.id)?.id || ''
  );

  const [labelProduct, setLabelProduct] = useState<Product | null>(null);
  const [labelQrUrl, setLabelQrUrl] = useState<string>('');
  const [csvModalOpen, setCsvModalOpen] = useState<boolean>(false);

  const forecasts = getDemandForecasts();
  const criticalSummary = getCriticalStockAlerts();

  const handleOpenTransferFromAlert = (product: Product, defaultQty: number = 10) => {
    setTransferModalProduct(product);
    setTransferQty(defaultQty);
    const surplusLoc = currentBusiness.locations.find(
      (l) => l.id !== currentLocation.id && (product.stockOnHand[l.id] || 0) > 0
    );
    if (surplusLoc) {
      setTransferTargetLoc(surplusLoc.id);
    }
  };

  const handleOpenAdjustFromAlert = (product: Product) => {
    setAdjustModalProduct(product);
    setAdjustDelta(10);
    setAdjustReason('Critical Stock Shortage Adjustment');
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleOpenLabelModal = async (product: Product) => {
    setLabelProduct(product);
    try {
      const url = await QRCode.toDataURL(product.barcode, { width: 120, margin: 1 });
      setLabelQrUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAutoPO = (supplierId: string, items: { productId: string; qty: number; unitCost: number }[]) => {
    const poNum = createPurchaseOrderDraft(supplierId, items);
    alert(`Purchase Order ${poNum} successfully created and sent to Purchasing ledger.`);
    setActiveView('purchasing');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* View Header with Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Inventory & AI Demand Forecasting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock ledger, multi-store balances, and predictive AI reorder engine for {currentLocation.name}
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'forecast'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Demand Forecast & POs</span>
              {criticalSummary.totalFlagged > 0 && (
                <span className="text-[10px] bg-rose-600 text-white font-mono px-1.5 py-0.2 rounded-full font-bold shadow-2xs">
                  {criticalSummary.totalFlagged}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-slate-700" />
              <span>Stock Balances & Transfers</span>
            </button>
          </div>

          <CandyButton
            size="sm"
            variant="secondary"
            onClick={() => setCsvModalOpen(true)}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bulk CSV Upload</span>
          </CandyButton>
        </div>
      </div>

      {/* TAB 1: AI DEMAND FORECAST & REORDER ENGINE */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Critical Stock Alerts & Depletion Radar Section */}
          <CriticalAlertsSection
            onOpenTransferModal={handleOpenTransferFromAlert}
            onOpenAdjustModal={handleOpenAdjustFromAlert}
          />

          {/* Prominent Explainable AI Insight Card */}
          <AiInsightCard
            headline="Reorder 20 units of SonicPro Wireless ANC Headphones (SKU: AUDIO-ANC-01) from TechSupply India Ltd"
            reason="Current on-hand stock (14 units) has fallen below lead-time demand threshold (18 units). Sales velocity is pacing at +24% over weekly average."
            confidenceScore={94}
            confidenceLabel="High confidence"
            drivers={[
              { label: 'Current Sales Velocity', impact: '+24%', value: '4.8 units/day pacing' },
              { label: 'Supplier Lead Time', impact: '2.4 days', value: 'TechSupply India Ltd' },
              { label: 'Festival Demand Buffer', impact: '+15%', value: 'Diwali week historical' },
            ]}
            approveLabel="Approve PO Draft"
            onApprove={() => {
              const target = forecasts.find((f) => f.productId === 'prod-001') || forecasts[0];
              const prod = products.find((p) => p.id === target.productId)!;
              handleCreateAutoPO(target.supplierId, [
                {
                  productId: target.productId,
                  qty: 20,
                  unitCost: prod.costPrice,
                },
              ]);
            }}
          />

          {/* AI Intelligence KPI Banner using KpiCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Critical Stockout Risks"
              value={`${forecasts.filter((f) => f.stockoutRisk === 'Critical').length} Items`}
              delta={{ value: 'Needs action', isPositive: false, period: 'Stock < Lead time' }}
              subtext="Requires purchase reorder"
            />
            <KpiCard
              label="Reorders Recommended"
              value={`${forecasts.filter((f) => f.suggestedPurchaseQuantity > 0).length} SKUs`}
              delta={{ value: '30D Target', isPositive: true, period: 'Optimized velocity' }}
              subtext="Calculated from run-rate"
            />
            <KpiCard
              label="Average Lead Time"
              value="2.4 Days"
              delta={{ value: '98% On-Time', isPositive: true, period: 'Active suppliers' }}
              subtext="TechSupply & VoltPower"
            />
            <KpiCard
              label="Recommended Spend"
              value={`₹${forecasts
                .reduce((acc, f) => {
                  const prod = products.find((p) => p.id === f.productId);
                  return acc + f.suggestedPurchaseQuantity * (prod?.costPrice || 0);
                }, 0)
                .toLocaleString('en-IN')}`}
              delta={{ value: '+14% ROI', isPositive: true, period: 'Projected turnover' }}
              subtext="Target restock budget"
            />
          </div>

          {/* Forecast Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-trust">
            <div className="p-4.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                  Predictive Demand & Recommended Purchase Quantities
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated using lead-time demand, sales velocity, safety stock, and supplier pack sizes.
                </p>
              </div>
              <CandyButton
                size="sm"
                variant="primary"
                withArrow={true}
                onClick={() => {
                  const critical = forecasts.filter((f) => f.suggestedPurchaseQuantity > 0);
                  if (critical.length === 0) {
                    alert('No replenishment needed at this time.');
                    return;
                  }
                  const firstSupplierId = critical[0].supplierId;
                  const supplierItems = critical
                    .filter((c) => c.supplierId === firstSupplierId)
                    .map((c) => {
                      const prod = products.find((p) => p.id === c.productId)!;
                      return {
                        productId: c.productId,
                        qty: c.suggestedPurchaseQuantity,
                        unitCost: prod.costPrice,
                      };
                    });
                  handleCreateAutoPO(firstSupplierId, supplierItems);
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Auto-Draft POs for Critical SKUs</span>
              </CandyButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider font-heading">
                  <tr>
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Daily Velocity</th>
                    <th className="py-3 px-3">Lead Time</th>
                    <th className="py-3 px-3">30-Day Forecast</th>
                    <th className="py-3 px-3">Reorder Point</th>
                    <th className="py-3 px-3">Stockout Risk</th>
                    <th className="py-3 px-3 font-bold text-indigo-900">Recommended Order</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forecasts.map((item) => {
                    const prod = products.find((p) => p.id === item.productId)!;

                    return (
                      <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-heading">{item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {prod.sku} · Supplier: {item.supplierName}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {item.currentStock} {prod.unit}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {item.avgDailyDemand} /day
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {item.supplierLeadDays} days
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                          {item.predictedDemandNextMonth} units
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {item.safetyStock} units
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge
                            status={
                              item.stockoutRisk === 'Critical'
                                ? 'critical'
                                : item.stockoutRisk === 'Warning'
                                ? 'risk'
                                : 'healthy'
                            }
                            label={item.stockoutRisk}
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-900 text-sm">
                          {item.suggestedPurchaseQuantity > 0 ? (
                            <span>{item.suggestedPurchaseQuantity} units</span>
                          ) : (
                            <span className="text-slate-400 text-xs">Adequate</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.suggestedPurchaseQuantity > 0 ? (
                            <CandyButton
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                handleCreateAutoPO(item.supplierId, [
                                  {
                                    productId: item.productId,
                                    qty: item.suggestedPurchaseQuantity,
                                    unitCost: prod.costPrice,
                                  },
                                ]);
                              }}
                            >
                              Draft PO
                            </CandyButton>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT CATALOG & STOCK BALANCES */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by SKU, name, or barcode..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setCsvModalOpen(true)}
                title="Bulk upload product stock levels and metadata via CSV"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bulk CSV Upload</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">HSN & GST</th>
                    <th className="py-3 px-3">Cost Price</th>
                    <th className="py-3 px-3">Selling Price</th>
                    <th className="py-3 px-3">Delhi (Store)</th>
                    <th className="py-3 px-3">Mumbai (Hub)</th>
                    <th className="py-3 px-3">Bengaluru</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const delhiStock = p.stockOnHand['loc-delhi'] || 0;
                    const mumbaiStock = p.stockOnHand['loc-mumbai'] || 0;
                    const blrStock = p.stockOnHand['loc-blr'] || 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {p.sku} · Barcode: {p.barcode}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{p.category}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {p.hsnCode} ({p.taxRate}%)
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          ₹{p.costPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {delhiStock}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {mumbaiStock}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {blrStock}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setAdjustModalProduct(p);
                              setAdjustDelta(1);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            title="Adjust Stock Count"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setTransferModalProduct(p);
                              setTransferQty(10);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            title="Inter-Store Transfer"
                          >
                            Transfer
                          </button>
                          <button
                            onClick={() => handleOpenLabelModal(p)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            title="Print Barcode Label"
                          >
                            Barcode
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Adjust Inventory Balance</h3>
              <button onClick={() => setAdjustModalProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600">
              <div className="font-bold text-slate-900">{adjustModalProduct.name}</div>
              <div>Store: {currentLocation.name}</div>
              <div>Current On Hand: {adjustModalProduct.stockOnHand[currentLocation.id] || 0}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Delta (+ to add, - to subtract)
              </label>
              <input
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Audit Log</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustModalProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  adjustStock(adjustModalProduct.id, adjustDelta, adjustReason);
                  setAdjustModalProduct(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTER-STORE STOCK TRANSFER MODAL */}
      {transferModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Inter-Store Stock Transfer</h3>
              <button onClick={() => setTransferModalProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600">
              <div className="font-bold text-slate-900">{transferModalProduct.name}</div>
              <div>Source Location: {currentLocation.name}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Location</label>
              <select
                value={transferTargetLoc}
                onChange={(e) => setTransferTargetLoc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                {currentBusiness.locations
                  .filter((l) => l.id !== currentLocation.id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.city})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Quantity</label>
              <input
                type="number"
                min="1"
                max={transferModalProduct.stockOnHand[currentLocation.id] || 0}
                value={transferQty}
                onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTransferModalProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  transferStock(transferModalProduct.id, currentLocation.id, transferTargetLoc, transferQty);
                  setTransferModalProduct(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE BARCODE LABEL MODAL */}
      {labelProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Barcode Label Sticker</h3>
              <button onClick={() => setLabelProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center text-center">
              <div className="text-[10px] font-bold text-slate-700 uppercase">{currentBusiness.name}</div>
              <div className="text-xs font-bold text-slate-950 mt-1 max-w-[200px] truncate">
                {labelProduct.name}
              </div>
              {labelQrUrl && <img src={labelQrUrl} alt="Barcode" className="w-32 h-32 my-2" />}
              <div className="text-[11px] font-mono font-bold text-slate-800">{labelProduct.barcode}</div>
              <div className="text-sm font-extrabold text-blue-900 font-mono mt-1">
                MRP ₹{labelProduct.mrp.toLocaleString('en-IN')} (Incl. GST)
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLabelProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV BULK UPLOAD MODAL */}
      <CsvBulkUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
      />
    </div>
  );
};
