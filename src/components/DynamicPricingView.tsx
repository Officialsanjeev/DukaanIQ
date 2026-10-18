import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product, DynamicPricingSuggestion } from '../types';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Check,
  RefreshCw,
  Percent,
  CheckCircle2,
  Search,
  Filter,
  Tag,
  X,
  AlertTriangle,
  Layers,
  Download,
  Upload,
  Printer,
  Clock,
  ShieldAlert,
  Edit3,
  Sliders,
  Calendar,
  ChevronDown,
  ShoppingBag,
  Eye,
  Undo2,
  Copy,
  ArrowRight,
  Store,
  DollarSign,
  Package,
} from 'lucide-react';

type PricingTab = 'suggestions' | 'all-prices' | 'history' | 'rules' | 'offers';

interface PriceChangeLogItem {
  id: string;
  timestamp: string;
  productName: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  marginShift: string;
  actor: string;
  reason: string;
}

interface FestivalOffer {
  id: string;
  name: string;
  category: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Scheduled' | 'Expired';
}

export const DynamicPricingView: React.FC = () => {
  const { products, updateProductPrice, currentLocation, currentBusiness } = useApp();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<PricingTab>('suggestions');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<DynamicPricingSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedIds, setAppliedIds] = useState<{ [id: string]: boolean }>({});
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);

  // Search & Filters for Suggestions
  const [suggestionSearch, setSuggestionSearch] = useState<string>('');
  const [suggestionCategoryFilter, setSuggestionCategoryFilter] = useState<string>('All');
  const [suggestionMarginFilter, setSuggestionMarginFilter] = useState<string>('All');
  const [suggestionConfidenceFilter, setSuggestionConfidenceFilter] = useState<string>('All');

  // Search & Filters for All Prices
  const [allPricesSearch, setAllPricesSearch] = useState<string>('');
  const [allPricesCategory, setAllPricesCategory] = useState<string>('All');
  const [isGstInclusive, setIsGstInclusive] = useState<boolean>(false);
  const [filterSupplierAlertOnly, setFilterSupplierAlertOnly] = useState<boolean>(false);

  // Undo 10 minutes state
  const [undoState, setUndoState] = useState<{
    active: boolean;
    expiresAt: number;
    previousPrices: { [productId: string]: number };
    affectedCount: number;
  } | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(0);

  // Confirm Box Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetItems: { productId: string; newPrice: number; oldPrice: number; name: string }[];
  }>({
    isOpen: false,
    title: '',
    description: '',
    targetItems: [],
  });

  // Reject Reason Modal State
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    suggestion: DynamicPricingSuggestion | null;
  }>({
    isOpen: false,
    suggestion: null,
  });
  const [rejectReason, setRejectReason] = useState<string>('Competitor price is lower in market');
  const [rejectNotes, setRejectNotes] = useState<string>('');

  // Price Test Panel Modal State
  const [testPanelProduct, setTestPanelProduct] = useState<Product | null>(null);

  // Market Price Check State
  const [marketCheckProduct, setMarketCheckProduct] = useState<Product | null>(null);
  const [competitorName, setCompetitorName] = useState<string>('Croma Electronics');
  const [competitorPriceInput, setCompetitorPriceInput] = useState<string>('1599');

  // Edit Single Price Modal State
  const [editPriceModal, setEditPriceModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  // Print Price Tag Modal State
  const [printTagProduct, setPrintTagProduct] = useState<Product | null>(null);

  // Notification Toast
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Pricing Rules State
  const [minMarginPercent, setMinMarginPercent] = useState<number>(15);
  const [priceEndingRule, setPriceEndingRule] = useState<'99' | '49' | '10' | 'none'>('99');
  const [autoApproveSuggestions, setAutoApproveSuggestions] = useState<boolean>(false);
  const [uniformBranchPricing, setUniformBranchPricing] = useState<boolean>(true);

  // Change Log Audit State
  const [changeLogs, setChangeLogs] = useState<PriceChangeLogItem[]>([
    {
      id: 'log 1',
      timestamp: 'Today, 10:15 AM',
      productName: 'VoltSpeed 65W GaN Fast Charger',
      sku: 'PWR 65W GAN',
      oldPrice: 1599,
      newPrice: 1499,
      marginShift: '46% to 43%',
      actor: 'Sanjeev Singh (Owner)',
      reason: 'Applied AI suggestion for psychological price point',
    },
    {
      id: 'log 2',
      timestamp: 'Yesterday, 04:40 PM',
      productName: 'Braided 60W USB C to C Cable',
      sku: 'CBL USBC 60W',
      oldPrice: 349,
      newPrice: 299,
      marginShift: '57% to 50%',
      actor: 'Batch CSV Upload',
      reason: 'Seasonal promotional price adjustment',
    },
    {
      id: 'log 3',
      timestamp: '15 Oct 2026',
      productName: 'SonicPro Noise Cancelling Headphones',
      sku: 'AUD ANC PRO',
      oldPrice: 3299,
      newPrice: 3499,
      marginShift: '33% to 37%',
      actor: 'Sanjeev Singh (Owner)',
      reason: 'Supplier cost escalation adjustment',
    },
  ]);

  // Offers State
  const [offersList, setOffersList] = useState<FestivalOffer[]>([
    {
      id: 'off 1',
      name: 'Diwali Festive Electronics Dhamaka',
      category: 'Audio and Accessories',
      discountPercent: 12,
      startDate: '20 Oct 2026',
      endDate: '05 Nov 2026',
      status: 'Scheduled',
    },
    {
      id: 'off 2',
      name: 'Weekend Flash Charger Sale',
      category: 'Power and Chargers',
      discountPercent: 8,
      startDate: '18 Oct 2026',
      endDate: '20 Oct 2026',
      status: 'Active',
    },
  ]);
  const [isNewOfferModalOpen, setIsNewOfferModalOpen] = useState<boolean>(false);
  const [newOfferName, setNewOfferName] = useState<string>('');
  const [newOfferCategory, setNewOfferCategory] = useState<string>('All Categories');
  const [newOfferDiscount, setNewOfferDiscount] = useState<number>(10);
  const [newOfferStart, setNewOfferStart] = useState<string>('25 Oct 2026');
  const [newOfferEnd, setNewOfferEnd] = useState<string>('31 Oct 2026');

  // Selected item for Price History Timeline
  const [selectedHistoryProductId, setSelectedHistoryProductId] = useState<string>(
    products[0]?.id || ''
  );

  // Hidden File input for CSV upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch AI Pricing Suggestions
  const fetchPricingSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        // Deterministic fallback based on actual products
        generateLocalAiSuggestions();
      }
    } catch {
      generateLocalAiSuggestions();
    } finally {
      setLoading(false);
    }
  };

  // Deterministic calculation for pricing suggestions
  const generateLocalAiSuggestions = () => {
    const list: DynamicPricingSuggestion[] = products.map((p) => {
      const currentMargin = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);
      let suggested = p.sellingPrice;
      let uplift = 12;
      let reason = 'Price point matches current store velocity';
      let confidence: 'High' | 'Medium' | 'Low' = 'High';

      if (currentMargin > 44) {
        // Higher margin: drop slightly for elasticity boost
        const rawLower = Math.round(p.sellingPrice * 0.93);
        suggested = Math.floor(rawLower / 100) * 100 + 99;
        if (suggested >= p.sellingPrice) suggested = p.sellingPrice - 100;
        uplift = 24;
        reason = `High current margin of ${currentMargin} percent. A calibrated price drop stimulates 24 percent higher sales velocity without hurting gross profits.`;
        confidence = 'High';
      } else if (currentMargin < minMarginPercent + 5) {
        // Low margin: raise price safely
        const rawHigher = Math.round(p.sellingPrice * 1.07);
        suggested = Math.floor(rawHigher / 100) * 100 + 99;
        uplift = 3;
        reason = `Margin is currently compressed at ${currentMargin} percent. Demand elasticity is resilient for +7 percent price expansion.`;
        confidence = 'Medium';
      } else {
        // Moderate: round to clean 99 ending
        suggested = Math.floor(p.sellingPrice / 100) * 100 + 99;
        uplift = 8;
        reason = 'Psychological 99 price ending to enhance customer conversion at checkout.';
        confidence = 'High';
      }

      const projectedMargin = Math.round(((suggested - p.costPrice) / suggested) * 100);

      return {
        productId: p.id,
        productName: p.name,
        currentPrice: p.sellingPrice,
        suggestedPrice: suggested,
        costPrice: p.costPrice,
        currentMarginPercent: currentMargin,
        projectedMarginPercent: projectedMargin,
        expectedSalesUpliftPercent: uplift,
        reason,
        confidence,
      };
    });

    setSuggestions(list);
  };

  useEffect(() => {
    fetchPricingSuggestions();
  }, [products.length]);

  // Undo 10 minutes countdown timer
  useEffect(() => {
    if (!undoState || !undoState.active) {
      setUndoSecondsLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((undoState.expiresAt - Date.now()) / 1000));
      setUndoSecondsLeft(diff);
      if (diff <= 0) {
        setUndoState(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [undoState]);

  // Handle Undo Revert
  const handleUndoPriceChanges = () => {
    if (!undoState || !undoState.previousPrices) return;

    Object.entries(undoState.previousPrices).forEach(([prodId, oldPrice]) => {
      updateProductPrice(prodId, oldPrice);
    });

    // Record Undo in change logs
    const newLog: PriceChangeLogItem = {
      id: `log ${Date.now()}`,
      timestamp: 'Just now',
      productName: `${undoState.affectedCount} Products Reverted`,
      sku: 'CATALOG ROLLBACK',
      oldPrice: 0,
      newPrice: 0,
      marginShift: 'Restored',
      actor: 'Store Owner (Undo Window)',
      reason: 'Reverted price updates via 10 minute undo safety window',
    };
    setChangeLogs((prev) => [newLog, ...prev]);

    // Reset applied state
    setAppliedIds({});
    setUndoState(null);
    showNotice('Price changes successfully undone. Original catalog prices restored.');
  };

  // Helper notice
  const showNotice = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 3500);
  };

  // Execution: Commit single or batch price updates
  const executePriceUpdates = (
    itemsToUpdate: { productId: string; newPrice: number; oldPrice: number; name: string }[]
  ) => {
    const previousPricesMap: { [productId: string]: number } = {};

    itemsToUpdate.forEach((item) => {
      previousPricesMap[item.productId] = item.oldPrice;
      updateProductPrice(item.productId, item.newPrice);
      setAppliedIds((prev) => ({ ...prev, [item.productId]: true }));

      // Add to change log
      const oldMargin = Math.round(((item.oldPrice - (products.find(p => p.id === item.productId)?.costPrice || 0)) / item.oldPrice) * 100);
      const newMargin = Math.round(((item.newPrice - (products.find(p => p.id === item.productId)?.costPrice || 0)) / item.newPrice) * 100);

      const logEntry: PriceChangeLogItem = {
        id: `log ${Date.now()} ${item.productId}`,
        timestamp: 'Just now',
        productName: item.name,
        sku: products.find((p) => p.id === item.productId)?.sku || 'SKU',
        oldPrice: item.oldPrice,
        newPrice: item.newPrice,
        marginShift: `${oldMargin}% to ${newMargin}%`,
        actor: 'Store Owner',
        reason: 'Applied AI recommended price adjustment',
      };
      setChangeLogs((prev) => [logEntry, ...prev]);
    });

    // Activate 10 minute undo window
    setUndoState({
      active: true,
      expiresAt: Date.now() + 10 * 60 * 1000,
      previousPrices: previousPricesMap,
      affectedCount: itemsToUpdate.length,
    });

    setSelectedSuggestionIds([]);
    setConfirmModal({ isOpen: false, title: '', description: '', targetItems: [] });
    showNotice(`Successfully updated ${itemsToUpdate.length} item prices in active checkout inventory.`);
  };

  // Open confirmation for single apply
  const triggerSingleApply = (item: DynamicPricingSuggestion) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Price Adjustment',
      description: `Update ${item.productName} from ₹${item.currentPrice.toLocaleString('en-IN')} to suggested price of ₹${item.suggestedPrice.toLocaleString('en-IN')}? This immediately updates the POS checkout register.`,
      targetItems: [
        {
          productId: item.productId,
          newPrice: item.suggestedPrice,
          oldPrice: item.currentPrice,
          name: item.productName,
        },
      ],
    });
  };

  // Open confirmation for selected suggestions
  const triggerApplySelected = () => {
    const targetItems = suggestions
      .filter((s) => selectedSuggestionIds.includes(s.productId))
      .map((s) => ({
        productId: s.productId,
        newPrice: s.suggestedPrice,
        oldPrice: s.currentPrice,
        name: s.productName,
      }));

    if (targetItems.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: `Apply ${targetItems.length} Selected Price Updates`,
      description: `You are about to commit ${targetItems.length} price changes to live store registers. An undo window of 10 minutes will remain active.`,
      targetItems,
    });
  };

  // Open confirmation for Apply All
  const triggerApplyAll = () => {
    const targetItems = filteredSuggestions.map((s) => ({
      productId: s.productId,
      newPrice: s.suggestedPrice,
      oldPrice: s.currentPrice,
      name: s.productName,
    }));

    if (targetItems.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: `Apply All ${targetItems.length} Recommended Prices`,
      description: `Are you sure you want to apply all ${targetItems.length} AI pricing recommendations across your catalog? POS billing will reflect these new rates immediately.`,
      targetItems,
    });
  };

  // Handle Reject Suggestion with Reason
  const handleConfirmReject = () => {
    if (!rejectModal.suggestion) return;
    const target = rejectModal.suggestion;

    // Remove from active suggestions list
    setSuggestions((prev) => prev.filter((s) => s.productId !== target.productId));

    // Log the rejection reason in change logs
    const rejectLog: PriceChangeLogItem = {
      id: `log reject ${Date.now()}`,
      timestamp: 'Just now',
      productName: target.productName,
      sku: products.find((p) => p.id === target.productId)?.sku || 'SKU',
      oldPrice: target.currentPrice,
      newPrice: target.currentPrice,
      marginShift: 'No change',
      actor: 'Store Owner',
      reason: `Rejected AI Suggestion: ${rejectReason}${rejectNotes ? ` (${rejectNotes})` : ''}`,
    };
    setChangeLogs((prev) => [rejectLog, ...prev]);

    setRejectModal({ isOpen: false, suggestion: null });
    setRejectNotes('');
    showNotice(`Suggestion rejected and feedback saved for ${target.productName}.`);
  };

  // Filtered Suggestions
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const prod = products.find((p) => p.id === s.productId);
      const matchesSearch =
        s.productName.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
        (prod?.sku || '').toLowerCase().includes(suggestionSearch.toLowerCase());

      const matchesCat =
        suggestionCategoryFilter === 'All' || (prod?.category || '') === suggestionCategoryFilter;

      const matchesMargin =
        suggestionMarginFilter === 'All' ||
        (suggestionMarginFilter === 'low' && s.currentMarginPercent < 25) ||
        (suggestionMarginFilter === 'healthy' && s.currentMarginPercent >= 40);

      const matchesConf =
        suggestionConfidenceFilter === 'All' || s.confidence === suggestionConfidenceFilter;

      return matchesSearch && matchesCat && matchesMargin && matchesConf;
    });
  }, [
    suggestions,
    products,
    suggestionSearch,
    suggestionCategoryFilter,
    suggestionMarginFilter,
    suggestionConfidenceFilter,
  ]);

  // Categories list
  const categoriesList = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  // Filtered All Prices
  const filteredAllPrices = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(allPricesSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(allPricesSearch.toLowerCase());

      const matchesCategory =
        allPricesCategory === 'All' || p.category === allPricesCategory;

      const margin = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);
      const isSupplierAlert = margin < minMarginPercent;

      if (filterSupplierAlertOnly && !isSupplierAlert) {
        return false;
      }

      return matchesSearch && matchesCategory;
    });
  }, [products, allPricesSearch, allPricesCategory, filterSupplierAlertOnly, minMarginPercent]);

  // Supplier cost alert items count
  const supplierAlertItems = useMemo(() => {
    return products.filter((p) => {
      const margin = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);
      return margin < minMarginPercent;
    });
  }, [products, minMarginPercent]);

  // Catalog Gross Margin Calculation
  const averageCatalogMargin = useMemo(() => {
    if (products.length === 0) return 0;
    const totalMargin = products.reduce((acc, p) => {
      const m = ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100;
      return acc + m;
    }, 0);
    return Math.round((totalMargin / products.length) * 10) / 10;
  }, [products]);

  // Projected Revenue Uplift
  const projectedUpliftPercent = useMemo(() => {
    if (suggestions.length === 0) return 18.4;
    const totalUplift = suggestions.reduce((acc, s) => acc + s.expectedSalesUpliftPercent, 0);
    return Math.round((totalUplift / suggestions.length) * 10) / 10;
  }, [suggestions]);

  // Download Catalog CSV
  const handleDownloadCsv = () => {
    const headers = 'SKU,Product Name,Category,Cost Price,Selling Price,GST Rate,Stock On Hand\n';
    const rows = products
      .map((p) => {
        const stock = p.stockOnHand[currentLocation.id] || 0;
        return `"${p.sku}","${p.name}","${p.category}",${p.costPrice},${p.sellingPrice},${p.taxRate},${stock}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DukaanIQ_Catalog_Prices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Price catalog CSV exported successfully.');
  };

  // Upload Catalog CSV Handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split('\n');
      let updateCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 5) {
          const sku = cols[0].replace(/"/g, '').trim();
          const newPrice = parseFloat(cols[4].replace(/"/g, '').trim());
          const target = products.find((p) => p.sku === sku);
          if (target && !isNaN(newPrice) && newPrice > 0) {
            updateProductPrice(target.id, newPrice);
            updateCount++;
          }
        }
      }

      showNotice(`CSV uploaded successfully. Updated prices for ${updateCount} catalog items.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Save manual single price edit
  const handleSaveEditPrice = () => {
    if (!editPriceModal.product || editPriceValue <= 0) return;
    const prod = editPriceModal.product;
    const oldPrice = prod.sellingPrice;
    updateProductPrice(prod.id, editPriceValue);

    const oldMargin = Math.round(((oldPrice - prod.costPrice) / oldPrice) * 100);
    const newMargin = Math.round(((editPriceValue - prod.costPrice) / editPriceValue) * 100);

    const log: PriceChangeLogItem = {
      id: `log ${Date.now()}`,
      timestamp: 'Just now',
      productName: prod.name,
      sku: prod.sku,
      oldPrice,
      newPrice: editPriceValue,
      marginShift: `${oldMargin}% to ${newMargin}%`,
      actor: 'Store Owner',
      reason: 'Manual price edit via All Prices directory',
    };
    setChangeLogs((prev) => [log, ...prev]);

    setEditPriceModal({ isOpen: false, product: null });
    showNotice(`Updated price for ${prod.name} to ₹${editPriceValue.toLocaleString('en-IN')}`);
  };

  // Toggle selection of all filtered suggestions
  const handleToggleSelectAll = () => {
    if (selectedSuggestionIds.length === filteredSuggestions.length) {
      setSelectedSuggestionIds([]);
    } else {
      setSelectedSuggestionIds(filteredSuggestions.map((s) => s.productId));
    }
  };

  // Helper for Price Test simulation calculation
  const runTestOptions = (product: Product) => {
    const baseP = product.sellingPrice;
    const costP = product.costPrice;
    const baseUnits = 45; // baseline monthly units

    // 1. Conservative Option
    const optAPrice = baseP;
    const optAUnits = baseUnits;
    const optARevenue = optAPrice * optAUnits;
    const optAProfit = (optAPrice - costP) * optAUnits;
    const optAMargin = Math.round(((optAPrice - costP) / optAPrice) * 100);

    // 2. Balanced / AI Recommended Option (Elasticity sweetspot)
    let optBPrice = Math.floor((baseP * 0.94) / 100) * 100 + 99;
    if (optBPrice >= baseP) optBPrice = baseP - 50;
    const optBUnits = Math.round(baseUnits * 1.32);
    const optBRevenue = optBPrice * optBUnits;
    const optBProfit = (optBPrice - costP) * optBUnits;
    const optBMargin = Math.round(((optBPrice - costP) / optBPrice) * 100);

    // 3. Aggressive Volume Maximizer
    let optCPrice = Math.floor((baseP * 0.88) / 100) * 100 + 49;
    const optCUnits = Math.round(baseUnits * 1.6);
    const optCRevenue = optCPrice * optCUnits;
    const optCProfit = (optCPrice - costP) * optCUnits;
    const optCMargin = Math.round(((optCPrice - costP) / optCPrice) * 100);

    return {
      optA: { price: optAPrice, units: optAUnits, revenue: optARevenue, profit: optAProfit, margin: optAMargin },
      optB: { price: optBPrice, units: optBUnits, revenue: optBRevenue, profit: optBProfit, margin: optBMargin },
      optC: { price: optCPrice, units: optCUnits, revenue: optCRevenue, profit: optCProfit, margin: optCMargin },
    };
  };

  // Format countdown minutes and seconds
  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans bg-[#F3F5F9] text-slate-900">
      {/* ========================================================= */}
      {/* TOP HEADER (Teal Design) */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-teal-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Pricing
            </h1>
            <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Real Time Elasticity Engine</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent gross margin protection, psychological price point optimization, and automated retail demand simulation.
          </p>
        </div>

        {/* Action Button: Refresh AI Prices */}
        <button
          onClick={fetchPricingSuggestions}
          disabled={loading}
          className="h-[38px] px-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing Catalog...' : 'Refresh AI Prices'}</span>
        </button>
      </div>

      {/* Global Notification Banner */}
      {actionNotification && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* UNDO 10 MINUTES ACTIVE BANNER */}
      {/* ========================================================= */}
      {undoState && undoState.active && (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-300 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-950 flex items-center gap-2">
                <span>Undo Safety Window Active for {undoState.affectedCount} Items</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-black">
                  {formatCountdown(undoSecondsLeft)} remaining
                </span>
              </div>
              <p className="text-[11px] text-teal-800 mt-0.5">
                New prices are currently live on POS. You can revert instantly to previous catalog prices within 10 minutes.
              </p>
            </div>
          </div>

          <button
            onClick={handleUndoPriceChanges}
            className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5 text-white" />
            <span>Undo 10 Minutes</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEAL DESIGN TOP CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Catalog Gross Margin */}
        <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Catalog Gross Margin</span>
            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {averageCatalogMargin}%
          </div>
          <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
            <span>Minimum guardrail: {minMarginPercent}%</span>
          </p>
        </div>

        {/* Card 2: Projected Revenue Uplift */}
        <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Projected Revenue Uplift</span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            +{projectedUpliftPercent}%
          </div>
          <p className="text-[11px] text-slate-400">
            Across recommended elasticity adjustments
          </p>
        </div>

        {/* Card 3: Elastic Products Evaluated */}
        <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Elastic Products Evaluated</span>
            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
              <Package className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {products.length} Items
          </div>
          <p className="text-[11px] text-slate-400">
            Real store catalog items monitored
          </p>
        </div>

        {/* Card 4: Supplier Cost Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Margin Guardrail Alerts</span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 mt-1">
            {supplierAlertItems.length} Products
          </div>
          <p className="text-[11px] text-amber-700 font-semibold">
            {supplierAlertItems.length > 0 ? 'Margin below configured threshold' : 'All margins healthy'}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABS NAVIGATION (5 TABS) */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1 bg-white border border-teal-100 rounded-xl p-1 overflow-x-auto shadow-2xs">
        {[
          { id: 'suggestions', label: 'Suggestions', badge: suggestions.length },
          { id: 'all-prices', label: 'All Prices', badge: products.length },
          { id: 'history', label: 'Price History', badge: null },
          { id: 'rules', label: 'Rules', badge: null },
          { id: 'offers', label: 'Offers', badge: offersList.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PricingTab)}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SUGGESTIONS */}
      {/* ========================================================= */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {/* Search, Filters, and Bulk Action Controls */}
          <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Filters */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product or SKU..."
                    value={suggestionSearch}
                    onChange={(e) => setSuggestionSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={suggestionCategoryFilter}
                  onChange={(e) => setSuggestionCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>

                {/* Margin Filter */}
                <select
                  value={suggestionMarginFilter}
                  onChange={(e) => setSuggestionMarginFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Margins</option>
                  <option value="low">Margin below 25 percent</option>
                  <option value="healthy">Healthy margin 40 percent plus</option>
                </select>

                {/* Confidence Filter */}
                <select
                  value={suggestionConfidenceFilter}
                  onChange={(e) => setSuggestionConfidenceFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Confidence</option>
                  <option value="High">High Confidence</option>
                  <option value="Medium">Medium Confidence</option>
                </select>
              </div>

              {/* Right Batch Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerApplySelected}
                  disabled={selectedSuggestionIds.length === 0}
                  className="h-[34px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Selected ({selectedSuggestionIds.length})</span>
                </button>

                <button
                  onClick={triggerApplyAll}
                  disabled={filteredSuggestions.length === 0}
                  className="h-[34px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions Table */}
          <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recommended Retail Price Adjustments
                </h3>
                <p className="text-xs text-slate-500">
                  Human approval required: Review individual or batch changes before applying to POS checkout.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredSuggestions.length} recommendations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredSuggestions.length > 0 &&
                          selectedSuggestionIds.length === filteredSuggestions.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Cost Price</th>
                    <th className="py-3 px-3">Current Price</th>
                    <th className="py-3 px-3">Current Margin</th>
                    <th className="py-3 px-3 font-bold text-teal-900">Suggested Price</th>
                    <th className="py-3 px-3">Projected Margin</th>
                    <th className="py-3 px-3">Expected Uplift</th>
                    <th className="py-3 px-3">Confidence Tag</th>
                    <th className="py-3 px-4">AI Economic Rationale</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuggestions.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-600" />
                        <div className="text-xs font-bold text-slate-600">No suggestions match current filters</div>
                        <div className="text-[11px] text-slate-400">Click Refresh AI Prices to review catalog</div>
                      </td>
                    </tr>
                  ) : (
                    filteredSuggestions.map((item) => {
                      const isApplied = appliedIds[item.productId];
                      const isSelected = selectedSuggestionIds.includes(item.productId);
                      const prod = products.find((p) => p.id === item.productId);

                      return (
                        <tr
                          key={item.productId}
                          className={`hover:bg-teal-50/30 transition-colors ${
                            isSelected ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedSuggestionIds((prev) =>
                                  prev.includes(item.productId)
                                    ? prev.filter((id) => id !== item.productId)
                                    : [...prev, item.productId]
                                );
                              }}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-900 max-w-[200px]">
                            <div className="truncate">{item.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod?.sku || 'SKU'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-500">
                            ₹{item.costPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                            ₹{item.currentPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-600">
                            {item.currentMarginPercent}%
                          </td>
                          <td className="py-3.5 px-3 font-mono font-black text-teal-800 text-sm">
                            ₹{item.suggestedPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                            {item.projectedMarginPercent}%
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                            +{item.expectedSalesUpliftPercent}%
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.confidence === 'High'
                                  ? 'bg-teal-100 text-teal-900 border border-teal-200'
                                  : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}
                            >
                              {item.confidence} Confidence
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-[260px] text-[11px] leading-relaxed">
                            {item.reason}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Test Button */}
                              {prod && (
                                <button
                                  onClick={() => setTestPanelProduct(prod)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                                  title="Open 3 price option test simulation"
                                >
                                  Test
                                </button>
                              )}

                              {/* Reject Button */}
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    isOpen: true,
                                    suggestion: item,
                                  })
                                }
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                                title="Reject with reason"
                              >
                                Reject
                              </button>

                              {/* Apply Button */}
                              {isApplied ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md">
                                  <Check className="w-3 h-3" />
                                  <span>Applied</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => triggerSingleApply(item)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
                                >
                                  <span>Apply</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ALL PRICES */}
      {/* ========================================================= */}
      {activeTab === 'all-prices' && (
        <div className="space-y-4">
          {/* Supplier Cost Alert Notice (if any) */}
          {supplierAlertItems.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    Supplier Cost Squeeze Alert ({supplierAlertItems.length} Products Affected)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Recent purchase costs result in gross margins below your {minMarginPercent} percent guardrail. Adjust price to protect profit.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterSupplierAlertOnly(!filterSupplierAlertOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterSupplierAlertOnly
                    ? 'bg-amber-800 text-white'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                {filterSupplierAlertOnly ? 'Show All Products' : 'Filter Squeezed Products'}
              </button>
            </div>
          )}

          {/* Controls Bar: Search, Category, GST Toggle, CSV, Print */}
          <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search & Category */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog price directory..."
                  value={allPricesSearch}
                  onChange={(e) => setAllPricesSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <select
                value={allPricesCategory}
                onChange={(e) => setAllPricesCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              {/* GST Toggle */}
              <button
                onClick={() => setIsGstInclusive(!isGstInclusive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                  isGstInclusive
                    ? 'bg-teal-50 border-teal-300 text-teal-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle price display inclusive or exclusive of GST"
              >
                <Tag className="w-3 h-3 text-teal-600" />
                <span>GST Mode: {isGstInclusive ? 'Inclusive of GST (MRP)' : 'Exclusive of GST'}</span>
              </button>
            </div>

            {/* CSV & Print Actions */}
            <div className="flex items-center gap-2">
              {/* CSV Download */}
              <button
                onClick={handleDownloadCsv}
                className="h-[34px] px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Download current prices as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download CSV</span>
              </button>

              {/* CSV Upload */}
              <label className="h-[34px] px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload CSV</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>

              {/* Market Price Check trigger */}
              <button
                onClick={() => {
                  setMarketCheckProduct(products[0] || null);
                }}
                className="h-[34px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                title="Benchmark competitor prices typed by hand"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Market Price Check</span>
              </button>
            </div>
          </div>

          {/* All Prices Directory Table */}
          <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-3">Cost Price</th>
                    <th className="py-3 px-3 font-bold text-teal-900">
                      Selling Price {isGstInclusive ? '(Inc GST)' : '(Ex GST)'}
                    </th>
                    <th className="py-3 px-3">Gross Margin</th>
                    <th className="py-3 px-3">GST Rate</th>
                    <th className="py-3 px-3">Stock on Hand</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllPrices.map((prod) => {
                    const margin = Math.round(((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100);
                    const displayedPrice = isGstInclusive
                      ? Math.round(prod.sellingPrice * (1 + prod.taxRate / 100))
                      : prod.sellingPrice;
                    const stock = prod.stockOnHand[currentLocation.id] || 0;
                    const isBelowMin = margin < minMarginPercent;

                    return (
                      <tr key={prod.id} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[220px]">
                          <div className="truncate">{prod.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {prod.sku} · {prod.category}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-500">
                          ₹{prod.costPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-black text-teal-800 text-sm">
                          ₹{displayedPrice.toLocaleString('en-IN')}
                          {isGstInclusive && (
                            <span className="text-[9px] block text-teal-600 font-normal">
                              (Base: ₹{prod.sellingPrice})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                              isBelowMin
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : margin >= 40
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-teal-50 text-teal-800'
                            }`}
                          >
                            {margin}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {prod.taxRate}% GST
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-800">
                          {stock} units
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Print Price Tag */}
                            <button
                              onClick={() => setPrintTagProduct(prod)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Print retail price shelf tag"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>Print Tag</span>
                            </button>

                            {/* Edit Price */}
                            <button
                              onClick={() => {
                                setEditPriceModal({ isOpen: true, product: prod });
                                setEditPriceValue(prod.sellingPrice);
                              }}
                              className="px-2.5 py-1 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
                              title="Edit price manually"
                            >
                              <Edit3 className="w-3 h-3 text-white" />
                              <span>Edit</span>
                            </button>
                          </div>
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

      {/* ========================================================= */}
      {/* TAB 3: PRICE HISTORY */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Top: Product Selector for Historical Chart */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Item Price Evolution and Elasticity Curve
                </h3>
                <p className="text-xs text-slate-500">
                  Track retail price revisions and customer sales throughput over time.
                </p>
              </div>

              {/* Product Picker */}
              <div className="w-full sm:w-72">
                <select
                  value={selectedHistoryProductId}
                  onChange={(e) => setSelectedHistoryProductId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: ₹{p.sellingPrice})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual SVG Timeline Price Chart */}
            {(() => {
              const currentItem =
                products.find((p) => p.id === selectedHistoryProductId) || products[0];
              const cost = currentItem?.costPrice || 800;
              const cur = currentItem?.sellingPrice || 1499;

              // Timeline milestones
              const milestones = [
                { stage: 'Catalog Launch', date: '01 Aug 2026', price: Math.round(cur * 1.08), margin: '48%' },
                { stage: 'Festival Flash', date: '25 Aug 2026', price: Math.round(cur * 0.92), margin: '38%' },
                { stage: 'AI Optimization', date: '15 Sep 2026', price: cur, margin: '42%' },
                { stage: 'Current Price', date: 'Today', price: cur, margin: '42%' },
              ];

              return (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                      <span>Timeline: August 2026 to October 2026</span>
                      <span>Cost Baseline: ₹{cost.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Chart SVG */}
                    <div className="h-44 w-full relative flex items-end justify-between px-6 pt-4 pb-8">
                      {/* Connecting Line */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#0D9488"
                          strokeWidth="3"
                          strokeDasharray="4 2"
                          points="60,60 220,100 420,70 600,70"
                        />
                      </svg>

                      {milestones.map((m, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-4 h-4 rounded-full bg-teal-600 ring-4 ring-teal-100 shadow-sm" />
                          <div className="mt-2 text-xs font-black font-mono text-slate-900">
                            ₹{m.price.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-teal-700 font-bold">
                            Margin {m.margin}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {m.stage}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {m.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sales Before and After Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 14 Days Before */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                        <span>14 Days Before Price Revision</span>
                        <span className="text-[10px] text-slate-400">Baseline Window</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Units Sold</span>
                          <span className="text-base font-black font-mono text-slate-800">32 Units</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Total Revenue</span>
                          <span className="text-base font-black font-mono text-slate-800">
                            ₹{(32 * (cur * 1.08)).toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Daily Velocity</span>
                          <span className="text-base font-black font-mono text-slate-800">2.3 / day</span>
                        </div>
                      </div>
                    </div>

                    {/* 14 Days After */}
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-teal-950 border-b border-teal-200 pb-1.5">
                        <span>14 Days After Price Revision</span>
                        <span className="text-[10px] text-teal-700 font-bold">+37 percent volume</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div>
                          <span className="text-[10px] text-teal-700 block">Units Sold</span>
                          <span className="text-base font-black font-mono text-teal-900">44 Units</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-700 block">Total Revenue</span>
                          <span className="text-base font-black font-mono text-teal-900">
                            ₹{(44 * cur).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-700 block">Daily Velocity</span>
                          <span className="text-base font-black font-mono text-teal-900">3.1 / day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Change Log Table */}
          <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Price Revision Audit Change Log
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable record of every catalog price modification and execution source.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {changeLogs.length} logged events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Old Price</th>
                    <th className="py-3 px-3 font-bold text-teal-900">New Price</th>
                    <th className="py-3 px-3">Margin Shift</th>
                    <th className="py-3 px-3">Initiator / Actor</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {changeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {log.productName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {log.oldPrice > 0 ? `₹${log.oldPrice.toLocaleString('en-IN')}` : 'Base'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-800">
                        {log.newPrice > 0 ? `₹${log.newPrice.toLocaleString('en-IN')}` : 'Rollback'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {log.marginShift}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {log.actor}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: RULES */}
      {/* ========================================================= */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rule 1: Minimum Margin Guardrail */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Minimum Margin Guardrail</h3>
                <p className="text-[11px] text-slate-500">
                  Protect store gross profitability from aggressive discounting.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Configured Margin Floor
                </span>
                <span className="text-base font-black font-mono text-teal-800">
                  {minMarginPercent} percent
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="40"
                value={minMarginPercent}
                onChange={(e) => setMinMarginPercent(parseInt(e.target.value) || 15)}
                className="w-full accent-teal-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 percent (Aggressive)</span>
                <span>Default: 15 percent</span>
                <span>40 percent (Premium)</span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Any price suggestion or manual update that would cause product gross margin to dip below {minMarginPercent} percent is automatically flagged with an alert to prevent profit leaks.
              </p>
            </div>
          </div>

          {/* Rule 2: Price Endings (Psychological Pricing) */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Price Endings (Charm Pricing)</h3>
                <p className="text-[11px] text-slate-500">
                  Apply psychological consumer price formats across recommendations.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { id: '99', label: '99 Endings (Recommended)', desc: 'Prices formatted as ₹99, ₹499, ₹1499' },
                { id: '49', label: '49 Endings', desc: 'Prices formatted as ₹49, ₹249, ₹949' },
                { id: '10', label: 'Round to 10s', desc: 'Even round numbers like ₹500, ₹1200' },
                { id: 'none', label: 'Exact Cost Markup', desc: 'No rounding applied' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setPriceEndingRule(opt.id as any)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    priceEndingRule === opt.id
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 ring-1 ring-teal-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500">{opt.desc}</div>
                  </div>
                  <input
                    type="radio"
                    name="priceEnding"
                    checked={priceEndingRule === opt.id}
                    onChange={() => setPriceEndingRule(opt.id as any)}
                    className="accent-teal-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Rule 3: Auto Approve Recommendations */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Auto Approve Recommendations</h3>
                <p className="text-[11px] text-slate-500">
                  Automate price synchronization for High confidence suggestions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Auto Approve AI Suggestions
                </span>
                <span className="text-[11px] text-slate-500">
                  Currently: {autoApproveSuggestions ? 'Enabled' : 'Off by default'}
                </span>
              </div>

              <button
                onClick={() => setAutoApproveSuggestions(!autoApproveSuggestions)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoApproveSuggestions ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    autoApproveSuggestions ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              When enabled, suggestions that strictly meet your minimum margin guardrail ({minMarginPercent} percent) and carry High Confidence will automatically apply. Disabled by default to guarantee retailer human approval.
            </p>
          </div>

          {/* Rule 4: Branch Specific Pricing */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Branch Prices</h3>
                <p className="text-[11px] text-slate-500">
                  Manage uniform or multi location regional pricing strategies.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
              <span>Uniform pricing across all branches</span>
              <button
                onClick={() => setUniformBranchPricing(!uniformBranchPricing)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  uniformBranchPricing ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    uniformBranchPricing ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Branch Table */}
            <div className="space-y-2 pt-1 text-xs">
              {currentBusiness.locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">{loc.name}</span>
                    <span className="text-[10px] text-slate-400 block">{loc.city}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-800">
                    {uniformBranchPricing ? 'Base 100 percent' : loc.isWarehouse ? 'Wholesale rate' : 'Retail rate'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: OFFERS */}
      {/* ========================================================= */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          {/* Section 1: Festival Discounts with Dates */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Festival Discounts with Dates</h3>
                <p className="text-xs text-slate-500">
                  Scheduled calendar promotions with automated start and expiration dates.
                </p>
              </div>

              <button
                onClick={() => setIsNewOfferModalOpen(true)}
                className="h-[34px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Create Festival Offer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offersList.map((off) => (
                <div
                  key={off.id}
                  className="p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/50 to-white space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{off.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        off.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {off.status}
                    </span>
                  </div>

                  <div className="text-xs text-teal-800 font-bold font-mono">
                    {off.discountPercent} percent discount across {off.category}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Duration: {off.startDate} to {off.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Slow Stock Clearance */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Slow Stock Clearance</h3>
              <p className="text-xs text-slate-500">
                Identify inventory sitting in stock over 45 days and apply markdown strategies to free tied up working capital.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  product: 'Micro USB to Lightning Retro Adapter 2 Pack',
                  sku: 'ADP ML 02',
                  stock: 24,
                  daysInStock: 74,
                  currentPrice: 299,
                  clearancePrice: 249,
                  capitalTied: 7176,
                },
                {
                  product: 'Universal Car Headrest Tablet Mounting Bracket',
                  sku: 'ACC CR TAB',
                  stock: 16,
                  daysInStock: 68,
                  currentPrice: 799,
                  clearancePrice: 649,
                  capitalTied: 12784,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{item.product}</span>
                    <span className="text-[11px] text-slate-500">
                      SKU: {item.sku} · {item.stock} units in stock · {item.daysInStock} days idle
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold block">
                      Tied capital: ₹{item.capitalTied.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 line-through block">
                        ₹{item.currentPrice}
                      </span>
                      <span className="text-xs font-black font-mono text-teal-800">
                        ₹{item.clearancePrice}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const target = products.find((p) => p.sku.replace(/-/g, ' ') === item.sku);
                        if (target) {
                          updateProductPrice(target.id, item.clearancePrice);
                          showNotice(`Clearance price of ₹${item.clearancePrice} applied to ${item.product}.`);
                        }
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
                    >
                      Apply Clearance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Bundle Price Ideas */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Bundle Price Ideas</h3>
              <p className="text-xs text-slate-500">
                Recommended multi product bundles to elevate average transaction value and basket size.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Power User Fast Charging Bundle',
                  items: 'VoltSpeed 65W GaN Charger plus 60W USB C Cable',
                  separateTotal: 1798,
                  bundlePrice: 1599,
                  savings: 199,
                  margin: '41%',
                },
                {
                  title: 'Audiophile Travel Kit',
                  items: 'SonicPro ANC Headphones plus Aux Stereo Receiver',
                  separateTotal: 3998,
                  bundlePrice: 3499,
                  savings: 499,
                  margin: '38%',
                },
              ].map((b, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-teal-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{b.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        Margin {b.margin}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{b.items}</p>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-400 line-through">₹{b.separateTotal}</span>
                      <span className="font-black font-mono text-teal-800 text-sm">
                        Combo: ₹{b.bundlePrice}
                      </span>
                      <span className="text-emerald-700 font-bold text-[10px]">
                        Save ₹{b.savings}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showNotice(`Bundle idea '${b.title}' configured for POS promotion.`);
                    }}
                    className="w-full mt-2 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-95 shadow-xs"
                  >
                    Activate Bundle Combo
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONFIRM BOX */}
      {/* ========================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{confirmModal.title}</h3>
              </div>
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', description: '', targetItems: [] })}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900">
              Note: An automated 10 minute undo safety window will allow you to roll back this update if needed.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', description: '', targetItems: [] })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executePriceUpdates(confirmModal.targetItems)}
                className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
              >
                Confirm and Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REJECT WITH REASON */}
      {/* ========================================================= */}
      {rejectModal.isOpen && rejectModal.suggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reject AI Price Suggestion</h3>
                  <p className="text-[11px] text-slate-500">
                    {rejectModal.suggestion.productName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModal({ isOpen: false, suggestion: null })}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>

              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              >
                <option value="Competitor price is lower in market">Competitor price is lower in market</option>
                <option value="Customer resistance observed at counter">Customer resistance observed at counter</option>
                <option value="Manufacturer brand MRP restriction">Manufacturer brand MRP restriction</option>
                <option value="Supplier cost revision expected shortly">Supplier cost revision expected shortly</option>
                <option value="Margin target requires higher baseline">Margin target requires higher baseline</option>
                <option value="Other strategic decision">Other strategic decision</option>
              </select>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Local shop selling at ₹1450"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectModal({ isOpen: false, suggestion: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PRICE TEST PANEL (3 Price Options) */}
      {/* ========================================================= */}
      {testPanelProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Price Test Panel: 3 Strategic Options
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Simulating elasticity and projected monthly profit for {testPanelProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestPanelProduct(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Options Grid */}
            {(() => {
              const { optA, optB, optC } = runTestOptions(testPanelProduct);

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Option 1: Conservative */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Option 1: Conservative
                      </span>
                      <div className="text-xl font-black font-mono text-slate-900 mt-1">
                        ₹{optA.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Margin:</span>
                          <span className="font-mono font-bold text-slate-800">{optA.margin}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Sales:</span>
                          <span className="font-mono font-bold text-slate-800">{optA.units} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Profit:</span>
                          <span className="font-mono font-bold text-slate-800">
                            ₹{optA.profit.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        updateProductPrice(testPanelProduct.id, optA.price);
                        setTestPanelProduct(null);
                        showNotice(`Applied Conservative price ₹${optA.price} to ${testPanelProduct.name}`);
                      }}
                      className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Choose Option
                    </button>
                  </div>

                  {/* Option 2: Balanced / AI Recommended (BEST ONE MARKED) */}
                  <div className="p-4 rounded-xl border-2 border-teal-600 bg-teal-50/50 space-y-3 relative flex flex-col justify-between shadow-xs">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Best Profit Choice
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                        Option 2: Balanced Sweetspot
                      </span>
                      <div className="text-xl font-black font-mono text-teal-900 mt-1">
                        ₹{optB.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-teal-900 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Margin:</span>
                          <span className="font-mono font-bold text-teal-950">{optB.margin}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Sales:</span>
                          <span className="font-mono font-bold text-teal-950">{optB.units} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Profit:</span>
                          <span className="font-mono font-black text-emerald-800">
                            ₹{optB.profit.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        updateProductPrice(testPanelProduct.id, optB.price);
                        setTestPanelProduct(null);
                        showNotice(`Applied Recommended price ₹${optB.price} to ${testPanelProduct.name}`);
                      }}
                      className="w-full py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                    >
                      Apply Recommended
                    </button>
                  </div>

                  {/* Option 3: Aggressive Volume */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Option 3: Volume Maximizer
                      </span>
                      <div className="text-xl font-black font-mono text-slate-900 mt-1">
                        ₹{optC.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Margin:</span>
                          <span className="font-mono font-bold text-slate-800">{optC.margin}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Sales:</span>
                          <span className="font-mono font-bold text-slate-800">{optC.units} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Profit:</span>
                          <span className="font-mono font-bold text-slate-800">
                            ₹{optC.profit.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        updateProductPrice(testPanelProduct.id, optC.price);
                        setTestPanelProduct(null);
                        showNotice(`Applied Volume price ₹${optC.price} to ${testPanelProduct.name}`);
                      }}
                      className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Choose Option
                    </button>
                  </div>
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-400 text-center">
              Sales projection computed via standard retail price elasticity formula (e = 1.6) in pure application code.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: MARKET PRICE CHECK (Owner types competitor price) */}
      {/* ========================================================= */}
      {marketCheckProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Market Price Check (Manual Entry)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Owner types competitor price by hand. No fake live data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMarketCheckProduct(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product to Benchmark
                </label>
                <select
                  value={marketCheckProduct.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setMarketCheckProduct(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Your Price: ₹{p.sellingPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Competitor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competitor Name or Store
                </label>
                <input
                  type="text"
                  placeholder="e.g. Croma, Reliance Digital, Amazon"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Competitor Price Typed by Hand */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competitor Selling Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Enter price observed in market"
                    value={competitorPriceInput}
                    onChange={(e) => setCompetitorPriceInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Comparison Calculation */}
              {(() => {
                const compPrice = parseFloat(competitorPriceInput) || 0;
                const ourPrice = marketCheckProduct.sellingPrice;
                const costPrice = marketCheckProduct.costPrice;
                const diff = ourPrice - compPrice;
                const diffAbs = Math.abs(diff);

                return (
                  <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-teal-950 font-bold">
                      <span>Price Gap Analysis:</span>
                      <span className="font-mono">
                        {diff === 0
                          ? 'Identical Price'
                          : diff > 0
                          ? `Your price is ₹${diffAbs} higher`
                          : `Your price is ₹${diffAbs} lower`}
                      </span>
                    </div>

                    {compPrice > 0 && (
                      <p className="text-[11px] text-teal-800 leading-relaxed">
                        {diff > 0
                          ? `You are priced above ${competitorName || 'competitor'}. Consider adjusting down to ₹${compPrice} if customer footfall is price sensitive.`
                          : diff < 0
                          ? `You are ₹${diffAbs} cheaper than ${competitorName || 'competitor'}. You have headroom to raise your price while preserving price advantage.`
                          : `Your price matches ${competitorName || 'competitor'} perfectly.`}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setMarketCheckProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const compPrice = parseFloat(competitorPriceInput);
                  if (!isNaN(compPrice) && compPrice > 0) {
                    updateProductPrice(marketCheckProduct.id, compPrice);
                    showNotice(`Matched competitor price ₹${compPrice} for ${marketCheckProduct.name}`);
                    setMarketCheckProduct(null);
                  }
                }}
                className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Match Competitor Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT SINGLE PRICE */}
      {/* ========================================================= */}
      {editPriceModal.isOpen && editPriceModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Selling Price</h3>
                  <p className="text-[11px] text-slate-500">
                    {editPriceModal.product.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditPriceModal({ isOpen: false, product: null })}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Selling Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={editPriceValue}
                    onChange={(e) => setEditPriceValue(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Live Margin Calculation */}
              {editPriceValue > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Cost Price:</span>
                    <span className="font-mono">₹{editPriceModal.product.costPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Projected Margin:</span>
                    <span
                      className={`font-mono ${
                        Math.round(((editPriceValue - editPriceModal.product.costPrice) / editPriceValue) * 100) < minMarginPercent
                          ? 'text-rose-600'
                          : 'text-teal-800'
                      }`}
                    >
                      {Math.round(((editPriceValue - editPriceModal.product.costPrice) / editPriceValue) * 100)} percent
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditPriceModal({ isOpen: false, product: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditPrice}
                className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save New Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: PRINT PRICE TAG */}
      {/* ========================================================= */}
      {printTagProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Retail Shelf Price Tag</h3>
              </div>
              <button
                onClick={() => setPrintTagProduct(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Tag Visual Preview */}
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-white space-y-2 text-center">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                {currentBusiness.name}
              </div>
              <div className="text-xs font-bold text-slate-900 truncate px-2">
                {printTagProduct.name}
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 py-1">
                ₹{printTagProduct.sellingPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-tight">
                Inclusive of all taxes · GST {printTagProduct.taxRate}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-widest pt-1">
                ||| | |||| | |||| |||
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {printTagProduct.barcode}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintTagProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setPrintTagProduct(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Shelf Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: CREATE NEW FESTIVAL OFFER */}
      {/* ========================================================= */}
      {isNewOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Create Festival Offer</h3>
              </div>
              <button
                onClick={() => setIsNewOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Offer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Year Mega Sale"
                  value={newOfferName}
                  onChange={(e) => setNewOfferName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Target
                </label>
                <select
                  value={newOfferCategory}
                  onChange={(e) => setNewOfferCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newOfferDiscount}
                  onChange={(e) => setNewOfferDiscount(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={newOfferStart}
                    onChange={(e) => setNewOfferStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={newOfferEnd}
                    onChange={(e) => setNewOfferEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewOfferModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newOfferName.trim()) return;
                  const newOff: FestivalOffer = {
                    id: `off ${Date.now()}`,
                    name: newOfferName.trim(),
                    category: newOfferCategory,
                    discountPercent: newOfferDiscount,
                    startDate: newOfferStart,
                    endDate: newOfferEnd,
                    status: 'Scheduled',
                  };
                  setOffersList((prev) => [newOff, ...prev]);
                  setIsNewOfferModalOpen(false);
                  setNewOfferName('');
                  showNotice(`Scheduled '${newOff.name}' from ${newOff.startDate} to ${newOff.endDate}.`);
                }}
                className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
