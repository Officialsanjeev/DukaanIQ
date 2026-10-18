import {
  Product,
  Supplier,
  StoreLocation,
  PurchaseOrder,
  CriticalInventoryAlert,
  AlertSeverity,
  ThresholdFilterMode,
} from '../types';

export interface ThresholdEvaluationOptions {
  mode?: ThresholdFilterMode;
  customThresholdValue?: number;
  categoryFilter?: string;
  sortBy?: 'urgency' | 'revenue_risk' | 'stock_asc' | 'days_left';
}

export interface CriticalAlertsSummary {
  alerts: CriticalInventoryAlert[];
  totalFlagged: number;
  outOfStockCount: number;
  criticalCount: number;
  reorderNeededCount: number;
  totalShortageUnits: number;
  totalDailyRevenueAtRisk: number;
  canTransferFromWarehouseCount: number;
}

/**
 * Automatically flags products falling below defined inventory thresholds:
 * 1. Out of Stock: Stock === 0
 * 2. Critical: Stock <= Lead Time Demand (demand during supplier lead time buffer)
 * 3. Reorder Needed: Stock <= Defined Reorder Point (or custom threshold)
 *
 * Computes sales velocity, days of supply remaining, financial exposure,
 * and identifies potential cross-store transfer candidates with surplus stock.
 */
