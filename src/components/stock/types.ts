export type PlanScenario = 'normal' | 'diwali' | 'sale';

export type StockStatus = 'Good' | 'Order soon' | 'Urgent' | 'Too much stock' | 'Ordered';

export interface StockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  inStock: number;
  supplierName: string;
  supplierDeliveryDays: number;
  imageEmoji: string;
  // History for past 6 months [May, Jun, Jul, Aug, Sep, Oct]
  historySales: number[];
  // Baseline likely sales in next 30 days
  baseLikelySales: number;
  shelfLifeDays?: number;
  reorderPackSize: number;
}

export interface ComputedStockProduct extends StockProduct {
  likelySales: number;
  likelyRangeMin: number;
  likelyRangeMax: number;
  daysLeft: number;
  suggestedOrder: number;
  status: StockStatus;
  moneyStuck: number;
  reason: string;
}

export const INITIAL_STOCK_PRODUCTS: StockProduct[] = [
  {
    id: 'sp-1',
    name: 'SonicPro Wireless Headphones',
    sku: 'AUDIO-ANC-01',
    category: 'Audio',
    price: 3499,
    costPrice: 2200,
    inStock: 14,
    supplierName: 'TechSupply India Ltd',
    supplierDeliveryDays: 2,
    imageEmoji: '🎧',
    historySales: [16, 18, 22, 25, 20, 24],
    baseLikelySales: 22,
    reorderPackSize: 5,
  },
  {
    id: 'sp-2',
    name: 'AeroPods True Wireless',
    sku: 'AUDIO-TWS-02',
    category: 'Audio',
    price: 1799,
    costPrice: 950,
    inStock: 38,
    supplierName: 'TechSupply India Ltd',
    supplierDeliveryDays: 2,
    imageEmoji: '🎵',
    historySales: [30, 34, 38, 42, 40, 44],
    baseLikelySales: 42,
    reorderPackSize: 10,
  },
  {
    id: 'sp-3',
    name: 'NexPhone 15 Pro',
    sku: 'PHONE-NEX-12',
    category: 'Smartphones',
    price: 64999,
    costPrice: 52000,
    inStock: 6,
    supplierName: 'NexDevice Smartphone Distribution',
    supplierDeliveryDays: 4,
    imageEmoji: '📱',
    historySales: [8, 10, 11, 14, 12, 15],
    baseLikelySales: 14,
    reorderPackSize: 2,
  },
  {
    id: 'sp-4',
    name: 'VoltSpeed 65W Charger',
    sku: 'CHG-65W-GAN',
    category: 'Chargers',
    price: 1499,
    costPrice: 750,
    inStock: 45,
    supplierName: 'VoltPower Components',
    supplierDeliveryDays: 3,
    imageEmoji: '⚡',
    historySales: [32, 35, 39, 44, 40, 48],
    baseLikelySales: 45,
    reorderPackSize: 10,
  },
  {
    id: 'sp-5',
    name: 'VoltTank 20,000 mAh Power Bank',
    sku: 'PB-20K-PD',
    category: 'Power Banks',
    price: 1899,
    costPrice: 1100,
    inStock: 18,
    supplierName: 'VoltPower Components',
    supplierDeliveryDays: 3,
    imageEmoji: '🔋',
    historySales: [14, 16, 15, 18, 14, 16],
    baseLikelySales: 16,
    reorderPackSize: 5,
  },
  {
    id: 'sp-6',
    name: 'Braided USB-C Cable 60W',
    sku: 'CAB-USBC-60',
    category: 'Cables',
    price: 299,
    costPrice: 90,
    inStock: 70,
    supplierName: 'TechSupply India Ltd',
    supplierDeliveryDays: 2,
    imageEmoji: '🔌',
    historySales: [80, 95, 110, 105, 115, 120],
    baseLikelySales: 115,
    reorderPackSize: 25,
  },
  {
    id: 'sp-7',
    name: 'SonicBoom Speaker',
    sku: 'SPK-BOOM-01',
    category: 'Audio',
    price: 2499,
    costPrice: 1500,
    inStock: 8,
    supplierName: 'TechSupply India Ltd',
    supplierDeliveryDays: 2,
    imageEmoji: '🔊',
    historySales: [12, 14, 15, 18, 16, 17],
    baseLikelySales: 17,
    reorderPackSize: 5,
  },
];

export function computeStockMetrics(
  products: StockProduct[],
  plan: PlanScenario
): {
  items: ComputedStockProduct[];
  totalStockValue: number;
  itemsToOrderCount: number;
  urgentCount: number;
  moneyStuckTotal: number;
  growthMultiplier: number;
} {
  // Plan Multipliers
  let multiplier = 1.0;
  if (plan === 'diwali') multiplier = 1.85; // Festive rush
  if (plan === 'sale') multiplier = 1.45; // Big discount promotion

  const items: ComputedStockProduct[] = products.map((p) => {
    const likelySales = Math.round(p.baseLikelySales * multiplier);
    const likelyRangeMin = Math.max(1, Math.round(likelySales * 0.85));
    const likelyRangeMax = Math.round(likelySales * 1.2);

    // Daily consumption rate
    const dailyRate = likelySales / 30;
    const daysLeft = Math.max(1, Math.round(p.inStock / (dailyRate || 1)));

    // Status logic
    let status: StockStatus = 'Good';
    let suggestedOrder = 0;
    let reason = 'Stock level is healthy.';

    if (daysLeft <= p.supplierDeliveryDays + 3) {
      status = 'Urgent';
      suggestedOrder = Math.max(
        p.reorderPackSize,
        Math.ceil((likelySales * 1.1 - p.inStock) / p.reorderPackSize) * p.reorderPackSize
      );
      reason = `May run out in ${daysLeft} days before supplier delivers.`;
    } else if (daysLeft <= p.supplierDeliveryDays + 8) {
      status = 'Order soon';
      suggestedOrder = Math.max(
        p.reorderPackSize,
        Math.ceil((likelySales - p.inStock) / p.reorderPackSize) * p.reorderPackSize
      );
      reason = `Stock will run low in ${daysLeft} days. Order soon.`;
    } else if (p.inStock > likelySales * 1.5 && p.inStock > 30) {
      status = 'Too much stock';
      suggestedOrder = 0;
      reason = `Stock exceeds 45 days of sales. Cash is locked up.`;
    } else {
      status = 'Good';
      suggestedOrder = 0;
      reason = `Enough stock for ${daysLeft} days.`;
    }

    // Money stuck in slow/excess stock
    const excessUnits = Math.max(0, p.inStock - Math.round(likelySales * 0.8));
    const moneyStuck = excessUnits * p.costPrice;

    return {
      ...p,
      likelySales,
      likelyRangeMin,
      likelyRangeMax,
      daysLeft,
      suggestedOrder,
      status,
      moneyStuck,
      reason,
    };
  });

  const totalStockValue = items.reduce((sum, it) => sum + it.inStock * it.price, 0);
  const itemsToOrderCount = items.filter(
    (it) => it.status === 'Urgent' || it.status === 'Order soon'
  ).length;
  const urgentCount = items.filter((it) => it.status === 'Urgent').length;
  const moneyStuckTotal = items.reduce((sum, it) => sum + it.moneyStuck, 0);

  return {
    items,
    totalStockValue,
    itemsToOrderCount,
    urgentCount,
    moneyStuckTotal,
    growthMultiplier: multiplier,
  };
}
