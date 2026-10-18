import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Receipt,
  Users,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  ChevronDown,
  Plus,
  Download,
  X,
  Send,
  Mic,
  Paperclip,
  Maximize2,
  ChevronRight,
  Star,
  Check,
  RefreshCw,
  FileSpreadsheet,
  PieChart,
  BarChart2,
  LineChart as LineChartIcon,
  Truck,
  IndianRupee,
  Clock,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    currentBusiness,
    currentLocation,
    products,
    customers,
    sales,
    setActiveView,
    addToCart,
  } = useApp();

  // Period state
  const [period, setPeriod] = useState<'30days' | '7days' | 'today'>('30days');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [dateRangeNotice, setDateRangeNotice] = useState<string | null>(null);

  // Add Widget Drawer state
  const [widgetDrawerOpen, setWidgetDrawerOpen] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'sales-payment',
    'stock-health',
    'daily-summary',
  ]);

  // Three-dots menu states per card
  const [openCardMenu, setOpenCardMenu] = useState<string | null>(null);
  const [hiddenCards, setHiddenCards] = useState<Record<string, boolean>>({});

  // Line chart interactive hover state
  const [lineHoverIndex, setLineHoverIndex] = useState<number | null>(4);

  // Bar chart (Most active day) hover state (Saturday is best day and default)
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(6);

  // Repeat customer gauge details modal
  const [repeatDetailsModalOpen, setRepeatDetailsModalOpen] = useState(false);

  // AI Helper interactive chat state
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: 'Namaste! Ask me anything about today’s sales, stock levels or customer dues.',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);

  // Existing Data preservation
  const lowStockItems = products.filter(
    (p) => (p.stockOnHand[currentLocation.id] || 0) <= p.reorderPoint
  );

  // Metrics based on period
  const periodMetrics = {
    today: {
      sales: 'Rs 48,650',
      salesDelta: '+29%',
      salesUp: true,
      bills: '68',
      billsDelta: '+12%',
      billsUp: true,
      customers: '1,284',
      customersDelta: '+8.4%',
      customersUp: true,
      lowStock: `${lowStockItems.length || 6}`,
      lowStockDelta: '+2 items',
      lowStockUp: true, // red because low stock increase is bad
      profit: 'Rs 18,420',
      profitDelta: '+16.2%',
      dateLabel: '17 Oct 2026',
    },
    '7days': {
      sales: 'Rs 3,18,400',
      salesDelta: '+22%',
      salesUp: true,
      bills: '442',
      billsDelta: '+15%',
      billsUp: true,
      customers: '1,284',
      customersDelta: '+9.1%',
      customersUp: true,
      lowStock: `${lowStockItems.length || 6}`,
      lowStockDelta: '+1 item',
      lowStockUp: true,
      profit: 'Rs 94,600',
      profitDelta: '+14.5%',
      dateLabel: '10 Oct - 17 Oct 2026',
    },
    '30days': {
      sales: 'Rs 12,85,600',
      salesDelta: '+31%',
      salesUp: true,
      bills: '1,820',
      billsDelta: '+18%',
      billsUp: true,
      customers: '1,284',
      customersDelta: '+8.4%',
      customersUp: true,
      lowStock: `${lowStockItems.length || 6}`,
      lowStockDelta: '+2 items',
      lowStockUp: true,
      profit: 'Rs 1,42,800',
      profitDelta: '+14.8%',
      dateLabel: '17 Sep - 17 Oct 2026',
    },
  }[period];

  // Total Profit Chart Points (Dates & Values in thousands)
  const profitChartData = [
    { date: '01 Oct', thisMonth: 14, lastMonth: 10 },
    { date: '05 Oct', thisMonth: 22, lastMonth: 16 },
    { date: '10 Oct', thisMonth: 18, lastMonth: 20 },
    { date: '15 Oct', thisMonth: 38, lastMonth: 25 },
    { date: '20 Oct', thisMonth: 48, lastMonth: 32 },
    { date: '25 Oct', thisMonth: 42, lastMonth: 36 },
    { date: '30 Oct', thisMonth: 56, lastMonth: 40 },
  ];

  // Most Active Day Bar Chart Data (Sun to Sat)
  const activeDayData = [
    { day: 'Sun', orders: 34 },
    { day: 'Mon', orders: 42 },
    { day: 'Tue', orders: 38 },
    { day: 'Wed', orders: 46 },
    { day: 'Thu', orders: 52 },
    { day: 'Fri', orders: 68 },
    { day: 'Sat', orders: 84, isBest: true }, // Best day is blue by default
  ];

  // Best Selling Items (5 rows from store catalog)
  const bestSellingProducts = [
    {
      id: '#ATT-10K',
      name: 'Aashirvaad Shudh Chakki Atta 10kg',
      image: '🌾',
      sold: 28,
      amount: 'Rs 12,880',
      amountChange: '+8.4%',
      isPositive: true,
      rating: 4.8,
    },
    {
      id: '#BUT-500',
      name: 'Amul Butter 500g Pasteurised',
      image: '🧈',
      sold: 44,
      amount: 'Rs 12,100',
      amountChange: '+12.1%',
      isPositive: true,
      rating: 4.9,
    },
    {
      id: '#OIL-1L',
      name: 'Fortune Sunlite Sunflower Oil 1L',
      image: '🌻',
      sold: 22,
      amount: 'Rs 3,630',
      amountChange: '-2.4%',
      isPositive: false,
      rating: 4.7,
    },
    {
      id: '#SLT-1KG',
      name: 'Tata Salt Vaccum Evaporated 1kg',
      image: '🧂',
      sold: 56,
      amount: 'Rs 1,568',
      amountChange: '+5.0%',
      isPositive: true,
      rating: 4.6,
    },
    {
      id: '#ANC-01',
      name: 'SonicPro Wireless Headphones',
      image: '🎧',
      sold: 14,
      amount: 'Rs 48,986',
      amountChange: '+18.2%',
      isPositive: true,
      rating: 4.9,
    },
  ];

  // Widgets available in Add Widget drawer
  const availableWidgets = [
    {
      id: 'sales-payment',
      title: 'Sales by Payment Type',
      desc: 'UPI, Cash, Card, and Store Credit splits',
      tag: '#Money',
      icon: PieChart,
      type: 'donut',
    },
    {
      id: 'stock-health',
      title: 'Stock Health',
      desc: 'Live good, reorder, and critical inventory counts',
      tag: '#Stock',
      icon: BarChart2,
      type: 'bars',
    },
    {
      id: 'best-slow-sellers',
      title: 'Best and Slow Sellers',
      desc: 'Top revenue items and dead stock alerts',
      tag: '#Items',
      icon: LineChartIcon,
      type: 'line',
    },
    {
      id: 'customer-dues',
      title: 'Customers Who Owe Money',
      desc: 'Outstanding balance and WhatsApp reminders',
      tag: '#Money',
      icon: IndianRupee,
      type: 'bars',
    },
    {
      id: 'supplier-delivery',
      title: 'Supplier Delivery',
      desc: 'Vendor lead times and on-time ratings',
      tag: '#Buying',
      icon: Truck,
      type: 'line',
    },
    {
      id: 'daily-summary',
      title: 'Daily Summary',
      desc: 'Key takeaways and today’s cash closing',
      tag: '#Overview',
      icon: Clock,
      type: 'donut',
    },
  ];

  // Close menus on outside click
  useEffect(() => {
    const handleClose = () => {
      setOpenCardMenu(null);
      setPeriodDropdownOpen(false);
    };
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  // Handle AI Helper send
  const handleSendAi = async (textToSend?: string) => {
    const query = textToSend || aiInput;
    if (!query.trim() || isAiLoading) return;

    setAiMessages((prev) => [...prev, { sender: 'user', text: query.trim() }]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/helper/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      if (!res.ok) throw new Error('AI response error');
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer || 'Store records checked. Everything is in order.',
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Something went wrong. Try again.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Toggle voice recognition
  const toggleVoice = () => {
    if (isMicListening) {
      setIsMicListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please type.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.onstart = () => setIsMicListening(true);
      recognition.onend = () => setIsMicListening(false);
      recognition.onerror = () => setIsMicListening(false);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setAiInput(transcript);
        handleSendAi(transcript);
      };
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // Export CSV handler
  const handleExportData = () => {
    const headers = ['Metric', 'Current Value', 'Change vs Last Period'];
    const rows = [
      ['Total Sales', periodMetrics.sales, periodMetrics.salesDelta],
      ['Total Bills', periodMetrics.bills, periodMetrics.billsDelta],
      ['Total Customers', periodMetrics.customers, periodMetrics.customersDelta],
      ['Low Stock Items', periodMetrics.lowStock, periodMetrics.lowStockDelta],
      ['Total Profit', periodMetrics.profit, periodMetrics.profitDelta],
    ];
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `DukaanIQ_Dashboard_${period}_17Oct2026.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDateRangeNotice('Exported dashboard report (CSV).');
    setTimeout(() => setDateRangeNotice(null), 3000);
  };

  // SVG Line Chart coordinates
  const svgW = 600;
  const svgH = 220;
  const padX = 40;
  const padY = 25;
  const chartW = svgW - padX * 2;
  const chartH = svgH - padY * 2;
  const maxProfit = 60; // 60k max Y axis

  const pointsThisMonth = profitChartData.map((d, i) => {
    const x = padX + (i / (profitChartData.length - 1)) * chartW;
    const y = svgH - padY - (d.thisMonth / maxProfit) * chartH;
    return { ...d, x, y };
  });

  const pointsLastMonth = profitChartData.map((d, i) => {
    const x = padX + (i / (profitChartData.length - 1)) * chartW;
    const y = svgH - padY - (d.lastMonth / maxProfit) * chartH;
    return { ...d, x, y };
  });

  const linePathThisMonth = pointsThisMonth.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    ''
  );
  const areaPathThisMonth = `${linePathThisMonth} L ${padX + chartW} ${svgH - padY} L ${padX} ${svgH - padY} Z`;

  const linePathLastMonth = pointsLastMonth.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    ''
  );

  return (
    <div className="min-h-screen bg-[#F3F5F9]  text-[#101828]  font-sans antialiased p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notice */}
      {dateRangeNotice && (
        <div className="bg-[#E6F6EC] border border-[#12A150]/30 rounded-[12px] p-3 text-xs font-semibold text-[#12A150] flex items-center justify-between shadow-xs">
          <span>{dateRangeNotice}</span>
          <button onClick={() => setDateRangeNotice(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#101828]  leading-tight">
            Dashboard
          </h1>
          <p className="text-[12px] text-[#667085]  mt-0.5">
            Store performance and daily activities for {currentLocation.name.split('(')[0]}
          </p>
        </div>

        {/* Right side controls: Date range, period dropdown, Add widget, Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date range button (Secondary, 40px height) */}
          <button
            onClick={() => {
              setDateRangeNotice(`Selected period: ${periodMetrics.dateLabel}`);
            }}
            className="h-[40px] px-3.5 bg-white  border border-[#E4E7EC]  hover:bg-[#F9FAFB] hover:border-[#D0D5DD] active:bg-[#F2F4F7] text-[#101828]  text-[13px] font-medium rounded-[10px] flex items-center gap-2 cursor-pointer shadow-xs transition-colors focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
          >
            <Calendar className="w-4 h-4 text-[#667085] " />
            <span className="tabular-nums">{periodMetrics.dateLabel}</span>
          </button>

          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPeriodDropdownOpen(!periodDropdownOpen);
              }}
              className="h-[40px] px-3 bg-white  border border-[#E4E7EC]  hover:bg-[#F9FAFB] hover:border-[#D0D5DD] active:bg-[#F2F4F7] text-[#101828]  text-[13px] font-medium rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
            >
              <span>
                {period === '30days'
                  ? 'Last 30 days'
                  : period === '7days'
                  ? 'Last 7 days'
                  : 'Today'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white  border border-[#E8EBF2]  rounded-[10px] shadow-lg p-1 z-40 space-y-0.5 text-[13px]">
                <button
                  onClick={() => {
                    setPeriod('today');
                    setPeriodDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[8px] cursor-pointer transition-colors ${
                    period === 'today'
                      ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold'
                      : 'hover:bg-[#F2F4F7]  text-[#101828] '
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setPeriod('7days');
                    setPeriodDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[8px] cursor-pointer transition-colors ${
                    period === '7days'
                      ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold'
                      : 'hover:bg-[#F2F4F7]  text-[#101828] '
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    setPeriod('30days');
                    setPeriodDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[8px] cursor-pointer transition-colors ${
                    period === '30days'
                      ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold'
                      : 'hover:bg-[#F2F4F7]  text-[#101828] '
                  }`}
                >
                  Last 30 days
                </button>
              </div>
            )}
          </div>

          {/* Add widget (Secondary, 40px height) */}
          <button
            onClick={() => setWidgetDrawerOpen(true)}
            className="h-[40px] px-3.5 bg-white  border border-[#E4E7EC]  hover:bg-[#F9FAFB] hover:border-[#D0D5DD] active:bg-[#F2F4F7] text-[#101828]  text-[13px] font-medium rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
          >
            <Plus className="w-4 h-4 text-[#667085] " />
            <span>Add widget</span>
          </button>

          {/* Export (Primary Blue, 40px height, 10px rounded) */}
          <button
            onClick={handleExportData}
            className="h-[40px] px-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.98] text-white text-[13px] font-medium rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ROW 1: FOUR KPI CARDS (white, equal width, 24px gap, 20px padding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Sales */}
        <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#667085] ">
              Total Sales
            </span>
            <div className="w-9 h-9 rounded-[10px] bg-[#E8F0FE]  flex items-center justify-center text-[#2563EB] ">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] font-semibold text-[#101828]  tabular-nums tracking-tight">
              {periodMetrics.sales}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F6EC] text-[#12A150]"
                title="Compared to the last period"
              >
                <ArrowUpRight className="w-3 h-3" />
                {periodMetrics.salesDelta}
              </span>
              <span className="text-[12px] text-[#667085] ">
                vs. last period
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Bills */}
        <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#667085] ">
              Total Bills
            </span>
            <div className="w-9 h-9 rounded-[10px] bg-[#E8F0FE]  flex items-center justify-center text-[#2563EB] ">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] font-semibold text-[#101828]  tabular-nums tracking-tight">
              {periodMetrics.bills}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F6EC] text-[#12A150]"
                title="Compared to the last period"
              >
                <ArrowUpRight className="w-3 h-3" />
                {periodMetrics.billsDelta}
              </span>
              <span className="text-[12px] text-[#667085] ">
                vs. last period
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Customers */}
        <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#667085] ">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-[10px] bg-[#E8F0FE]  flex items-center justify-center text-[#2563EB] ">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] font-semibold text-[#101828]  tabular-nums tracking-tight">
              {periodMetrics.customers}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F6EC] text-[#12A150]"
                title="Compared to the last period"
              >
                <ArrowUpRight className="w-3 h-3" />
                {periodMetrics.customersDelta}
              </span>
              <span className="text-[12px] text-[#667085] ">
                vs. last period
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Low Stock Items (Red color when it goes up!) */}
        <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#667085] ">
              Low Stock Items
            </span>
            <div className="w-9 h-9 rounded-[10px] bg-[#FDECEC]  flex items-center justify-center text-[#E5484D]">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] font-semibold text-[#101828]  tabular-nums tracking-tight">
              {periodMetrics.lowStock}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDECEC] text-[#E5484D]"
                title="Compared to the last period"
              >
                <ArrowUpRight className="w-3 h-3" />
                {periodMetrics.lowStockDelta}
              </span>
              <span className="text-[12px] text-[#667085] ">
                vs. last period
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: LEFT BIG CARD (Total Profit + 3 Customer cards), RIGHT TWO SMALL CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Big Card (8 cols): Total Profit */}
        <div className="lg:col-span-8 bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between space-y-6">
          <div>
            {/* Header: Title & 3-dots Menu */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-[#101828] ">
                  Total Profit
                </h3>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="text-[28px] font-semibold text-[#101828]  tabular-nums tracking-tight">
                    {periodMetrics.profit}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F6EC] text-[#12A150]">
                    <ArrowUpRight className="w-3 h-3" />
                    {periodMetrics.profitDelta}
                  </span>
                </div>
              </div>

              {/* Three dots menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCardMenu(openCardMenu === 'profit' ? null : 'profit');
                  }}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
                  title="Card options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openCardMenu === 'profit' && (
                  <div className="absolute right-0 mt-1 w-32 bg-white  border border-[#E8EBF2]  rounded-[10px] shadow-lg p-1 z-30 text-xs">
                    <button
                      onClick={handleExportData}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F2F4F7]  cursor-pointer"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setDateRangeNotice('Card hidden')}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F2F4F7]  cursor-pointer"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => setDateRangeNotice('Card order moved')}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F2F4F7]  cursor-pointer"
                    >
                      Move
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Smooth SVG Line Chart with Tooltip */}
            <div className="relative mt-4">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-56 sm:h-64 overflow-visible"
              >
                {/* Thin horizontal grid lines */}
                {[0, 20, 40, 60].map((val) => {
                  const y = svgH - padY - (val / maxProfit) * chartH;
                  return (
                    <g key={val}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={svgW - padX}
                        y2={y}
                        stroke="currentColor"
                        className="text-[#E8EBF2] "
                        strokeWidth="1"
                      />
                      <text
                        x={padX - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[10px] fill-[#98A2B3] font-sans"
                      >
                        {val}k
                      </text>
                    </g>
                  );
                })}

                {/* Soft Blue Fill Area under This Month Line */}
                <path
                  d={areaPathThisMonth}
                  fill="#E8F0FE"
                  className=""
                  opacity="0.6"
                />

                {/* Last Month Grey Dotted Line */}
                <path
                  d={linePathLastMonth}
                  fill="none"
                  stroke="#98A2B3"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {/* This Month Smooth Blue Line */}
                <path
                  d={linePathThisMonth}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Vertical Dotted Line on Hover */}
                {lineHoverIndex !== null && pointsThisMonth[lineHoverIndex] && (
                  <line
                    x1={pointsThisMonth[lineHoverIndex].x}
                    y1={padY}
                    x2={pointsThisMonth[lineHoverIndex].x}
                    y2={svgH - padY}
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="pointer-events-none"
                  />
                )}

                {/* Interactive Points on Line */}
                {pointsThisMonth.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={lineHoverIndex === idx ? 6 : 4}
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setLineHoverIndex(idx)}
                    />
                    {/* X-axis date labels */}
                    <text
                      x={p.x}
                      y={svgH - 6}
                      textAnchor="middle"
                      className="text-[11px] fill-[#667085]  font-medium"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip Card */}
              {lineHoverIndex !== null && pointsThisMonth[lineHoverIndex] && (
                <div
                  className="absolute bg-white  border border-[#E8EBF2]  rounded-[10px] p-2.5 shadow-lg text-[12px] pointer-events-none transition-all z-20"
                  style={{
                    left: `${(pointsThisMonth[lineHoverIndex].x / svgW) * 100}%`,
                    top: '12%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold text-[#101828]  mb-1">
                    {pointsThisMonth[lineHoverIndex].date}
                  </div>
                  <div className="flex items-center gap-2 text-[#2563EB] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span>This month: Rs {pointsThisMonth[lineHoverIndex].thisMonth * 1000}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#667085]  mt-0.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#98A2B3]" />
                    <span>Last month: Rs {pointsLastMonth[lineHoverIndex].lastMonth * 1000}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-[#E8EBF2]  text-[12px]">
              <div className="flex items-center gap-2 text-[#101828]  font-medium">
                <span className="w-3 h-1 bg-[#2563EB] rounded-full" />
                <span>This month</span>
              </div>
              <div className="flex items-center gap-2 text-[#667085]  font-medium">
                <span className="w-3 h-1 bg-[#98A2B3] rounded-full border border-dashed border-[#98A2B3]" />
                <span>Last month</span>
              </div>
            </div>
          </div>

          {/* Under It: Three Small Customer Cards with Thick Coloured Bottom Lines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8EBF2] ">
            {/* Customer Card 1: Blue #2563EB line */}
            <div className="relative bg-[#F9FAFB]  rounded-[12px] p-3.5 border border-[#E8EBF2]  hover:bg-white  transition-all duration-150 group overflow-hidden">
              <span className="text-[11px] font-semibold text-[#667085]  uppercase tracking-wide block">
                Frequent Regulars
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[18px] font-semibold text-[#101828]  tabular-nums">
                  42 buyers
                </span>
                <span className="text-[11px] text-[#2563EB] font-bold">
                  Rs 18,200 avg
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#667085] ">
                Daily tea, snacks & essentials
              </div>
              {/* Coloured Bottom Line (thickens on hover) */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] group-hover:h-[6px] bg-[#2563EB] transition-all duration-150" />
            </div>

            {/* Customer Card 2: Green #12A150 line */}
            <div className="relative bg-[#F9FAFB]  rounded-[12px] p-3.5 border border-[#E8EBF2]  hover:bg-white  transition-all duration-150 group overflow-hidden">
              <span className="text-[11px] font-semibold text-[#667085]  uppercase tracking-wide block">
                High Spenders
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[18px] font-semibold text-[#101828]  tabular-nums">
                  18 accounts
                </span>
                <span className="text-[11px] text-[#12A150] font-bold">
                  Rs 46,500 avg
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#667085] ">
                Wholesale cartons & bulk atta
              </div>
              {/* Coloured Bottom Line (thickens on hover) */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] group-hover:h-[6px] bg-[#12A150] transition-all duration-150" />
            </div>

            {/* Customer Card 3: Orange #F97316 line */}
            <div className="relative bg-[#F9FAFB]  rounded-[12px] p-3.5 border border-[#E8EBF2]  hover:bg-white  transition-all duration-150 group overflow-hidden">
              <span className="text-[11px] font-semibold text-[#667085]  uppercase tracking-wide block">
                Credit Due Accounts
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[18px] font-semibold text-[#101828]  tabular-nums">
                  4 accounts
                </span>
                <span className="text-[11px] text-[#F97316] font-bold">
                  Rs 18,450 due
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#667085] ">
                Pending follow-up balance
              </div>
              {/* Coloured Bottom Line (thickens on hover) */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] group-hover:h-[6px] bg-[#F97316] transition-all duration-150" />
            </div>
          </div>
        </div>

        {/* Right Two Small Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Right Top: Most Active Day Bar Chart */}
          <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-[#101828] ">
                  Most Active Day
                </h3>
                <p className="text-[12px] text-[#667085]  mt-0.5">
                  Peak customer billing orders
                </p>
              </div>

              {/* Three dots menu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCardMenu(openCardMenu === 'active-day' ? null : 'active-day');
                }}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Bar Chart Sunday to Saturday */}
            <div className="mt-6 flex items-end justify-between gap-2 h-36 pt-4">
              {activeDayData.map((d, idx) => {
                const maxOrders = 90;
                const heightPercent = (d.orders / maxOrders) * 100;
                const isHovered = hoveredBarIndex === idx;
                const isSelected = isHovered || (hoveredBarIndex === null && d.isBest);

                return (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(6)}
                    className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    {/* Number above bar when hovered or best */}
                    <span
                      className={`text-[11px] font-bold transition-opacity duration-150 tabular-nums ${
                        isSelected
                          ? 'opacity-100 text-[#2563EB] '
                          : 'opacity-0 text-[#667085]'
                      }`}
                    >
                      {d.orders}
                    </span>

                    {/* Bar */}
                    <div className="w-full bg-[#E8EBF2]  rounded-t-[6px] h-28 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-[6px] transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#2563EB]'
                            : 'bg-[#E8EBF2]  group-hover:bg-[#2563EB]'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[11px] transition-colors duration-150 font-medium ${
                        isSelected
                          ? 'text-[#2563EB] font-bold'
                          : 'text-[#667085] '
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Bottom: Repeat Customer Rate Gauge */}
          <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-[#101828] ">
                  Repeat Customer Rate
                </h3>
                <p className="text-[12px] text-[#667085]  mt-0.5">
                  Customers who bought again this month
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCardMenu(openCardMenu === 'gauge' ? null : 'gauge');
                }}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Half circle gauge made of thin tick lines */}
            <div className="relative flex flex-col items-center justify-center my-2">
              <svg width="200" height="110" viewBox="0 0 200 110" className="overflow-visible">
                {/* 24 radial thin tick lines along semi-circle */}
                {Array.from({ length: 25 }).map((_, i) => {
                  const angle = Math.PI - (i / 24) * Math.PI; // 180 to 0 degrees
                  const rInner = 68;
                  const rOuter = 82;
                  const cx = 100;
                  const cy = 95;

                  const x1 = cx + rInner * Math.cos(angle);
                  const y1 = cy - rInner * Math.sin(angle);
                  const x2 = cx + rOuter * Math.cos(angle);
                  const y2 = cy - rOuter * Math.sin(angle);

                  // 68% repeat rate corresponds to ~16.3 ticks out of 24
                  const isFilled = i <= Math.round(24 * 0.68);
                  const isTarget = i === Math.round(24 * 0.75);

                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isTarget ? '#F97316' : isFilled ? '#12A150' : '#E8EBF2'}
                        className={!isFilled && !isTarget ? '' : ''}
                        strokeWidth={isTarget ? 3 : 2.5}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Exact number in center */}
              <div className="absolute bottom-2 flex flex-col items-center text-center">
                <span className="text-[28px] font-semibold text-[#101828]  tabular-nums tracking-tight">
                  68%
                </span>
                <span className="text-[11px] text-[#667085] ">
                  Target: 75%
                </span>
              </div>
            </div>

            {/* Secondary Button: Show details */}
            <button
              onClick={() => setRepeatDetailsModalOpen(true)}
              className="mt-2 w-full h-[36px] bg-white  border border-[#E4E7EC]  hover:bg-[#F9FAFB] hover:border-[#D0D5DD] active:bg-[#F2F4F7] text-[#101828]  text-[12px] font-medium rounded-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
            >
              <span>Show details</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: LEFT BIG CARD (Best Selling Items table), RIGHT SMALL CARD (AI Helper) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Big Card (8 cols): Best Selling Items Table */}
        <div className="lg:col-span-8 bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EBF2] ">
              <div>
                <h3 className="text-[14px] font-semibold text-[#101828] ">
                  Best Selling Items
                </h3>
                <p className="text-[12px] text-[#667085]  mt-0.5">
                  Top performing items ranked by volume & revenue
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCardMenu(openCardMenu === 'table' ? null : 'table');
                }}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#E8EBF2]  text-[11px] font-medium text-[#667085]  uppercase">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3 text-right">Sold</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Rating</th>
                    <th className="py-2.5 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EBF2]/60 ">
                  {bestSellingProducts.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setActiveView('inventory')}
                      className="hover:bg-[#F9FAFB]  transition-colors duration-150 cursor-pointer group"
                    >
                      <td className="py-3 px-3 text-[12px] font-mono text-[#98A2B3]">
                        {p.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{p.image}</span>
                          <span
                            className="font-medium text-[#101828]  truncate max-w-[220px] sm:max-w-[280px] group-hover:text-[#2563EB] transition-colors"
                            title={p.name}
                          >
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[#101828]  tabular-nums">
                        {p.sold}
                      </td>
                      <td className="py-3 px-3 text-right font-medium tabular-nums">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.isPositive ? 'bg-[#12A150]' : 'bg-[#E5484D]'
                            }`}
                          />
                          <span className="text-[#101828]  font-semibold">
                            {p.amount}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#101828] ">
                          <Star className="w-3.5 h-3.5 fill-[#F5B301] text-[#F5B301]" />
                          <span>{p.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <ChevronRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Small Card (4 cols): AI Helper */}
        <div className="lg:col-span-4 bg-white  border border-[#E8EBF2]  rounded-[16px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between space-y-4">
          {/* Header with Title & Expand Icon */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EBF2] ">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-[#101828] ">
                AI Helper
              </h3>
            </div>
            <button
              onClick={() => setActiveView('copilot')}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#667085] hover:text-[#2563EB] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
              title="Open full AI Helper"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Glowing Blue 3D Ball in the Middle */}
          <div className="flex flex-col items-center justify-center my-auto py-2 text-center">
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center">
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full bg-[#2563EB]/25 blur-xl animate-pulse" />
              {/* 3D Radial Sphere */}
              <div
                className="w-20 h-20 rounded-full shadow-lg relative flex items-center justify-center transition-transform hover:scale-105 duration-200"
                style={{
                  background: 'radial-gradient(circle at 32% 32%, #93B4FA 0%, #2563EB 55%, #0B1E5B 100%)',
                  boxShadow: '0 8px 24px -2px rgba(37,99,235,0.45), inset 0 2px 4px rgba(255,255,255,0.4)',
                }}
              >
                {/* Light highlight reflection on top left */}
                <div className="absolute top-2 left-3 w-5 h-3 rounded-full bg-white/40 blur-[1px] rotate-[-25deg]" />
              </div>
            </div>

            {/* AI Latest message or greeting */}
            <div className="mt-3 px-2">
              <p className="text-[13px] font-medium text-[#101828]  leading-snug">
                {isAiLoading
                  ? 'Checking store records...'
                  : aiMessages[aiMessages.length - 1]?.text}
              </p>
            </div>
          </div>

          {/* Bottom: Input Box with Paperclip, Mic, and Round Blue Send Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAi();
            }}
            className="pt-2 border-t border-[#E8EBF2]  flex items-center gap-1.5"
          >
            {/* Paperclip Button */}
            <button
              type="button"
              onClick={() =>
                setDateRangeNotice('Attaching today’s sales context to query...')
              }
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
              title="Attach context"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 h-9 px-3 text-[13px] bg-[#F2F4F7]  border border-transparent rounded-[10px] text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40 font-sans"
            />

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer ${
                isMicListening
                  ? 'bg-[#E5484D] text-white animate-pulse'
                  : 'text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] active:bg-[#E4E7EC] '
              }`}
              title="Voice speak"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Round Blue Send Button */}
            <button
              type="submit"
              disabled={!aiInput.trim() || isAiLoading}
              className="w-8 h-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-95 disabled:bg-slate-300  text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ADD WIDGET PANEL (420px Wide Side Drawer) */}
      {widgetDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with 40% dark grey opacity */}
          <div
            onClick={() => setWidgetDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-[420px] bg-white  border-l border-[#E8EBF2]  shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E8EBF2]  flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#101828] ">
                    Add Widget
                  </h2>
                  <p className="text-[12px] text-[#667085]  mt-0.5">
                    Customize your shop overview dashboard
                  </p>
                </div>
                <button
                  onClick={() => setWidgetDrawerOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC]  transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body: List of 6 Widget Cards */}
              <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
                {availableWidgets.map((w) => {
                  const Icon = w.icon;
                  const isSelected = activeWidgets.includes(w.id);

                  return (
                    <div
                      key={w.id}
                      className="bg-[#F9FAFB]  border border-[#E8EBF2]  rounded-[14px] p-4 flex items-center justify-between gap-3 hover:shadow-md hover:bg-white  transition-all duration-150 group cursor-grab"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Small picture on left */}
                        <div className="w-10 h-10 rounded-[10px] bg-[#E8F0FE]  flex items-center justify-center text-[#2563EB] group-hover:scale-105 transition-transform shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Title, description, hashtag tag */}
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-semibold text-[#101828]  leading-tight">
                            {w.title}
                          </h4>
                          <p className="text-[11px] text-[#667085]  mt-0.5 truncate">
                            {w.desc}
                          </p>
                          <div className="mt-1.5">
                            {/* Pill tag: 11px text, grey border, 6px rounded, hover soft blue */}
                            <span className="inline-block text-[11px] px-2 py-0.5 rounded-[6px] border border-[#E4E7EC]  text-[#667085] hover:bg-[#E8F0FE] hover:text-[#2563EB] transition-colors font-medium">
                              {w.tag}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Blue Button: Select */}
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setActiveWidgets(activeWidgets.filter((id) => id !== w.id));
                            setDateRangeNotice(`Removed ${w.title} from dashboard.`);
                          } else {
                            setActiveWidgets([...activeWidgets, w.id]);
                            setDateRangeNotice(`Added ${w.title} to dashboard!`);
                          }
                        }}
                        className={`h-[36px] px-4 rounded-[10px] text-[12px] font-medium transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-[#E6F6EC] text-[#12A150] border border-[#12A150]/30'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.98] text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? 'Added' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#E8EBF2]  flex justify-end">
                <button
                  onClick={() => setWidgetDrawerOpen(false)}
                  className="h-[40px] px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium rounded-[10px] cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPEAT CUSTOMER DETAILS MODAL */}
      {repeatDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white  border border-[#E8EBF2]  rounded-[16px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EBF2] ">
              <h3 className="text-[16px] font-semibold text-[#101828] ">
                Repeat Customer Breakdown
              </h3>
              <button
                onClick={() => setRepeatDetailsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#F9FAFB] ">
                <span className="text-[#667085]">Current Loyalty Rate</span>
                <span className="font-semibold text-[#12A150]">68.4%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#F9FAFB] ">
                <span className="text-[#667085]">Quarterly Target</span>
                <span className="font-semibold text-[#101828] ">75.0%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#F9FAFB] ">
                <span className="text-[#667085]">Returning Buyers (30d)</span>
                <span className="font-semibold text-[#101828] ">286 customers</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-[10px] bg-[#F9FAFB] ">
                <span className="text-[#667085]">First-time Buyers</span>
                <span className="font-semibold text-[#101828] ">132 customers</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setRepeatDetailsModalOpen(false)}
                className="h-[36px] px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[8px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
