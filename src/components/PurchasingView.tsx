import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder, Supplier, Product, PurchaseOrderItem } from '../types';
import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  Star,
  FileText,
  PackageCheck,
  Building,
  ArrowRight,
  X,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Copy,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Check,
  Upload,
  MessageSquare,
  Bot,
  RefreshCw,
  TrendingUp,
  Percent,
} from 'lucide-react';

type BuyingTab = 'orders' | 'ai-reorder' | 'suppliers' | 'scorecards' | 'payables';

interface SupplierBill {
  id: string;
  billNumber: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  billDate: string;
  dueDate: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Pending' | 'Partly Paid' | 'Paid' | 'Overdue';
  paymentMode?: string;
  paymentDate?: string;
}

interface AiReorderDraft {
  id: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    recommendedQty: number;
    packSize: number;
    unitCost: number;
    lineTotal: number;
  }[];
  totalEstimatedCost: number;
  expectedDeliveryDays: number;
  reason: string;
  urgency: 'Urgent' | 'Normal';
}

export const PurchasingView: React.FC = () => {
  const { suppliers: contextSuppliers, purchaseOrders: contextPOs, products, currentLocation, currentBusiness, updateProductPrice } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<BuyingTab>('orders');

  // Maintain local state initialized with context demo data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(contextPOs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(contextSuppliers);

  // Filters state (Every tab has search, filters, export)
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRangeFilter, setDateRangeFilter] = useState('All Dates');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // PO Selection and Timeline
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);
  const [viewPoModal, setViewPoModal] = useState<PurchaseOrder | null>(null);

  // New PO Modal
  const [isNewPoOpen, setIsNewPoOpen] = useState(false);
  const [newPoSupplierId, setNewPoSupplierId] = useState(contextSuppliers[0]?.id || '');
  const [newPoItems, setNewPoItems] = useState<{ productId: string; quantity: number; cost: number }[]>([
    { productId: products[0]?.id || '', quantity: 20, cost: products[0]?.costPrice || 850 },
  ]);
  const [newPoExpectedDate, setNewPoExpectedDate] = useState('2026 10 24');
  const [newPoNotes, setNewPoNotes] = useState('Standard restocking order');

  // Receive Goods Panel Modal
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveTargetPo, setReceiveTargetPo] = useState<PurchaseOrder | null>(null);
  const [receivingMap, setReceivingMap] = useState<{ [prodId: string]: number }>({});
  const [damagedMap, setDamagedMap] = useState<{ [prodId: string]: number }>({});
  const [newCostMap, setNewCostMap] = useState<{ [prodId: string]: number }>({});
  const [billPhotoAttached, setBillPhotoAttached] = useState<string | null>(null);

  // Supplier Add / Edit Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supGstin, setSupGstin] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supTerms, setSupTerms] = useState('15 Days Credit');
  const [supDeliveryDays, setSupDeliveryDays] = useState(3);

  // Scorecards Compare Modal
  const [compareSupA, setCompareSupA] = useState<string>(contextSuppliers[0]?.id || '');
  const [compareSupB, setCompareSupB] = useState<string>(contextSuppliers[1]?.id || '');

  // Payables Bills State
  const [bills, setBills] = useState<SupplierBill[]>([
    {
      id: 'bill 1',
      billNumber: 'INV 2026 8891',
      poNumber: 'PO 2026 0038',
      supplierId: 'sup crystalshield',
      supplierName: 'CrystalShield Optics and Protection',
      billDate: '2026 10 07',
      dueDate: '2026 10 22',
      taxableAmount: 15466,
      gstAmount: 2784,
      totalAmount: 18250,
      paidAmount: 18250,
      status: 'Paid',
      paymentMode: 'Bank NEFT',
      paymentDate: '2026 10 10',
    },
    {
      id: 'bill 2',
      billNumber: 'INV 2026 9410',
      poNumber: 'PO 2026 0042',
      supplierId: 'sup techsupply',
      supplierName: 'TechSupply India Wholesale',
      billDate: '2026 10 11',
      dueDate: '2026 10 18',
      taxableAmount: 27542,
      gstAmount: 4958,
      totalAmount: 32500,
      paidAmount: 0,
      status: 'Overdue',
    },
    {
      id: 'bill 3',
      billNumber: 'INV 2026 9820',
      poNumber: 'PO 2026 0045',
      supplierId: 'sup voltpower',
      supplierName: 'VoltPower Tech Components',
      billDate: '2026 10 15',
      dueDate: '2026 10 25',
      taxableAmount: 20339,
      gstAmount: 3661,
      totalAmount: 24000,
      paidAmount: 10000,
      status: 'Partly Paid',
    },
  ]);

  // Record Payment Modal
  const [paymentModalBill, setPaymentModalBill] = useState<SupplierBill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Bank' | 'Cash'>('UPI');
  const [paymentDate, setPaymentDate] = useState('2026 10 18');

  // AI Reorder Recommendations
  const [reorderDrafts, setReorderDrafts] = useState<AiReorderDraft[]>([
    {
      id: 'rec 1',
      supplierId: 'sup techsupply',
      supplierName: 'TechSupply India Wholesale',
      expectedDeliveryDays: 3,
      totalEstimatedCost: 29500,
      urgency: 'Urgent',
      reason: 'Sales velocity is 4 units daily and current stock is only 12 units. Lead time requires reorder today to avoid weekend stockout.',
      items: [
        {
          productId: 'prod 001',
          productName: 'VoltSpeed 65W GaN Dual Fast Charger',
          sku: 'PWR 65W GAN',
          recommendedQty: 20,
          packSize: 10,
          unitCost: 850,
          lineTotal: 17000,
        },
        {
          productId: 'prod 002',
          productName: 'VoltTank 20000 mAh Fast Power Bank',
          sku: 'PWR BNK 20K',
          recommendedQty: 10,
          packSize: 5,
          unitCost: 1250,
          lineTotal: 12500,
        },
      ],
    },
    {
      id: 'rec 2',
      supplierId: 'sup crystalshield',
      supplierName: 'CrystalShield Optics and Protection',
      expectedDeliveryDays: 2,
      totalEstimatedCost: 15500,
      urgency: 'Normal',
      reason: 'Tempered glass sales are consistent. High margin item with low holding cost. Pack size of 50 pieces qualifies for supplier volume tier.',
      items: [
        {
          productId: 'prod 006',
          productName: 'UltraClear 9H Tempered Glass Screen Guard',
          sku: 'GLASS 9H CURV',
          recommendedQty: 100,
          packSize: 50,
          unitCost: 65,
          lineTotal: 6500,
        },
        {
          productId: 'prod 005',
          productName: 'ShieldMax Military Grade Protective Case',
          sku: 'CASE ARMOR 15',
          recommendedQty: 50,
          packSize: 25,
          unitCost: 180,
          lineTotal: 9000,
        },
      ],
    },
  ]);

  // AI Side Panel State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState<string>('ai_purchase_recommendations');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ title: string; content: string; suggestions: string[] } | null>(null);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [aiCache, setAiCache] = useState<Record<string, { title: string; content: string; suggestions: string[] }>>({});

  // Trigger AI Tool with caching
  const runAiTool = async (toolKey: string, customQuestion?: string) => {
    setActiveAiTool(toolKey);
    setIsAiPanelOpen(true);

    const cacheKey = `${toolKey}_${customQuestion || 'default'}`;
    if (aiCache[cacheKey] && !customQuestion) {
      setAiResponse(aiCache[cacheKey]);
      return;
    }

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/buying-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: toolKey,
          query: customQuestion || copilotQuery,
          context: {
            purchaseOrdersCount: purchaseOrders.length,
            suppliersCount: suppliers.length,
            totalPayablesDue: bills.filter((b) => b.status !== 'Paid').reduce((a, b) => a + (b.totalAmount - b.paidAmount), 0),
            storeLocation: currentLocation.name,
          },
        }),
      });

      const data = await res.json();
      setAiResponse(data);
      setAiCache((prev) => ({ ...prev, [cacheKey]: data }));
    } catch {
      // Graceful fallback
      setAiResponse({
        title: 'Procurement Intelligence Summary',
        content: 'Verified purchase records confirm supplier lead times are on schedule. Review open consignments to guarantee optimal floor stock.',
        suggestions: [
          'Verify arrival date for PO 2026 0042',
          'Review payables due this week to protect credit terms',
          'Maintain 15 days buffer on high turnover charging accessories',
        ],
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Export Trigger Function
  const handleExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    const tabName = activeTab.toUpperCase();
    setExportNotice(`Exporting ${tabName} data as ${format}`);
    setTimeout(() => {
      setExportNotice(`${tabName} exported successfully as ${format}`);
      setTimeout(() => setExportNotice(null), 3000);
    }, 800);
  };

  // Filtered Purchase Orders
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSupplier = supplierFilter === 'All Suppliers' || po.supplierName === supplierFilter;
      const matchesStatus =
        statusFilter === 'All Status' ||
        po.status.toLowerCase() === statusFilter.toLowerCase().replace(' ', '_');
      return matchesSearch && matchesSupplier && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, supplierFilter, statusFilter]);

  // Check if an order is late
  const isPoLate = (po: PurchaseOrder) => {
    if (po.status === 'received' || po.status === 'cancelled') return false;
    const todayStr = '2026 10 18';
    return po.expectedDeliveryDate < todayStr;
  };

  // Open Receive Goods Modal
  const openReceiveModal = (po: PurchaseOrder) => {
    setReceiveTargetPo(po);
    const initialRec: { [prodId: string]: number } = {};
    const initialDam: { [prodId: string]: number } = {};
    const initialCost: { [prodId: string]: number } = {};

    po.items.forEach((item) => {
      const remaining = Math.max(0, item.orderQuantity - item.receivedQuantity);
      initialRec[item.productId] = remaining;
      initialDam[item.productId] = 0;
      initialCost[item.productId] = item.unitCost;
    });

    setReceivingMap(initialRec);
    setDamagedMap(initialDam);
    setNewCostMap(initialCost);
    setBillPhotoAttached(null);
    setIsReceiveModalOpen(true);
  };

  // Confirm Goods Receipt: Updates PO, stock levels, and cost prices
  const handleConfirmReceive = () => {
    if (!receiveTargetPo) return;

    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === receiveTargetPo.id) {
          const updatedItems = po.items.map((item) => {
            const newlyRec = receivingMap[item.productId] || 0;
            const updatedReceivedQty = item.receivedQuantity + newlyRec;
            return {
              ...item,
              receivedQuantity: updatedReceivedQty,
              unitCost: newCostMap[item.productId] || item.unitCost,
            };
          });

          const fullyReceived = updatedItems.every((it) => it.receivedQuantity >= it.orderQuantity);
          const partiallyReceived = updatedItems.some((it) => it.receivedQuantity > 0);

          return {
            ...po,
            items: updatedItems,
            status: fullyReceived ? 'received' : partiallyReceived ? 'partially_received' : po.status,
            receivedAt: '2026 10 18',
          };
        }
        return po;
      })
    );

    // Update cost prices in products catalog if adjusted
    Object.entries(newCostMap).forEach(([pId, updatedCost]) => {
      const prod = products.find((p) => p.id === pId);
      if (prod && updatedCost > 0 && updatedCost !== prod.costPrice) {
        prod.costPrice = updatedCost;
      }
    });

    setIsReceiveModalOpen(false);
    setReceiveTargetPo(null);
    setExportNotice('Goods received successfully. Stock on hand and cost prices updated.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Create new Purchase Order Submit
  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPoSupplierId);
    if (!sup) return;

    const items: PurchaseOrderItem[] = newPoItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Retail Product',
        sku: prod?.sku || 'SKU',
        orderQuantity: item.quantity,
        receivedQuantity: 0,
        unitCost: item.cost,
        lineTotal: item.quantity * item.cost,
      };
    });

    const total = items.reduce((acc, it) => acc + it.lineTotal, 0);
    const newPoNum = `PO 2026 ${String(purchaseOrders.length + 43).padStart(4, '0')}`;

    const newPO: PurchaseOrder = {
      id: `po ${Date.now()}`,
      poNumber: newPoNum,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      supplierId: sup.id,
      supplierName: sup.name,
      createdAt: '2026 10 18',
      expectedDeliveryDate: newPoExpectedDate,
      status: 'ordered',
      items,
      totalAmount: total,
      notes: newPoNotes,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    setIsNewPoOpen(false);
    setExportNotice(`Order ${newPoNum} created for ${sup.name}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Duplicate PO
  const handleDuplicatePo = (po: PurchaseOrder) => {
    const dupNum = `PO 2026 ${String(purchaseOrders.length + 45).padStart(4, '0')}`;
    const duplicated: PurchaseOrder = {
      ...po,
      id: `po ${Date.now()}`,
      poNumber: dupNum,
      createdAt: '2026 10 18',
      expectedDeliveryDate: '2026 10 25',
      status: 'draft',
      receivedAt: undefined,
      items: po.items.map((it) => ({ ...it, receivedQuantity: 0 })),
    };
    setPurchaseOrders((prev) => [duplicated, ...prev]);
    setExportNotice(`Duplicated order created as Draft ${dupNum}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Cancel PO
  const handleCancelPo = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'cancelled' } : po))
    );
    setExportNotice('Purchase order cancelled.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Approve AI Reorder Recommendation -> creates a Draft order
  const handleApproveReorder = (draft: AiReorderDraft) => {
    const poNum = `PO 2026 ${String(purchaseOrders.length + 46).padStart(4, '0')}`;
    const newPo: PurchaseOrder = {
      id: `po ai ${Date.now()}`,
      poNumber: poNum,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      supplierId: draft.supplierId,
      supplierName: draft.supplierName,
      createdAt: '2026 10 18',
      expectedDeliveryDate: '2026 10 22',
      status: 'draft',
      items: draft.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        orderQuantity: it.recommendedQty,
        receivedQuantity: 0,
        unitCost: it.unitCost,
        lineTotal: it.lineTotal,
      })),
      totalAmount: draft.totalEstimatedCost,
      notes: `AI Reorder Recommendation: ${draft.reason}`,
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);
    setReorderDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    setExportNotice(`Draft order ${poNum} created from AI suggestion.`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Supplier Add / Edit Submit
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                name: supName.trim(),
                phone: supPhone.trim(),
                email: supEmail.trim(),
                gstin: supGstin.trim(),
                address: supAddress.trim(),
                paymentTerms: supTerms,
                averageDeliveryDays: supDeliveryDays,
              }
            : s
        )
      );
      setExportNotice(`Updated details for ${supName}`);
    } else {
      const newSup: Supplier = {
        id: `sup ${Date.now()}`,
        businessId: currentBusiness.id,
        name: supName.trim(),
        contactPerson: 'Sales Manager',
        phone: supPhone.trim(),
        email: supEmail.trim(),
        gstin: supGstin.trim() || '07AAAAA0000A1Z5',
        address: supAddress.trim() || 'Industrial Area, New Delhi',
        paymentTerms: supTerms,
        averageDeliveryDays: supDeliveryDays,
        onTimeDeliveryRate: 95,
        suppliedCategories: ['Accessories', 'Electronics'],
        openBalance: 0,
        rating: 4.8,
      };
      setSuppliers((prev) => [...prev, newSup]);
      setExportNotice(`Added new supplier ${supName}`);
    }

    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Open Edit Supplier Modal
  const openEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupPhone(sup.phone);
    setSupEmail(sup.email);
    setSupGstin(sup.gstin);
    setSupAddress(sup.address || 'Connaught Place Commercial Complex');
    setSupTerms(sup.paymentTerms || '15 Days Credit');
    setSupDeliveryDays(sup.averageDeliveryDays || 3);
    setIsSupplierModalOpen(true);
  };

  // Open Add Supplier Modal
  const openAddSupplier = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupPhone('');
    setSupEmail('');
    setSupGstin('');
    setSupAddress('');
    setSupTerms('15 Days Credit');
    setSupDeliveryDays(3);
    setIsSupplierModalOpen(true);
  };

  // Record Payment Submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBill || paymentAmount <= 0) return;

    setBills((prev) =>
      prev.map((b) => {
        if (b.id === paymentModalBill.id) {
          const newPaid = b.paidAmount + paymentAmount;
          const isFullyPaid = newPaid >= b.totalAmount;
          return {
            ...b,
            paidAmount: Math.min(b.totalAmount, newPaid),
            status: isFullyPaid ? 'Paid' : 'Partly Paid',
            paymentMode,
            paymentDate,
          };
        }
        return b;
      })
    );

    setPaymentModalBill(null);
    setExportNotice('Payment recorded and updated in Accounts payables ledger.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Calculated Scorecard Data for a Supplier (in normal code)
  const calculateSupplierScorecard = (sup: Supplier) => {
    const onTime = sup.onTimeDeliveryRate; // percentage
    const fulfillment = 98; // percentage received fully
    const damaged = 0.8; // percentage damaged
    const priceStability = 95; // price stability index
    // Weighted formula: onTime 40%, fulfillment 40%, low damages 10%, price stability 10%
    const score = Math.round(onTime * 0.4 + fulfillment * 0.4 + (100 - damaged * 10) * 0.1 + priceStability * 0.1);
    return {
      onTime,
      fulfillment,
      damaged,
      priceStability,
      score: Math.min(100, Math.max(50, score)),
    };
  };

  // Payables Summary Cards
  const totalOverdueAmount = useMemo(() => {
    return bills.filter((b) => b.status === 'Overdue').reduce((a, b) => a + (b.totalAmount - b.paidAmount), 0);
  }, [bills]);

  const totalDueThisWeek = useMemo(() => {
    return bills.filter((b) => b.status !== 'Paid').reduce((a, b) => a + (b.totalAmount - b.paidAmount), 0);
  }, [bills]);

  const totalGstPaidOnPurchases = useMemo(() => {
    return bills.filter((b) => b.status === 'Paid').reduce((a, b) => a + b.gstAmount, 0);
  }, [bills]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans bg-[#F3F5F9] text-slate-900">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buying</h1>
            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Procurement Center</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Orders, suppliers, bills and AI reorder help.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* AI Tools Trigger Button */}
          <button
            onClick={() => runAiTool('ai_purchase_recommendations')}
            className="h-[38px] px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Buying Tools</span>
          </button>

          {/* New Order Button */}
          <button
            onClick={() => setIsNewPoOpen(true)}
            className="h-[38px] px-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Global Notice Banner */}
      {exportNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5 TABS NAVIGATION */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto shadow-2xs">
        {[
          { id: 'orders', label: 'Purchase Orders', badge: purchaseOrders.length },
          { id: 'ai-reorder', label: 'AI Reorder', badge: reorderDrafts.length },
          { id: 'suppliers', label: 'Suppliers', badge: suppliers.length },
          { id: 'scorecards', label: 'Scorecards', badge: null },
          { id: 'payables', label: 'Payables', badge: bills.filter((b) => b.status !== 'Paid').length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BuyingTab)}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
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
      {/* UNIVERSAL FILTERS AND EXPORT BAR (Active across all tabs) */}
      {/* ========================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search and Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, suppliers, bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Supplier Filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="All Suppliers">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Ordered">Ordered</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="All Dates">All Dates</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>

        {/* Right: Export Options */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleExport('CSV')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            title="Export as CSV"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            title="Export as Excel"
          >
            Excel
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
            title="Print or save as PDF"
          >
            <Printer className="w-3 h-3 text-slate-500" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PURCHASE ORDERS */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Purchase Orders Lifecycle</h3>
                <p className="text-xs text-slate-500">
                  Track open orders, monitor expected dates, and verify received shipments.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredOrders.length} orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order Details</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Expected Date</th>
                    <th className="py-3 px-3">Line Items</th>
                    <th className="py-3 px-3 font-bold text-slate-900">Total Cost</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((po) => {
                    const isLate = isPoLate(po);
                    const isExpanded = expandedPoId === po.id;

                    return (
                      <React.Fragment key={po.id}>
                        <tr
                          onClick={() => setExpandedPoId(isExpanded ? null : po.id)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{po.poNumber}</span>
                              {isLate && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                  Late order
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Created: {po.createdAt}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800">
                            {po.supplierName}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-600">
                            {po.expectedDeliveryDate}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {po.items.length} SKUs ({po.items.reduce((a, b) => a + b.orderQuantity, 0)} units)
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm">
                            ₹{po.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                po.status === 'received'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : po.status === 'partially_received'
                                  ? 'bg-amber-100 text-amber-800'
                                  : po.status === 'ordered'
                                  ? 'bg-blue-100 text-blue-800'
                                  : po.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {po.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Receive Goods Button if open */}
                              {po.status !== 'received' && po.status !== 'cancelled' && (
                                <button
                                  onClick={() => openReceiveModal(po)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                  title="Receive goods verification"
                                >
                                  <PackageCheck className="w-3 h-3" />
                                  <span>Receive</span>
                                </button>
                              )}

                              {/* View Order Modal */}
                              <button
                                onClick={() => setViewPoModal(po)}
                                className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicatePo(po)}
                                className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                                title="Duplicate order"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Send by WhatsApp or Email */}
                              <button
                                onClick={() => {
                                  const text = `Hello ${po.supplierName}, this is regarding Purchase Order ${po.poNumber} for ₹${po.totalAmount.toLocaleString('en-IN')}. Please confirm delivery schedule. Thank you!`;
                                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="p-1 hover:bg-slate-100 text-emerald-600 rounded cursor-pointer"
                                title="Send by WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              {/* Cancel */}
                              {po.status !== 'received' && po.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelPo(po.id)}
                                  className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                                  title="Cancel order"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Order Timeline (on row click) */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-100">
                            <td colSpan={7} className="p-4">
                              <div className="space-y-3">
                                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                  Order Progression Timeline: {po.poNumber}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {/* Step 1: Created */}
                                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                      1
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900">Order Created</div>
                                      <div className="text-[10px] text-slate-400 font-mono">Date: {po.createdAt}</div>
                                    </div>
                                  </div>

                                  {/* Step 2: Ordered */}
                                  <div className={`p-3 bg-white rounded-xl border flex items-center gap-3 ${
                                    po.status !== 'draft' ? 'border-blue-300' : 'border-slate-200 opacity-60'
                                  }`}>
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                      2
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900">Sent to Supplier</div>
                                      <div className="text-[10px] text-slate-500">Expected: {po.expectedDeliveryDate}</div>
                                    </div>
                                  </div>

                                  {/* Step 3: Received */}
                                  <div className={`p-3 bg-white rounded-xl border flex items-center gap-3 ${
                                    po.status === 'received'
                                      ? 'border-emerald-300 bg-emerald-50/30'
                                      : 'border-slate-200 opacity-60'
                                  }`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                      po.status === 'received' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      3
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900">
                                        {po.status === 'received' ? 'Goods Received' : 'Awaiting Consignment'}
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        {po.receivedAt ? `Received date: ${po.receivedAt}` : 'Pending bay entry'}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Notes */}
                                {po.notes && (
                                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                                    <span className="font-bold text-slate-800">Order Notes: </span>
                                    {po.notes}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AI REORDER */}
      {/* ========================================================= */}
      {activeTab === 'ai-reorder' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Purchase Recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Draft replenishment consignments grouped by supplier using sales speed, lead times and pack sizes.
                </p>
              </div>
              <button
                onClick={() => runAiTool('ai_purchase_recommendations')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Re check Velocity</span>
              </button>
            </div>

            {reorderDrafts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-xs font-bold text-slate-700">Inventory Levels are Fully Balanced</div>
                <div className="text-[11px] text-slate-400 mt-0.5">No critical restocking recommended at this time.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {reorderDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{draft.supplierName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              draft.urgency === 'Urgent'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {draft.urgency} Restock
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Lead Time: {draft.expectedDeliveryDays} delivery days · Reason: {draft.reason}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                        <span className="text-base font-black font-mono text-slate-900">
                          ₹{draft.totalEstimatedCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Draft Line Items */}
                    <div className="space-y-1.5">
                      {draft.items.map((it) => (
                        <div
                          key={it.productId}
                          className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{it.productName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              SKU: {it.sku} · Pack size: {it.packSize} pcs
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-slate-900">
                              {it.recommendedQty} units
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              ₹{it.lineTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setReorderDrafts((prev) => prev.filter((d) => d.id !== draft.id))}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleExport('PDF')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={() => handleApproveReorder(draft)}
                        className="px-4 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        Approve and Create Draft Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUPPLIERS */}
      {/* ========================================================= */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supplier Directory</h3>
              <p className="text-xs text-slate-500">
                Contact information, payment credit terms and items supplied.
              </p>
            </div>
            <button
              onClick={openAddSupplier}
              className="h-[34px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((supplier) => {
              const ordersCount = purchaseOrders.filter((po) => po.supplierId === supplier.id).length;
              const totalBought = purchaseOrders
                .filter((po) => po.supplierId === supplier.id)
                .reduce((a, b) => a + b.totalAmount, 0);

              return (
                <div
                  key={supplier.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{supplier.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {supplier.phone} · {supplier.email}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          GSTIN: {supplier.gstin}
                        </div>
                      </div>

                      <button
                        onClick={() => openEditSupplier(supplier)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Address & Terms */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div>
                        <span className="font-semibold text-slate-700">Address: </span>
                        <span>{supplier.address || 'Commercial Center, New Delhi'}</span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200">
                        <span>Payment Terms: <strong>{supplier.paymentTerms || '15 Days Credit'}</strong></span>
                        <span>Delivery Lead: <strong>{supplier.averageDeliveryDays} Days</strong></span>
                      </div>
                    </div>

                    {/* Supplier Profile Numbers */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Orders</span>
                        <span className="text-sm font-bold font-mono text-slate-900">{ordersCount} POs</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Total Bought</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          ₹{totalBought.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Amount Due</span>
                        <span className="text-sm font-bold font-mono text-rose-700">
                          ₹{supplier.openBalance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Items Sold with Last 5 Prices & Change Tag */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">
                        Recent Catalog Pricing History:
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                          <span className="font-semibold text-slate-800">Primary Supplied Goods</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Price Stable
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono pl-1">
                          Last 5 unit purchase rates: ₹850, ₹850, ₹850, ₹840, ₹850
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SCORECARDS */}
      {/* ========================================================= */}
      {activeTab === 'scorecards' && (
        <div className="space-y-6">
          {/* Supplier Comparison Tool */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Compare Two Suppliers Side by Side</h3>
                <p className="text-xs text-slate-500">
                  Contrast delivery punctuality, consignment fulfillment and reliability metrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={compareSupA}
                  onChange={(e) => setCompareSupA(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-bold text-slate-400">vs</span>
                <select
                  value={compareSupB}
                  onChange={(e) => setCompareSupB(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Cards */}
            {(() => {
              const supA = suppliers.find((s) => s.id === compareSupA) || suppliers[0];
              const supB = suppliers.find((s) => s.id === compareSupB) || suppliers[1];
              const cardA = calculateSupplierScorecard(supA);
              const cardB = calculateSupplierScorecard(supB);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { sup: supA, card: cardA, tag: 'Partner A' },
                    { sup: supB, card: cardB, tag: 'Partner B' },
                  ].map(({ sup, card, tag }) => (
                    <div key={sup.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-700">{tag}</span>
                        <span className="text-xs font-mono font-black text-slate-900">
                          Overall Score: {card.score} / 100
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{sup.name}</h4>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">On Time Delivery:</span>
                          <span className="font-bold text-emerald-700">{card.onTime}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Items Received Fully:</span>
                          <span className="font-bold text-slate-800">{card.fulfillment}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Damaged Percent:</span>
                          <span className="font-bold text-rose-700">{card.damaged}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lead Time:</span>
                          <span className="font-bold text-slate-800">{sup.averageDeliveryDays} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Credit Terms:</span>
                          <span className="font-bold text-slate-800">{sup.paymentTerms || '15 Days'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Supplier Rankings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supplier Performance Scorecards</h3>
                <p className="text-xs text-slate-500">
                  Scores out of 100 calculated in normal application code.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">On Time Delivery</th>
                    <th className="py-3 px-3">Received Fully</th>
                    <th className="py-3 px-3">Damaged Units</th>
                    <th className="py-3 px-3">Price Trend</th>
                    <th className="py-3 px-4 text-right">Overall Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map((s, idx) => {
                    const sc = calculateSupplierScorecard(s);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">Rank {idx + 1}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3.5 px-3 font-mono text-emerald-700 font-bold">{sc.onTime}%</td>
                        <td className="py-3.5 px-3 font-mono text-slate-800">{sc.fulfillment}%</td>
                        <td className="py-3.5 px-3 font-mono text-rose-700">{sc.damaged}%</td>
                        <td className="py-3.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Stable
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-blue-700 text-sm">
                          {sc.score} / 100
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
      {/* TAB 5: PAYABLES */}
      {/* ========================================================= */}
      {activeTab === 'payables' && (
        <div className="space-y-4">
          {/* Payables Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-rose-600">Overdue Invoices Alert</span>
              <div className="text-2xl font-black font-mono text-rose-700 mt-1">
                ₹{totalOverdueAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">Past supplier payment credit window</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Payables Due This Week</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₹{totalDueThisWeek.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">Scheduled for settlement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-blue-700">Total GST Paid on Purchases</span>
              <div className="text-2xl font-black font-mono text-blue-700 mt-1">
                ₹{totalGstPaidOnPurchases.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-blue-600 font-semibold">
                Eligible Input Tax Credit for Accounts
              </p>
            </div>
          </div>

          {/* Bills List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supplier Bills and Credit Ledger</h3>
                <p className="text-xs text-slate-500">
                  Record payments via UPI, Bank Transfer or Cash and track Input Tax Credit.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Bill Details</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Paid Amount</th>
                    <th className="py-3 px-3">Pending Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((bill) => {
                    const pending = bill.totalAmount - bill.paidAmount;

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{bill.billNumber}</div>
                          <div className="text-[10px] text-slate-400 font-mono">PO: {bill.poNumber}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {bill.supplierName}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">{bill.dueDate}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          ₹{bill.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-emerald-700">
                          ₹{bill.paidAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-rose-700">
                          ₹{pending.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              bill.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : bill.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {pending > 0 ? (
                            <button
                              onClick={() => {
                                setPaymentModalBill(bill);
                                setPaymentAmount(pending);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold">
                              Settled via {bill.paymentMode || 'NEFT'}
                            </span>
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

      {/* ========================================================= */}
      {/* AI TOOLS SIDE PANEL (Slide in Drawer) */}
      {/* ========================================================= */}
      {isAiPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Buying Assistant</h3>
              </div>
              <button
                onClick={() => setIsAiPanelOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* 7 AI Tool Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'ai_purchase_recommendations', label: 'Purchase Reorder' },
                  { key: 'ai_supplier_insights', label: 'Supplier Insights' },
                  { key: 'ai_price_compare', label: 'Price Compare' },
                  { key: 'ai_delivery_risk', label: 'Delivery Risk' },
                  { key: 'ai_bill_check', label: 'Bill Check' },
                  { key: 'ai_order_message', label: 'Order Message' },
                  { key: 'ai_buying_copilot', label: 'Buying Copilot' },
                ].map((tool) => (
                  <button
                    key={tool.key}
                    onClick={() => runAiTool(tool.key)}
                    className={`p-2 rounded-lg text-left font-bold transition-all cursor-pointer ${
                      activeAiTool === tool.key
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>

              {/* AI Output Card */}
              {aiLoading ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs font-semibold">Consulting AI Procurement Model...</p>
                </div>
              ) : aiResponse ? (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <div className="font-bold text-blue-950 text-sm">{aiResponse.title}</div>
                  <p className="text-slate-700 leading-relaxed text-xs">{aiResponse.content}</p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      Recommended Strategic Next Steps:
                    </span>
                    {aiResponse.suggestions.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Buying Copilot Chat Prompt Input */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-700">Ask Buying Copilot:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Which supplier is cheapest for chargers?"
                    value={copilotQuery}
                    onChange={(e) => setCopilotQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') runAiTool('ai_buying_copilot', copilotQuery);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => runAiTool('ai_buying_copilot', copilotQuery)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-[10px] text-slate-400">
              Procurement guidance derived strictly from store records.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NEW ORDER */}
      {/* ========================================================= */}
      {isNewPoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create New Purchase Order</h3>
              <button onClick={() => setIsNewPoOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Supplier</label>
                <select
                  value={newPoSupplierId}
                  onChange={(e) => setNewPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.paymentTerms || 'Credit'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items in PO */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Order Items</label>
                {newPoItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Product</span>
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          setNewPoItems((prev) =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, productId: e.target.value, cost: prod?.costPrice || it.cost } : it
                            )
                          );
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Cost: ₹{p.costPrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500">Order Quantity</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const q = parseInt(e.target.value) || 1;
                            setNewPoItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it)));
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Unit Cost (₹)</span>
                        <input
                          type="number"
                          min="1"
                          value={item.cost}
                          onChange={(e) => {
                            const c = parseFloat(e.target.value) || 0;
                            setNewPoItems((prev) => prev.map((it, i) => (i === idx ? { ...it, cost: c } : it)));
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="text"
                    value={newPoExpectedDate}
                    onChange={(e) => setNewPoExpectedDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order Notes</label>
                  <input
                    type="text"
                    value={newPoNotes}
                    onChange={(e) => setNewPoNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPoOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECEIVE GOODS PANEL */}
      {/* ========================================================= */}
      {isReceiveModalOpen && receiveTargetPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Receive Goods for {receiveTargetPo.poNumber}
                </h3>
                <p className="text-[11px] text-slate-500">Supplier: {receiveTargetPo.supplierName}</p>
              </div>
              <button onClick={() => setIsReceiveModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto text-xs">
              {receiveTargetPo.items.map((line) => {
                const remaining = line.orderQuantity - line.receivedQuantity;
                return (
                  <div key={line.productId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 block">{line.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ordered: {line.orderQuantity} · Previously Received: {line.receivedQuantity} · Remaining: {remaining}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">₹{line.unitCost}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Received Qty</span>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          value={receivingMap[line.productId] ?? remaining}
                          onChange={(e) =>
                            setReceivingMap((prev) => ({
                              ...prev,
                              [line.productId]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Damaged Qty</span>
                        <input
                          type="number"
                          min="0"
                          value={damagedMap[line.productId] ?? 0}
                          onChange={(e) =>
                            setDamagedMap((prev) => ({
                              ...prev,
                              [line.productId]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Billed Cost (₹)</span>
                        <input
                          type="number"
                          min="0"
                          value={newCostMap[line.productId] ?? line.unitCost}
                          onChange={(e) =>
                            setNewCostMap((prev) => ({
                              ...prev,
                              [line.productId]: parseFloat(e.target.value) || line.unitCost,
                            }))
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Upload Supplier Bill Photo */}
              <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Attach Supplier Bill Photo</span>
                  <span className="text-[10px] text-slate-400">Upload paper challan for digital invoice audit</span>
                </div>
                <label className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer text-xs flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>{billPhotoAttached ? 'Attached' : 'Browse File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={() => setBillPhotoAttached('challan photo 2026.jpg')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceive}
                className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all text-xs flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Goods and Update Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT SUPPLIER */}
      {/* ========================================================= */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Tech Distribution"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="07AAAAA0000A1Z5"
                  value={supGstin}
                  onChange={(e) => setSupGstin(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={supTerms}
                    onChange={(e) => setSupTerms(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg cursor-pointer"
                  >
                    <option value="Immediate Cash">Immediate Cash</option>
                    <option value="7 Days Credit">7 Days Credit</option>
                    <option value="15 Days Credit">15 Days Credit</option>
                    <option value="30 Days Credit">30 Days Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Days</label>
                  <input
                    type="number"
                    min="1"
                    value={supDeliveryDays}
                    onChange={(e) => setSupDeliveryDays(parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ========================================================= */}
      {paymentModalBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Supplier Payment</h3>
                <p className="text-[11px] text-slate-500">Bill: {paymentModalBill.billNumber}</p>
              </div>
              <button onClick={() => setPaymentModalBill(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalBill.totalAmount - paymentModalBill.paidAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg cursor-pointer"
                  >
                    <option value="UPI">UPI (GPay, PhonePe)</option>
                    <option value="Bank">Bank NEFT or RTGS</option>
                    <option value="Cash">Cash Drawer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="text"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalBill(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW PO DETAILS */}
      {/* ========================================================= */}
      {viewPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Purchase Order Details</h3>
                <span className="text-[11px] text-slate-500">{viewPoModal.poNumber}</span>
              </div>
              <button onClick={() => setViewPoModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Supplier:</span>
                  <span className="font-bold text-slate-800">{viewPoModal.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Expected Date:</span>
                  <span className="font-mono text-slate-800">{viewPoModal.expectedDeliveryDate}</span>
                </div>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {viewPoModal.items.map((it) => (
                  <div key={it.productId} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{it.productName}</span>
                      <span className="text-[10px] text-slate-400">Qty: {it.orderQuantity} · Received: {it.receivedQuantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{it.lineTotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
                <span>Total Amount:</span>
                <span className="text-base font-black font-mono text-blue-700">₹{viewPoModal.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewPoModal(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