export function evaluateCriticalStockAlerts(
  products: Product[],
  currentLocationId: string,
  suppliers: Supplier[],
  availableLocations: StoreLocation[],
  purchaseOrders: PurchaseOrder[] = [],
  options: ThresholdEvaluationOptions = {}
): CriticalAlertsSummary {
  const mode = options.mode || 'all_flagged';
  const customThreshold = options.customThresholdValue ?? 10;
  const categoryFilter = options.categoryFilter || 'All';
  const sortBy = options.sortBy || 'urgency';

  // Map open POs by product ID
  const openPoQuantities = new Map<string, number>();
  purchaseOrders
    .filter((po) => po.status === 'ordered')
    .forEach((po) => {
      po.items.forEach((item) => {
        const remaining = Math.max(0, item.orderQuantity - item.receivedQuantity);
        const curr = openPoQuantities.get(item.productId) || 0;
        openPoQuantities.set(item.productId, curr + remaining);
      });
    });

  const alerts: CriticalInventoryAlert[] = [];

  for (const prod of products) {
    if (categoryFilter !== 'All' && prod.category !== categoryFilter) {
      continue;
    }

    const currentStock = prod.stockOnHand[currentLocationId] ?? 0;
    const supplier = suppliers.find((s) => s.id === prod.supplierId);
    const leadDays = supplier?.averageDeliveryDays || 3;

    // Daily sales velocity estimation grounded by category sales patterns
    let avgDailyDemand = 1.8;
    if (prod.category === 'Screen Guards') avgDailyDemand = 8.5;
    else if (prod.category === 'Chargers & Cables') avgDailyDemand = 4.2;
    else if (prod.category === 'Audio') avgDailyDemand = 2.4;
    else if (prod.category === 'Smartphones') avgDailyDemand = 0.6;
    else if (prod.category === 'Power Banks') avgDailyDemand = 1.9;
    else if (prod.category === 'Smart Wearables') avgDailyDemand = 1.4;
    else if (prod.category === 'Protective Cases') avgDailyDemand = 3.6;

    const leadTimeDemand = Math.max(1, Math.round(avgDailyDemand * leadDays));
    const effectiveReorderPoint = prod.reorderPoint > 0 ? prod.reorderPoint : 15;
    const targetStock = Math.round(avgDailyDemand * 30); // 30-day target buffer

    let isFlagged = false;
    let severity: AlertSeverity = 'reorder_needed';
    let threshold = effectiveReorderPoint;
    let thresholdType: CriticalInventoryAlert['thresholdType'] = 'reorder_point';

    if (mode === 'out_of_stock') {
      if (currentStock === 0) {
        isFlagged = true;
        severity = 'out_of_stock';
        threshold = 0;
        thresholdType = 'zero_stock';
      }
    } else if (mode === 'critical_only') {
      if (currentStock === 0) {
        isFlagged = true;
        severity = 'out_of_stock';
        threshold = 0;
        thresholdType = 'zero_stock';
      } else if (currentStock <= leadTimeDemand) {
        isFlagged = true;
        severity = 'critical';
        threshold = leadTimeDemand;
        thresholdType = 'lead_time_buffer';
      }
    } else if (mode === 'custom_qty') {
      threshold = customThreshold;
      thresholdType = 'custom_threshold';
      if (currentStock <= customThreshold) {
        isFlagged = true;
        if (currentStock === 0) severity = 'out_of_stock';
        else if (currentStock <= Math.floor(customThreshold * 0.4)) severity = 'critical';
        else severity = 'reorder_needed';
      }
    } else {
      // Default: 'all_flagged'
      if (currentStock === 0) {
        isFlagged = true;
        severity = 'out_of_stock';
        threshold = 0;
        thresholdType = 'zero_stock';
      } else if (currentStock <= leadTimeDemand) {
        isFlagged = true;
        severity = 'critical';
        threshold = leadTimeDemand;
        thresholdType = 'lead_time_buffer';
      } else if (currentStock <= effectiveReorderPoint) {
        isFlagged = true;
        severity = 'reorder_needed';
        threshold = effectiveReorderPoint;
        thresholdType = 'reorder_point';
      }
    }

    if (!isFlagged) {
      continue;
    }

    // Days of supply left
    const daysOfSupplyRemaining =
      avgDailyDemand > 0 ? Number((currentStock / avgDailyDemand).toFixed(1)) : 99;

    // Shortage calculations
    const openOrders = openPoQuantities.get(prod.id) || 0;
    const targetReplenish = Math.max(0, targetStock - currentStock - openOrders);
    const suggestedPurchaseQuantity =
      targetReplenish > 0
        ? Math.ceil(targetReplenish / (prod.packSize || 1)) * (prod.packSize || 1)
        : 0;

    const shortageQuantity = Math.max(0, effectiveReorderPoint - currentStock);
    const potentialLostDailyRevenue = Math.round(avgDailyDemand * prod.sellingPrice);

    // Check if another store or Central Warehouse Hub has surplus stock
    let hasAlternateStockLocation: CriticalInventoryAlert['hasAlternateStockLocation'] = undefined;
    for (const loc of availableLocations) {
      if (loc.id !== currentLocationId) {
        const altStock = prod.stockOnHand[loc.id] || 0;
        // If other location has stock significantly above its own reorder point or is a warehouse
        if (altStock >= (loc.isWarehouse ? 20 : effectiveReorderPoint)) {
          if (!hasAlternateStockLocation || altStock > hasAlternateStockLocation.availableStock) {
            hasAlternateStockLocation = {
              locationId: loc.id,
              locationName: loc.name,
              availableStock: altStock,
            };
          }
        }
      }
    }

    alerts.push({
      productId: prod.id,
      product: prod,
      currentStock,
      threshold,
      thresholdType,
      severity,
      shortageQuantity,
      avgDailyDemand,
      daysOfSupplyRemaining,
      potentialLostDailyRevenue,
      suggestedPurchaseQuantity,
      leadTimeDays: leadDays,
      supplierName: supplier?.name || 'Primary Supplier',
      supplierId: prod.supplierId,
      hasAlternateStockLocation,
    });
  }

  // Sorting
  alerts.sort((a, b) => {
    if (sortBy === 'urgency') {
      const severityScore = { out_of_stock: 3, critical: 2, reorder_needed: 1 };
      const scoreDiff = severityScore[b.severity] - severityScore[a.severity];
      if (scoreDiff !== 0) return scoreDiff;
      return a.daysOfSupplyRemaining - b.daysOfSupplyRemaining;
    }
    if (sortBy === 'revenue_risk') {
      return b.potentialLostDailyRevenue - a.potentialLostDailyRevenue;
    }
    if (sortBy === 'stock_asc') {
      return a.currentStock - b.currentStock;
    }
    if (sortBy === 'days_left') {
      return a.daysOfSupplyRemaining - b.daysOfSupplyRemaining;
    }
    return 0;
  });

  const totalFlagged = alerts.length;
  const outOfStockCount = alerts.filter((a) => a.severity === 'out_of_stock').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const reorderNeededCount = alerts.filter((a) => a.severity === 'reorder_needed').length;
  const totalShortageUnits = alerts.reduce((sum, a) => sum + a.shortageQuantity, 0);
  const totalDailyRevenueAtRisk = alerts.reduce((sum, a) => sum + a.potentialLostDailyRevenue, 0);
  const canTransferFromWarehouseCount = alerts.filter((a) => !!a.hasAlternateStockLocation).length;

  return {
    alerts,
    totalFlagged,
    outOfStockCount,
    criticalCount,
    reorderNeededCount,
    totalShortageUnits,
    totalDailyRevenueAtRisk,
    canTransferFromWarehouseCount,
  };
}
