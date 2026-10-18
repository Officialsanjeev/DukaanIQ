import React, { useState } from 'react';
import { ComputedStockProduct, PlanScenario } from './types';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, ChevronRight, X, Eye } from 'lucide-react';

interface TabOverviewProps {
  items: ComputedStockProduct[];
  totalStockValue: number;
  itemsToOrderCount: number;
  urgentCount: number;
  moneyStuckTotal: number;
  plan: PlanScenario;
  onNavigateTab: (tabIndex: number) => void;
  onOpenDetailsModal: () => void;
  onQuickOrder: (item: ComputedStockProduct) => void;
}

export const TabOverview: React.FC<TabOverviewProps> = ({
  items,
  totalStockValue,
  itemsToOrderCount,
  urgentCount,
  moneyStuckTotal,
  plan,
  onNavigateTab,
  onOpenDetailsModal,
  onQuickOrder,
}) => {
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; ySales: number; yBuying: number; label: string; sales: number; buying: number } | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Status counts for Donut Chart
  const goodCount = items.filter((i) => i.status === 'Good').length;
  const orderSoonCount = items.filter((i) => i.status === 'Order soon').length;
  const urgentItemsCount = items.filter((i) => i.status === 'Urgent').length;
  const tooMuchCount = items.filter((i) => i.status === 'Too much stock').length;
  const totalCount = items.length || 7;

  // Donut angles
  const pGood = (goodCount / totalCount) * 100;
  const pSoon = (orderSoonCount / totalCount) * 100;
  const pUrgent = (urgentItemsCount / totalCount) * 100;
  const pTooMuch = (tooMuchCount / totalCount) * 100;

  // Circumference for r=36 is 2 * PI * 36 = 226.2
  const c = 226.2;
  const strokeGood = (pGood / 100) * c;
  const strokeSoon = (pSoon / 100) * c;
  const strokeUrgent = (pUrgent / 100) * c;
  const strokeTooMuch = (pTooMuch / 100) * c;

  const offsetGood = 0;
  const offsetSoon = -strokeGood;
  const offsetUrgent = -(strokeGood + strokeSoon);
  const offsetTooMuch = -(strokeGood + strokeSoon + strokeUrgent);

  // Line Chart Data based on range & plan multiplier
  const planScale = plan === 'diwali' ? 1.85 : plan === 'sale' ? 1.45 : 1.0;

  const chartPointsByRange = {
    '7D': [
      { label: 'Mon', sales: Math.round(18200 * planScale), buying: 12000 },
      { label: 'Tue', sales: Math.round(19500 * planScale), buying: 14000 },
      { label: 'Wed', sales: Math.round(21400 * planScale), buying: 8000 },
      { label: 'Thu', sales: Math.round(20800 * planScale), buying: 24000 },
      { label: 'Fri', sales: Math.round(24500 * planScale), buying: 16000 },
      { label: 'Sat', sales: Math.round(31200 * planScale), buying: 9000 },
      { label: 'Sun', sales: Math.round(28400 * planScale), buying: 5000 },
    ],
    '30D': [
      { label: 'Week 1', sales: Math.round(124000 * planScale), buying: 98000 },
      { label: 'Week 2', sales: Math.round(138000 * planScale), buying: 112000 },
      { label: 'Week 3', sales: Math.round(152000 * planScale), buying: 84000 },
      { label: 'Week 4', sales: Math.round(168000 * planScale), buying: 140000 },
    ],
    '90D': [
      { label: 'Month 1', sales: Math.round(480000 * planScale), buying: 410000 },
      { label: 'Month 2', sales: Math.round(540000 * planScale), buying: 490000 },
      { label: 'Month 3', sales: Math.round(620000 * planScale), buying: 510000 },
    ],
    '1Y': [
      { label: 'Q1', sales: Math.round(1450000 * planScale), buying: 1200000 },
      { label: 'Q2', sales: Math.round(1620000 * planScale), buying: 1350000 },
      { label: 'Q3', sales: Math.round(1890000 * planScale), buying: 1540000 },
      { label: 'Q4', sales: Math.round(2240000 * planScale), buying: 1780000 },
    ],
  };

  const currentChartData = chartPointsByRange[chartRange];
  const maxVal = Math.max(...currentChartData.flatMap((d) => [d.sales, d.buying])) * 1.15;

  // Chart coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const pointsSales = currentChartData.map((d, idx) => {
    const x = paddingX + (idx / (currentChartData.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.sales / maxVal) * chartH;
    return { ...d, x, y };
  });

  const pointsBuying = currentChartData.map((d, idx) => {
    const x = paddingX + (idx / (currentChartData.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.buying / maxVal) * chartH;
    return { ...d, x, y };
  });

  const salesPath = pointsSales.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const buyingPath = pointsBuying.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  // Top 5 items needing attention
  const attentionItems = [...items]
    .sort((a, b) => {
      const orderWeight = { Urgent: 3, 'Order soon': 2, 'Too much stock': 1, Good: 0, Ordered: 0 };
      return orderWeight[b.status] - orderWeight[a.status];
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Pastel Summary Cards without borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stock Value (Pastel Teal) */}
        <div className="bg-[#E3F4F1]  rounded-[18px] p-5 shadow-xs transition-all hover:scale-[1.01]">
          <p className="text-xs font-semibold text-[#0F766E]  uppercase tracking-wide">
            Total Stock Value
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B2420] ">
            Rs {totalStockValue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center text-xs font-semibold text-[#15803D]  gap-1">
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>+4.2% more than last week</span>
          </div>
        </div>

        {/* Card 2: Items to Order (Pastel Peach) */}
        <div className="bg-[#FDEBDD]  rounded-[18px] p-5 shadow-xs transition-all hover:scale-[1.01]">
          <p className="text-xs font-semibold text-[#B45309]  uppercase tracking-wide">
            Items to Order
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B2420] ">
            {itemsToOrderCount} items
          </div>
          <div className="mt-2.5 flex items-center text-xs font-semibold text-[#B45309]  gap-1">
            <span>order before Friday</span>
          </div>
        </div>

        {/* Card 3: Urgent Items (Pastel Yellow) */}
        <div className="bg-[#FFF4CC]  rounded-[18px] p-5 shadow-xs transition-all hover:scale-[1.01]">
          <p className="text-xs font-semibold text-[#92400E]  uppercase tracking-wide">
            Urgent Items
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B2420] ">
            {urgentCount} items
          </div>
          <div className="mt-2.5 flex items-center text-xs font-semibold text-[#C2410C]  gap-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>may finish before delivery</span>
          </div>
        </div>

        {/* Card 4: Money Stuck (Pastel Lavender) */}
        <div className="bg-[#ECE9FB]  rounded-[18px] p-5 shadow-xs transition-all hover:scale-[1.01]">
          <p className="text-xs font-semibold text-[#4338CA]  uppercase tracking-wide">
            Money Stuck
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B2420] ">
            Rs {moneyStuckTotal.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center text-xs font-semibold text-[#4338CA]  gap-1">
            <span>in excess cables & chargers</span>
          </div>
        </div>
      </div>

      {/* Alert Strip (Orange-soft with Dismiss) */}
      {!alertDismissed && (
        <div className="bg-[#FDEFD3]  border border-[#FCD399]  rounded-[18px] p-4 flex items-center justify-between gap-3 text-sm text-[#B45309]  shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] animate-pulse shrink-0"></span>
            <p className="font-semibold text-[14px]">
              {plan === 'diwali'
                ? 'Diwali rush active: NexPhone 15 Pro and SonicPro Headphones will run out in 4 days. Stock up now.'
                : 'NexPhone 15 Pro is selling 2 times faster than usual this week.'}
            </p>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            className="text-xs font-semibold text-[#B45309]  hover:underline px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Row: Line Chart + Stock Health Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Big Sales & Buying Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white  border border-[#E4E1D8]  rounded-[18px] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D8]/60 ">
            <div>
              <h3 className="text-[16px] font-bold text-[#1B2420] ">
                Sales and Buying
              </h3>
              <p className="text-xs text-[#66726C]  mt-0.5">
                Comparison of what you sold vs what you bought
              </p>
            </div>

            {/* Range Switcher */}
            <div className="flex items-center bg-[#F6F4EF]  p-1 rounded-full border border-[#E4E1D8]  self-start sm:self-auto">
              {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    chartRange === r
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs'
                      : 'text-[#66726C]  hover:text-[#1B2420] '
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Smooth Chart */}
          <div className="relative mt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 sm:h-64 overflow-visible"
            >
              {/* Thin Grid Lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = svgHeight - paddingY - ratio * chartH;
                return (
                  <line
                    key={ratio}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-[#E4E1D8]/80 "
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Buying Line (Amber) */}
              <path
                d={buyingPath}
                fill="none"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Sales Line (Teal) */}
              <path
                d={salesPath}
                fill="none"
                stroke="#0F766E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points for Sales */}
              {pointsSales.map((p, i) => (
                <g key={`sales-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.label === p.label ? 6 : 4}
                    fill="#0F766E"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: p.x,
                        ySales: p.y,
                        yBuying: pointsBuying[i].y,
                        label: p.label,
                        sales: p.sales,
                        buying: p.buying,
                      })
                    }
                  />
                  {/* X-axis Label */}
                  <text
                    x={p.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="text-[11px] fill-[#66726C]  font-medium"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-white  border border-[#E4E1D8]  rounded-[12px] p-3 shadow-lg text-xs pointer-events-none transition-all z-20"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: '15%',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="font-bold text-[#1B2420]  mb-1">
                  {hoveredPoint.label}
                </div>
                <div className="flex items-center gap-2 text-[#0F766E] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                  <span>Sales: Rs {hoveredPoint.sales.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2 text-[#D97706] font-semibold mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                  <span>Buying: Rs {hoveredPoint.buying.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-[#E4E1D8]/60  text-xs">
            <div className="flex items-center gap-2 font-medium text-[#1B2420] ">
              <span className="w-3 h-1 bg-[#0F766E] rounded-full"></span>
              <span>Sales (Customer revenue)</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-[#1B2420] ">
              <span className="w-3 h-1 bg-[#D97706] rounded-full"></span>
              <span>Buying (Stock purchase)</span>
            </div>
          </div>
        </div>

        {/* Right: Donut Chart "Stock Health" (1 col) */}
        <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]/60 ">
              <div>
                <h3 className="text-[16px] font-bold text-[#1B2420] ">
                  Stock Health
                </h3>
                <p className="text-xs text-[#66726C]  mt-0.5">
                  Condition of all 7 items in Delhi
                </p>
              </div>
            </div>

            {/* Donut SVG */}
            <div className="relative flex items-center justify-center my-6">
              <svg width="150" height="150" viewBox="0 0 100 100" className="rotate-[-90deg]">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#F6F4EF"
                  strokeWidth="14"
                  className=""
                />
                {/* Good Segment */}
                {strokeGood > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#15803D"
                    strokeWidth="14"
                    strokeDasharray={`${strokeGood} ${c}`}
                    strokeDashoffset={offsetGood}
                  />
                )}
                {/* Order Soon Segment */}
                {strokeSoon > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#B45309"
                    strokeWidth="14"
                    strokeDasharray={`${strokeSoon} ${c}`}
                    strokeDashoffset={offsetSoon}
                  />
                )}
                {/* Urgent Segment */}
                {strokeUrgent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="14"
                    strokeDasharray={`${strokeUrgent} ${c}`}
                    strokeDashoffset={offsetUrgent}
                  />
                )}
                {/* Too Much Segment */}
                {strokeTooMuch > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#4338CA"
                    strokeWidth="14"
                    strokeDasharray={`${strokeTooMuch} ${c}`}
                    strokeDashoffset={offsetTooMuch}
                  />
                )}
              </svg>

              {/* Center Total Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#1B2420] ">
                  {totalCount}
                </span>
                <span className="text-[11px] text-[#66726C]  font-medium">
                  Products
                </span>
              </div>
            </div>

            {/* Legend with Pills */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#DFF3E6]/60  text-[#15803D] ">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                  Good ({goodCount})
                </span>
                <span>{Math.round(pGood)}%</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FDEFD3]/60  text-[#B45309] ">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B45309]"></span>
                  Order soon ({orderSoonCount})
                </span>
                <span>{Math.round(pSoon)}%</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FDE4DA]/60  text-[#C2410C] ">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C2410C]"></span>
                  Urgent ({urgentItemsCount})
                </span>
                <span>{Math.round(pUrgent)}%</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#E6E4FB]/60  text-[#4338CA] ">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4338CA]"></span>
                  Too much stock ({tooMuchCount})
                </span>
                <span>{Math.round(pTooMuch)}%</span>
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <button
            onClick={onOpenDetailsModal}
            className="mt-4 min-h-[44px] w-full bg-white  border border-[#E4E1D8]  hover:bg-[#F6F4EF]  text-[#1B2420]  rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* List: Needs Your Attention (Top 5 items) */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D8]/60 ">
          <div>
            <h3 className="text-[16px] font-bold text-[#1B2420] ">
              Needs your attention
            </h3>
            <p className="text-xs text-[#66726C]  mt-0.5">
              Top items you should look at first
            </p>
          </div>
          <button
            onClick={() => onNavigateTab(1)}
            className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Forecasts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#E4E1D8]/60 ">
          {attentionItems.map((item) => {
            // Status tag colors
            const statusConfig = {
              Urgent: { bg: 'bg-[#FDE4DA]', text: 'text-[#C2410C]', dot: 'bg-[#C2410C]' },
              'Order soon': { bg: 'bg-[#FDEFD3]', text: 'text-[#B45309]', dot: 'bg-[#B45309]' },
              'Too much stock': { bg: 'bg-[#E6E4FB]', text: 'text-[#4338CA]', dot: 'bg-[#4338CA]' },
              Good: { bg: 'bg-[#DFF3E6]', text: 'text-[#15803D]', dot: 'bg-[#15803D]' },
              Ordered: { bg: 'bg-[#DDF1EE]', text: 'text-[#0F766E]', dot: 'bg-[#0F766E]' },
            }[item.status];

            return (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F6F4EF]/50  px-2 rounded-xl transition-colors"
              >
                {/* Left: Product Info & Reason */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#F6F4EF]  flex items-center justify-center text-xl shrink-0 border border-[#E4E1D8]/60 ">
                    {item.imageEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#1B2420] ">
                        {item.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#66726C]  mt-0.5">
                      {item.reason} ({item.inStock} in stock • Rs {item.price.toLocaleString('en-IN')})
                    </p>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-[#66726C] ">
                      Likely sales (30d)
                    </span>
                    <p className="text-sm font-bold text-[#1B2420] ">
                      {item.likelySales} units
                    </p>
                  </div>
                  <button
                    onClick={() => onQuickOrder(item)}
                    className="min-h-[44px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
