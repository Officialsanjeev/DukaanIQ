export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier';
  businessId: string;
  storeLocationId: string;
  title: string;
  avatar?: string;
  isDemo?: boolean;
}

export interface Business {
  id: string;
  name: string;
  gstin: string;
  currency: string;
  symbol: string;
  phone: string;
  email: string;
  address: string;
  locations: StoreLocation[];
}

export interface StoreLocation {
  id: string;
  businessId: string;
  name: string;
  code: string;
  city: string;
  state: string;
  invoicePrefix: string;
  isWarehouse?: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  hsnCode: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  taxRate: number; // e.g. 18 for 18% GST (9% CGST + 9% SGST)
  stockOnHand: { [locationId: string]: number };
  reorderPoint: number;
  packSize: number;
  supplierId: string;
  image?: string;
  description?: string;
  variants?: { id: string; name: string; sku: string; price: number; stock: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  selectedVariant?: string;
}

export type TenderType = 'cash' | 'upi' | 'card' | 'split';

export interface TenderPayment {
  type: 'cash' | 'upi' | 'card';
  amount: number;
  reference?: string;
  tenderedCash?: number;
  changeDue?: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  businessId: string;
  locationId: string;
  locationName: string;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discountTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  roundedTotal: number;
  roundingDelta: number;
  payments: TenderPayment[];
  status: 'completed' | 'refunded' | 'voided';
  idempotencyKey: string;
  isOfflineQueued?: boolean;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  averageDeliveryDays: number;
  onTimeDeliveryRate: number; // percentage e.g. 96
  suppliedCategories: string[];
  openBalance: number;
  rating: number; // out of 5
  address?: string;
  paymentTerms?: string;
  deliveryDays?: number;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  orderQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  businessId: string;
  locationId: string;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  expectedDeliveryDate: string;
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  receivedAt?: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
  totalSpend: number;
  totalVisits: number;
  preferredCategory: string;
  lastVisit: string;
  tags: string[];
}

export interface ShiftRecord {
  id: string;
  businessId: string;
  locationId: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  expectedCash: number;
  declaredCash?: number;
  cashVariance?: number;
  totalSalesCount: number;
  totalSalesValue: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface StockMovement {
  id: string;
  businessId: string;
  locationId: string;
  productId: string;
  productName: string;
  delta: number;
  type: 'sale' | 'purchase_receive' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'refund';
  referenceId: string;
  timestamp: string;
  actorName: string;
  reason: string;
}

export interface DynamicPricingSuggestion {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  costPrice: number;
  currentMarginPercent: number;
  projectedMarginPercent: number;
  expectedSalesUpliftPercent: number;
  reason: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface DemandForecastItem {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  avgDailyDemand: number;
  supplierLeadDays: number;
  leadTimeDemand: number;
  safetyStock: number;
  predictedDemandNextMonth: number;
  suggestedPurchaseQuantity: number;
  stockoutRisk: 'Critical' | 'Warning' | 'Low';
  supplierId: string;
  supplierName: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  evidence?: {
    type: string;
    title: string;
    value: string;
    detail?: string;
  }[];
  suggestedActions?: {
    label: string;
    actionType: 'create_po' | 'apply_pricing' | 'view_report' | 'open_product';
    payload?: any;
  }[];
}

export interface BulkProductImportItem {
  sku: string;
  name: string;
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  hsnCode?: string;
  costPrice?: number;
  sellingPrice?: number;
  mrp?: number;
  taxRate?: number;
  stock?: number;
  stockByLocation?: { [locationId: string]: number };
  reorderPoint?: number;
  packSize?: number;
  supplierId?: string;
  description?: string;
}

export interface BulkImportResult {
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  errors: { row: number; sku?: string; error: string }[];
}

export type AlertSeverity = 'out_of_stock' | 'critical' | 'reorder_needed';
export type ThresholdFilterMode = 'all_flagged' | 'out_of_stock' | 'critical_only' | 'custom_qty';

export interface CriticalInventoryAlert {
  productId: string;
  product: Product;
  currentStock: number;
  threshold: number;
  thresholdType: 'reorder_point' | 'lead_time_buffer' | 'custom_threshold' | 'zero_stock';
  severity: AlertSeverity;
  shortageQuantity: number;
  avgDailyDemand: number;
  daysOfSupplyRemaining: number;
  potentialLostDailyRevenue: number;
  suggestedPurchaseQuantity: number;
  leadTimeDays: number;
  supplierName: string;
  supplierId: string;
  hasAlternateStockLocation?: {
    locationId: string;
    locationName: string;
    availableStock: number;
  };
}
