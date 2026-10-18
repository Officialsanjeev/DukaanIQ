import React, { useState, useEffect } from 'react';
import { ComputedStockProduct, PlanScenario } from './types';
import { Search, ArrowUpDown, ChevronRight, AlertCircle, ShoppingCart } from 'lucide-react';

interface TabDemandForecastProps {
  items: ComputedStockProduct[];
  plan: PlanScenario;
  onQuickOrder: (item: ComputedStockProduct) => void;
}

export const TabDemandForecast: React.FC<TabDemandForecastProps> = ({
  items,
  plan,
  onQuickOrder,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || 'sp-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Order now' | 'Too much' | 'Good'>('All');
  const [sortField, setSortField] = useState<'name' | 'inStock' | 'likelySales' | 'daysLeft' | 'suggestedOrder'>('daysLeft');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Dynamic sentence for selected item
  const [aiSentence, setAiSentence] = useState<string>('');
  const [loadingSentence, setLoadingSentence] = useState<boolean>(false);

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  // Fetch or calculate plain sentence when selected item or plan changes
  useEffect(() => {
    if (!selectedItem) return;

    let isMounted = true;
    const fetchSentence = async () => {
      setLoadingSentence(true);
      try {
        const res = await fetch('/api/ai/stock/sentence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemName: selectedItem.name,
            inStock: selectedItem.inStock,
            daysLeft: selectedItem.daysLeft,
            deliveryDays: selectedItem.supplierDeliveryDays,
            plan,
          }),
        });
        if (!res.ok) throw new Error('Sentence fetch failed');
        const data = await res.json();
        if (isMounted && data.sentence) {
          setAiSentence(data.sentence);
        }
      } catch {
        if (isMounted) {
          setAiSentence(
            `You may run out in ${selectedItem.daysLeft} days. Delivery takes ${selectedItem.supplierDeliveryDays} days, so order now.`
          );
        }
      } finally {
        if (isMounted) setLoadingSentence(false);
      }
    };

    fetchSentence();
    return () => {
      isMounted = false;
    };
  }, [selectedItem.id, selectedItem.daysLeft, selectedItem.inStock, plan]);

  // Filter & Sort
  const filteredItems = items
    .filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (filterStatus === 'Order now') return item.status === 'Urgent' || item.status === 'Order soon';
      if (filterStatus === 'Too much') return item.status === 'Too much stock';
      if (filterStatus === 'Good') return item.status === 'Good';
      return true;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Forecast Big Chart coordinates for selected item
  // 6 historical months: May, Jun, Jul, Aug, Sep, Oct
  // 1 future month: Nov (projected with range band)
  const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov (Est)'];
  const histPoints = selectedItem.historySales;
  const nextPoint = selectedItem.likelySales;
  const bandMin = selectedItem.likelyRangeMin;
  const bandMax = selectedItem.likelyRangeMax;

  const chartMax = Math.max(...histPoints, nextPoint, bandMax) * 1.25;

  const chartWidth = 540;
  const chartHeight = 200;
  const padX = 35;
  const padY = 20;
  const usableW = chartWidth - padX * 2;
  const usableH = chartHeight - padY * 2;

  const xCoords = monthLabels.map((_, i) => padX + (i / (monthLabels.length - 1)) * usableW);
  const yHist = histPoints.map((val) => chartHeight - padY - (val / chartMax) * usableH);
  const yNext = chartHeight - padY - (nextPoint / chartMax) * usableH;
  const yBandMin = chartHeight - padY - (bandMin / chartMax) * usableH;
  const yBandMax = chartHeight - padY - (bandMax / chartMax) * usableH;

  // Solid line for past 6 months
  const solidPath = yHist.reduce((acc, y, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${xCoords[i]} ${y}`, '');

  // Dotted line connecting Oct (index 5) to Nov (index 6)
  const dottedPath = `M ${xCoords[5]} ${yHist[5]} L ${xCoords[6]} ${yNext}`;

  // Likely range band polygon between Oct and Nov
  const bandPolygon = `${xCoords[5]},${yHist[5]} ${xCoords[6]},${yBandMax} ${xCoords[6]},${yBandMin}`;

  return (
    <div className="space-y-6">
      {/* Top Banner / Question clarification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs">
        <div>
          <h2 className="text-[18px] font-bold text-[#1B2420] ">
            Demand Forecast
          </h2>
          <p className="text-sm text-[#66726C]  mt-0.5">
            How much will I sell next month? All numbers update with your selected plan scenario.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DDF1EE]  text-[#0F766E]  self-start sm:self-auto">
          Active Plan: {plan === 'diwali' ? 'Diwali month (8 Nov)' : plan === 'sale' ? 'Big sale (20% off)' : 'Normal month'}
        </div>
      </div>

      {/* Main Grid: Forecast Table + Selected Item Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Table + Search & Filter */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Search and Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D8]/60 ">
              {/* Search box */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#66726C]  absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F4EF]  border border-[#E4E1D8]  rounded-xl text-[#1B2420]  placeholder-[#66726C] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'Order now', 'Too much', 'Good'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterStatus(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filterStatus === filter
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs'
                        : 'bg-[#F6F4EF]  text-[#66726C]  hover:text-[#1B2420]  border border-[#E4E1D8]/60 '
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4E1D8]  text-[#66726C]  font-bold">
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-[#1B2420] "
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Item</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-2 text-right cursor-pointer hover:text-[#1B2420] "
                      onClick={() => toggleSort('inStock')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>In stock</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-2 text-right cursor-pointer hover:text-[#1B2420] "
                      onClick={() => toggleSort('likelySales')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Likely sales (30d)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-2 text-right cursor-pointer hover:text-[#1B2420] "
                      onClick={() => toggleSort('daysLeft')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Days left</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-2 text-right cursor-pointer hover:text-[#1B2420] "
                      onClick={() => toggleSort('suggestedOrder')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Suggested order</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E1D8]/50 ">
                  {filteredItems.map((item) => {
                    const isSelected = item.id === selectedItemId;

                    const statusPill = {
                      Urgent: { bg: 'bg-[#FDE4DA]', text: 'text-[#C2410C]', dot: 'bg-[#C2410C]' },
                      'Order soon': { bg: 'bg-[#FDEFD3]', text: 'text-[#B45309]', dot: 'bg-[#B45309]' },
                      'Too much stock': { bg: 'bg-[#E6E4FB]', text: 'text-[#4338CA]', dot: 'bg-[#4338CA]' },
                      Good: { bg: 'bg-[#DFF3E6]', text: 'text-[#15803D]', dot: 'bg-[#15803D]' },
                      Ordered: { bg: 'bg-[#DDF1EE]', text: 'text-[#0F766E]', dot: 'bg-[#0F766E]' },
                    }[item.status];

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#DDF1EE]/40  font-semibold'
                            : 'hover:bg-[#F6F4EF]/60 '
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.imageEmoji}</span>
                            <div>
                              <div className="font-bold text-[#1B2420] ">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-[#66726C] ">
                                Rs {item.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-[#1B2420] ">
                          {item.inStock}
                        </td>
                        <td className="py-3 px-2 text-right text-[#0F766E] font-extrabold">
                          {item.likelySales}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={`font-bold ${
                              item.daysLeft <= 7
                                ? 'text-[#C2410C]'
                                : item.daysLeft <= 14
                                ? 'text-[#B45309]'
                                : 'text-[#1B2420] '
                            }`}
                          >
                            {item.daysLeft} d
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-[#1B2420] ">
                          {item.suggestedOrder > 0 ? `${item.suggestedOrder} pcs` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusPill.bg} ${statusPill.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dot}`}></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickOrder(item);
                            }}
                            className="min-h-[44px] px-3 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-[11px] cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                          >
                            Order Now
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

        {/* Right Column (4-5 cols): Selected Item Details Panel */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            {/* Header: Item Identity */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]/60 ">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-xl bg-[#F6F4EF] ">
                  {selectedItem.imageEmoji}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1B2420]  leading-tight">
                    {selectedItem.name}
                  </h3>
                  <p className="text-xs text-[#66726C] ">
                    {selectedItem.category} • Rs {selectedItem.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Big Numbers Card */}
            <div className="grid grid-cols-3 gap-2 mt-4 bg-[#F6F4EF]  p-3 rounded-[14px] text-center border border-[#E4E1D8]/60 ">
              <div>
                <span className="text-[11px] text-[#66726C]  font-medium block">
                  In stock
                </span>
                <span className="text-xl font-extrabold text-[#1B2420] ">
                  {selectedItem.inStock}
                </span>
              </div>
              <div className="border-x border-[#E4E1D8] ">
                <span className="text-[11px] text-[#0F766E] font-medium block">
                  Likely sales
                </span>
                <span className="text-xl font-extrabold text-[#0F766E]">
                  {selectedItem.likelySales}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#B45309] font-medium block">
                  Suggested
                </span>
                <span className="text-xl font-extrabold text-[#B45309]">
                  {selectedItem.suggestedOrder}
                </span>
              </div>
            </div>

            {/* Plain Sentence Box (AI Forecast Text) */}
            <div className="mt-4 p-4 rounded-[14px] bg-[#E3F4F1]  text-sm text-[#0F766E] ">
              <div className="text-[11px] font-bold uppercase tracking-wide opacity-80 mb-1">
                Stock Advice
              </div>
              <p className="font-bold text-[14px] leading-snug">
                {loadingSentence ? 'Checking store data...' : aiSentence}
              </p>
            </div>

            {/* Big Line Chart for Selected Item */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#1B2420] ">
                  Past 6 Months & Next Month
                </span>
                <span className="text-[11px] text-[#66726C] ">
                  Solid = Past, Dotted = Projected
                </span>
              </div>

              <div className="relative bg-[#F6F4EF]/50  rounded-xl p-2 border border-[#E4E1D8]/60 ">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-40 overflow-visible"
                >
                  {/* Likely Range Band (Shaded area) */}
                  <polygon
                    points={bandPolygon}
                    fill="#0F766E"
                    opacity="0.12"
                  />

                  {/* Past 6 Months Solid Line */}
                  <path
                    d={solidPath}
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Next Month Dotted Line */}
                  <path
                    d={dottedPath}
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />

                  {/* Points for Historical */}
                  {histPoints.map((val, i) => (
                    <circle
                      key={`hist-${i}`}
                      cx={xCoords[i]}
                      cy={yHist[i]}
                      r={hoveredPointIndex === i ? 6 : 4}
                      fill="#0F766E"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  ))}

                  {/* Future Point (Nov) */}
                  <circle
                    cx={xCoords[6]}
                    cy={yNext}
                    r={hoveredPointIndex === 6 ? 6 : 4.5}
                    fill="#D97706"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(6)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />

                  {/* X Labels */}
                  {monthLabels.map((lbl, i) => (
                    <text
                      key={lbl}
                      x={xCoords[i]}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="text-[10px] fill-[#66726C]  font-medium"
                    >
                      {lbl}
                    </text>
                  ))}
                </svg>

                {/* Tooltip on Point */}
                {hoveredPointIndex !== null && (
                  <div className="text-center text-xs font-bold text-[#0F766E] mt-1">
                    {monthLabels[hoveredPointIndex]}:{' '}
                    {hoveredPointIndex === 6
                      ? `${nextPoint} units (likely range: ${bandMin}-${bandMax})`
                      : `${histPoints[hoveredPointIndex]} units sold`}
                  </div>
                )}
              </div>
            </div>

            {/* "What we looked at" with 4 rows */}
            <div className="mt-5 space-y-2 text-xs">
              <span className="font-bold text-[#1B2420]  block mb-1">
                What we looked at
              </span>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F4EF] ">
                <span className="text-[#66726C] ">Past sales</span>
                <span className="font-bold text-[#1B2420] ">
                  {selectedItem.historySales[5]} units sold in Oct
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F4EF] ">
                <span className="text-[#66726C] ">Season</span>
                <span className="font-bold text-[#0F766E]">
                  {plan === 'diwali'
                    ? '+85% festive surge for Diwali'
                    : plan === 'sale'
                    ? '+45% big sale discount volume'
                    : 'Normal retail pattern'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F4EF] ">
                <span className="text-[#66726C] ">Growth</span>
                <span className="font-bold text-[#15803D]">
                  +12% steady retail increase in Connaught Place
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F4EF] ">
                <span className="text-[#66726C] ">Supplier lead time</span>
                <span className="font-bold text-[#1B2420] ">
                  {selectedItem.supplierDeliveryDays} days ({selectedItem.supplierName})
                </span>
              </div>
            </div>
          </div>

          {/* Action Order Button */}
          <button
            onClick={() => onQuickOrder(selectedItem)}
            className="mt-4 min-h-[44px] w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order {selectedItem.suggestedOrder > 0 ? `${selectedItem.suggestedOrder} pcs` : 'Stock'} for {selectedItem.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
