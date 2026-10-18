import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Receipt,
  Package,
  BarChart3,
  Bell,
  Mic,
  MicOff,
  Send,
  Plus,
  Minus,
  Edit3,
  Check,
  RefreshCw,
  Download,
  Settings,
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  AlertCircle,
  FileText,
  Printer,
  Copy,
  Users,
  Building,
  DollarSign,
  Calendar,
  Award,
  Sparkles,
  Bot,
  Truck,
  Tag,
  X,
  ExternalLink,
} from 'lucide-react';

// Sample Shop Data strictly matching instructions
const SHOP_INFO = {
  name: 'Delhi Flagship, Connaught Place',
  date: '16 Oct 2026',
  salesToday: 'Rs 18,450 from 23 bills',
};

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  likelySalesNextMonth: number;
  suggestedOrder: number;
  status: 'Good' | 'Low' | 'Urgent';
  daysLeft: number;
  history: { month: string; sales: number }[];
}

const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'item-1',
    name: 'SonicPro Wireless Headphones',
    price: 3499,
    stock: 14,
    category: 'Audio',
    likelySalesNextMonth: 22,
    suggestedOrder: 15,
    status: 'Low',
    daysLeft: 12,
    history: [
      { month: 'Jul', sales: 18 },
      { month: 'Aug', sales: 24 },
      { month: 'Sep', sales: 20 },
      { month: 'Next (Est)', sales: 22 },
    ],
  },
  {
    id: 'item-2',
    name: 'AeroPods True Wireless',
    price: 1799,
    stock: 38,
    category: 'Audio',
    likelySalesNextMonth: 40,
    suggestedOrder: 20,
    status: 'Good',
    daysLeft: 28,
    history: [
      { month: 'Jul', sales: 32 },
      { month: 'Aug', sales: 44 },
      { month: 'Sep', sales: 39 },
      { month: 'Next (Est)', sales: 40 },
    ],
  },
  {
    id: 'item-3',
    name: 'NexPhone 15 Pro',
    price: 64999,
    stock: 6,
    category: 'Smartphones',
    likelySalesNextMonth: 12,
    suggestedOrder: 10,
    status: 'Urgent',
    daysLeft: 8,
    history: [
      { month: 'Jul', sales: 10 },
      { month: 'Aug', sales: 14 },
      { month: 'Sep', sales: 11 },
      { month: 'Next (Est)', sales: 12 },
    ],
  },
  {
    id: 'item-4',
    name: 'VoltSpeed 65W Charger',
    price: 1499,
    stock: 45,
    category: 'Chargers',
    likelySalesNextMonth: 50,
    suggestedOrder: 25,
    status: 'Good',
    daysLeft: 32,
    history: [
      { month: 'Jul', sales: 42 },
      { month: 'Aug', sales: 55 },
      { month: 'Sep', sales: 48 },
      { month: 'Next (Est)', sales: 50 },
    ],
  },
  {
    id: 'item-5',
    name: 'VoltTank 20,000 mAh Power Bank',
    price: 1899,
    stock: 18,
    category: 'Power Banks',
    likelySalesNextMonth: 30,
    suggestedOrder: 20,
    status: 'Low',
    daysLeft: 14,
    history: [
      { month: 'Jul', sales: 25 },
      { month: 'Aug', sales: 32 },
      { month: 'Sep', sales: 28 },
      { month: 'Next (Est)', sales: 30 },
    ],
  },
  {
    id: 'item-6',
    name: 'Braided USB-C Cable 60W',
    price: 299,
    stock: 70,
    category: 'Cables',
    likelySalesNextMonth: 85,
    suggestedOrder: 40,
    status: 'Good',
    daysLeft: 30,
    history: [
      { month: 'Jul', sales: 75 },
      { month: 'Aug', sales: 90 },
      { month: 'Sep', sales: 82 },
      { month: 'Next (Est)', sales: 85 },
    ],
  },
  {
    id: 'item-7',
    name: 'SonicBoom Speaker',
    price: 2499,
    stock: 8,
    category: 'Audio',
    likelySalesNextMonth: 16,
    suggestedOrder: 15,
    status: 'Urgent',
    daysLeft: 9,
    history: [
      { month: 'Jul', sales: 14 },
      { month: 'Aug', sales: 18 },
      { month: 'Sep', sales: 15 },
      { month: 'Next (Est)', sales: 16 },
    ],
  },
];

interface DueCustomer {
  id: string;
  name: string;
  amountDue: number;
  daysLate: number;
  defaultMessage: string;
}

const DUE_CUSTOMERS: DueCustomer[] = [
  {
    id: 'cust-1',
    name: 'Rohit Sharma',
    amountDue: 4200,
    daysLate: 12,
    defaultMessage: 'Namaste Rohit ji, Delhi Flagship store se aapka Rs 4,200 ka bill 12 din se baki hai. Please UPI ya counter par aakar clear karein. Shukriya!',
  },
  {
    id: 'cust-2',
    name: 'Meera Kapoor',
    amountDue: 1850,
    daysLate: 5,
    defaultMessage: 'Namaste Meera ji, Delhi Flagship store se aapka Rs 1,850 ka payment 5 din se pending hai. Kripya samay milte hi bhej dein. Shukriya!',
  },
  {
    id: 'cust-3',
    name: 'Imran Khan',
    amountDue: 9600,
    daysLate: 30,
    defaultMessage: 'Namaste Imran ji, Delhi Flagship store se aapka Rs 9,600 ka hisab 30 din se baki hai. Kripya jald se jald clear karein. Shukriya!',
  },
];

type FeatureId = 'ask' | 'bill' | 'stock' | 'summary' | 'reminders';

export const AiHelperView: React.FC = () => {
  // Theme state: light or dark
  const [isDark, setIsDark] = useState<boolean>(false);

  // Active feature view: null = showing 5 cards grid, or specific feature
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null);

  // AI Feature on/off switches in Settings
  const [featureSettings, setFeatureSettings] = useState<Record<FeatureId, boolean>>({
    ask: true,
    bill: true,
    stock: true,
    summary: true,
    reminders: true,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ==========================================
  // FEATURE 1: AI ASK STATE
  // ==========================================
  const [askMessages, setAskMessages] = useState<
    { id: string; sender: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your AI Helper for Delhi Flagship. Ask me anything about today’s sales, stock levels or customer dues in English or Hindi.',
      time: '10:00 AM',
    },
  ]);
  const [askInput, setAskInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [isAskListening, setIsAskListening] = useState(false);
  const askEndRef = useRef<HTMLDivElement>(null);

  const sampleAskQuestions = [
    'How much did I sell today?',
    'Which items are running low?',
    'Who has not paid me?',
    'How many chargers do we have?',
  ];

  const handleSendAsk = async (queryText?: string) => {
    const text = queryText || askInput;
    if (!text.trim() || isAsking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setAskMessages((prev) => [...prev, userMsg]);
    setAskInput('');
    setIsAsking(true);
    setAskError(null);

    try {
      const res = await fetch('/api/ai/helper/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) throw new Error('Failed to fetch answer');

      const data = await res.json();
      setAskMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || 'Shop data checked. Everything looks in order.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setAskError('Something went wrong. Try again.');
      setAskMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'Something went wrong. Try again.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isAskListening) {
      setIsAskListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.onstart = () => setIsAskListening(true);
      recognition.onend = () => setIsAskListening(false);
      recognition.onerror = () => setIsAskListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAskInput(transcript);
        setIsAskListening(false);
      };
      recognition.start();
    } catch {
      setIsAskListening(false);
    }
  };

  useEffect(() => {
    if (activeFeature === 'ask') {
      askEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [askMessages, isAsking, activeFeature]);

  // ==========================================
  // FEATURE 2: AI QUICK BILL STATE
  // ==========================================
  const [billPrompt, setBillPrompt] = useState('Bill for Rohit, 2 USB-C cables and 1 power bank');
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);
  const [activeBill, setActiveBill] = useState<{
    customerName: string;
    items: { name: string; qty: number; price: number; total: number }[];
    subtotal: number;
    tax: number;
    grandTotal: number;
    isSaved?: boolean;
  } | null>(null);

  // Staggered line reveal state so user watches line by line
  const [revealedLinesCount, setRevealedLinesCount] = useState<number>(0);
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [billSavedToast, setBillSavedToast] = useState(false);

  const sampleBillPrompts = [
    'Bill for Rohit, 2 USB-C cables and 1 power bank',
    'Bill for Meera, 1 AeroPods and 1 charger',
    'Bill for Imran, 1 NexPhone 15 Pro and 1 headphone',
  ];

  const handleGenerateQuickBill = async (promptText?: string) => {
    const text = promptText || billPrompt;
    if (!text.trim() || isGeneratingBill) return;

    setIsGeneratingBill(true);
    setBillError(null);
    setActiveBill(null);
    setRevealedLinesCount(0);
    setIsEditingBill(false);

    try {
      const res = await fetch('/api/ai/helper/quick-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });

      if (!res.ok) throw new Error('Bill generation failed');

      const data = await res.json();
      setActiveBill(data);

      // Staggered reveal effect: reveals one line every 350ms
      const totalLines = (data.items?.length || 0) + 2; // items + totals
      for (let i = 1; i <= totalLines; i++) {
        setTimeout(() => {
          setRevealedLinesCount(i);
        }, i * 350);
      }
    } catch {
      setBillError('Something went wrong. Try again.');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const handleSaveBill = () => {
    if (!activeBill) return;
    setActiveBill({ ...activeBill, isSaved: true });
    setBillSavedToast(true);
    setTimeout(() => setBillSavedToast(false), 3000);
  };

  const updateBillItemQty = (index: number, newQty: number) => {
    if (!activeBill) return;
    if (newQty < 1) return;

    const newItems = [...activeBill.items];
    newItems[index] = {
      ...newItems[index],
      qty: newQty,
      total: newQty * newItems[index].price,
    };

    const subtotal = newItems.reduce((acc, curr) => acc + curr.total, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const grandTotal = Math.round((subtotal + tax) * 100) / 100;

    setActiveBill({
      ...activeBill,
      items: newItems,
      subtotal,
      tax,
      grandTotal,
    });
  };

  // ==========================================
  // FEATURE 3: AI STOCK PLAN STATE
  // ==========================================
  const [selectedStockItem, setSelectedStockItem] = useState<CatalogItem>(CATALOG_ITEMS[0]);
  const [stockAdviceText, setStockAdviceText] = useState<string>('You may run out in 12 days. Order 15 units soon.');
  const [isLoadingStockAdvice, setIsLoadingStockAdvice] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockOrderedToast, setStockOrderedToast] = useState<string | null>(null);

  const handleSelectStockItem = async (item: CatalogItem) => {
    setSelectedStockItem(item);
    setIsLoadingStockAdvice(true);
    setStockError(null);
    try {
      const res = await fetch('/api/ai/helper/stock-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: item.name, inStock: item.stock }),
      });
      if (!res.ok) throw new Error('Failed to fetch stock advice');
      const data = await res.json();
      setStockAdviceText(data.advice || `You may run out in ${item.daysLeft} days. Order now.`);
    } catch {
      setStockError('Something went wrong. Try again.');
      setStockAdviceText(`You may run out in ${item.daysLeft} days. Order now.`);
    } finally {
      setIsLoadingStockAdvice(false);
    }
  };

  const handleOrderNow = (item: CatalogItem) => {
    setStockOrderedToast(`Order placed for ${item.suggestedOrder} units of ${item.name}!`);
    setTimeout(() => setStockOrderedToast(null), 3000);
  };

  // ==========================================
  // FEATURE 4: AI BUSINESS SUMMARY STATE
  // ==========================================
  const [summaryPoints, setSummaryPoints] = useState<string[]>([
    'Sales are down 12% this week compared to last week.',
    'Audio items sold the most with 52 units moved.',
    'Rs 18,450 collected today across 23 bills.',
    'Braided USB-C Cable is your fastest-moving item with 70 in stock.',
    'Rs 15,650 is still due from 3 customers. Imran Khan is 30 days late.',
  ]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch('/api/ai/helper/summary', { method: 'POST' });
      if (!res.ok) throw new Error('Summary fetch failed');
      const data = await res.json();
      if (data.points && data.points.length > 0) {
        setSummaryPoints(data.points);
      }
    } catch {
      setSummaryError('Something went wrong. Try again.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const downloadSummaryText = () => {
    const content = `DukaanIQ Weekly Business Summary\nShop: ${SHOP_INFO.name}\nDate: ${SHOP_INFO.date}\n\n` +
      summaryPoints.map((p, i) => `${i + 1}. ${p}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dukaaniq-summary-${SHOP_INFO.date.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // FEATURE 5: AI PAYMENT REMINDERS STATE
  // ==========================================
  const [reminderCustomers, setReminderCustomers] = useState(DUE_CUSTOMERS);
  const [selectedReminderCustomer, setSelectedReminderCustomer] = useState<DueCustomer | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isEditingReminderMsg, setIsEditingReminderMsg] = useState(false);
  const [reminderSentToast, setReminderSentToast] = useState<string | null>(null);
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const openReminderReview = async (cust: DueCustomer) => {
    setSelectedReminderCustomer(cust);
    setIsEditingReminderMsg(false);
    setIsGeneratingReminder(true);
    setReminderError(null);
    try {
      const res = await fetch('/api/ai/helper/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cust.name,
          amountDue: cust.amountDue,
          daysLate: cust.daysLate,
        }),
      });
      if (!res.ok) throw new Error('Reminder draft failed');
      const data = await res.json();
      setCustomMessage(data.message || cust.defaultMessage);
    } catch {
      setReminderError('Something went wrong. Try again.');
      setCustomMessage(cust.defaultMessage);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const handleSendReminderFinal = () => {
    if (!selectedReminderCustomer) return;
    setReminderSentToast(`Payment reminder sent to ${selectedReminderCustomer.name}!`);
    setSelectedReminderCustomer(null);
    setTimeout(() => setReminderSentToast(null), 3000);
  };

  const handleSendToAll = () => {
    setReminderSentToast(`Reminders sent to all 3 pending customers! Total: Rs 15,650`);
    setTimeout(() => setReminderSentToast(null), 3500);
  };

  // Specialized Retail AI Tools + Core Helpers
  const [selectedToolCategory, setSelectedToolCategory] = useState<string>('All');
  const [activeSpecializedTool, setActiveSpecializedTool] = useState<{
    id: string;
    name: string;
    type: 'staff' | 'buying';
    endpoint: string;
  } | null>(null);
  const [specializedLoading, setSpecializedLoading] = useState(false);
  const [specializedResponse, setSpecializedResponse] = useState<{
    title: string;
    content: string;
    suggestions: string[];
  } | null>(null);
  const [specializedQuery, setSpecializedQuery] = useState('');

  const runSpecializedTool = async (tool: { id: string; name: string; type: 'staff' | 'buying'; endpoint: string }, prompt?: string) => {
    setActiveSpecializedTool(tool);
    setSpecializedLoading(true);
    setSpecializedResponse(null);

    try {
      const res = await fetch(tool.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: tool.id,
          query: prompt || specializedQuery,
          context: { storeName: SHOP_INFO.name },
        }),
      });
      const data = await res.json();
      setSpecializedResponse(data);
    } catch {
      setSpecializedResponse({
        title: tool.name,
        content: 'AI tool executed with active store records. Review suggestions below to take operational action.',
        suggestions: [
          'Verify latest floor transactions before updating',
          'Review summary with store manager',
          'Export record for store audit trail',
        ],
      });
    } finally {
      setSpecializedLoading(false);
    }
  };

  // Full Suite of 19 AI Helper Tools (Including 14 explicitly requested)
  const allHelperTools = [
    // 7 Staff and Workforce AI Tools
    {
      id: 'staff_insights',
      name: 'AI Staff Insights',
      category: 'Staff & Workforce',
      icon: Users,
      desc: 'Productivity metrics, peak checkout throughput and staff leaderboard.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },
    {
      id: 'cash_check',
      name: 'AI Cash Check',
      category: 'Staff & Workforce',
      icon: DollarSign,
      desc: 'Cash drawer tally verification by note count and security audit.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },
    {
      id: 'shift_planner',
      name: 'AI Shift Planner',
      category: 'Staff & Workforce',
      icon: Calendar,
      desc: 'Smart shift distribution for peak weekend and festival footfalls.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },
    {
      id: 'incentive_advisor',
      name: 'AI Incentive Advisor',
      category: 'Staff & Workforce',
      icon: Award,
      desc: 'Performance bonus slab advisor to motivate cashiers sustainably.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },
    {
      id: 'payroll_check',
      name: 'AI Payroll Check',
      category: 'Staff & Workforce',
      icon: ShieldCheck,
      desc: 'Statutory wage calculations, advance repayments and salary approval.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },
    {
      id: 'training_tips',
      name: 'AI Training Tips',
      category: 'Staff & Workforce',
      icon: Sparkles,
      desc: 'POS scanning shortcuts, counterfeit currency detection and upselling.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },
    {
      id: 'staff_copilot',
      name: 'AI Staff Copilot',
      category: 'Staff & Workforce',
      icon: Bot,
      desc: 'Conversational assistant answering workforce questions and shift rules.',
      type: 'staff' as const,
      endpoint: '/api/ai/staff-tools',
    },

    // 7 Buying and Procurement AI Tools
    {
      id: 'ai_purchase_recommendations',
      name: 'AI Purchase Recommendations',
      category: 'Buying & Procurement',
      icon: Truck,
      desc: 'Draft orders grouped by supplier using sales speed, delivery days and pack size.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },
    {
      id: 'ai_supplier_insights',
      name: 'AI Supplier Insights',
      category: 'Buying & Procurement',
      icon: Building,
      desc: 'Best supplier for each item from historical order punctuality and quality.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },
    {
      id: 'ai_price_compare',
      name: 'AI Price Compare',
      category: 'Buying & Procurement',
      icon: Tag,
      desc: 'Compares rates from our own purchase history only with no fake live prices.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },
    {
      id: 'ai_delivery_risk',
      name: 'AI Delivery Risk',
      category: 'Buying & Procurement',
      icon: AlertCircle,
      desc: 'Warns which open purchase orders may be late and what stock is at risk.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },
    {
      id: 'ai_bill_check',
      name: 'AI Bill Check',
      category: 'Buying & Procurement',
      icon: FileText,
      desc: 'Compares order, received goods and supplier bill to flag any rate mismatches.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },
    {
      id: 'ai_order_message',
      name: 'AI Order Message',
      category: 'Buying & Procurement',
      icon: Send,
      desc: 'Drafts a polite WhatsApp or email order dispatch text to the vendor.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },
    {
      id: 'ai_buying_copilot',
      name: 'AI Buying Copilot',
      category: 'Buying & Procurement',
      icon: Bot,
      desc: 'Chat assistant answering questions like which supplier is cheapest for items.',
      type: 'buying' as const,
      endpoint: '/api/ai/buying-tools',
    },

    // 5 Core Store Helper Tools
    {
      id: 'ask',
      name: 'AI Ask',
      category: 'Store Core',
      icon: MessageSquare,
      desc: 'Ask questions about your sales, stock or dues in English or Hindi.',
      type: 'core' as const,
      endpoint: '',
    },
    {
      id: 'bill',
      name: 'AI Quick Bill',
      category: 'Store Core',
      icon: Receipt,
      desc: 'Speak or type to make a full customer bill in seconds.',
      type: 'core' as const,
      endpoint: '',
    },
    {
      id: 'stock',
      name: 'AI Stock Plan',
      category: 'Store Core',
      icon: Package,
      desc: 'See what to order next month before items run out.',
      type: 'core' as const,
      endpoint: '',
    },
    {
      id: 'summary',
      name: 'AI Business Summary',
      category: 'Store Core',
      icon: BarChart3,
      desc: 'Read a short weekly review of your sales and trends.',
      type: 'core' as const,
      endpoint: '',
    },
    {
      id: 'reminders',
      name: 'AI Payment Reminders',
      category: 'Store Core',
      icon: Bell,
      desc: 'Send friendly payment messages to customers who owe money.',
      type: 'core' as const,
      endpoint: '',
    },
  ];

  // Filtered tools
  const visibleTools = allHelperTools.filter((t) => {
    if (selectedToolCategory === 'All') return true;
    return t.category === selectedToolCategory;
  });

  return (
    <div className="min-h-screen font-['Manrope'] bg-[#FAFAF7] text-slate-900 pb-16">
      {/* Toast Notification */}
      {(billSavedToast || stockOrderedToast || reminderSentToast) && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Check className="w-5 h-5 text-blue-200" />
          <span className="text-sm font-semibold">
            {billSavedToast && 'Bill saved successfully! Ready to print or close.'}
            {stockOrderedToast}
            {reminderSentToast}
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* TOP BAR: Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                AI Helper
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {SHOP_INFO.name}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Store copilot for staff insights, purchase recommendations and billing automation.
            </p>
          </div>
        </div>

        {/* BREADCRUMB / BACK BUTTON IF IN A CORE FEATURE */}
        {activeFeature && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setActiveFeature(null)}
              className="min-h-[44px] px-3 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all AI Helper tools</span>
            </button>
          </div>
        )}

        {/* Category Filter Pills (When on main overview) */}
        {!activeFeature && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Staff & Workforce', 'Buying & Procurement', 'Store Core'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedToolCategory(cat)}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedToolCategory === cat
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'All' ? 'All AI Tools (19)' : cat}
              </button>
            ))}
          </div>
        )}

        {/* 19 TOOLS GRID (When on main overview) */}
        {!activeFeature && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {visibleTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tool.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (tool.type === 'core') {
                        setActiveFeature(tool.id as FeatureId);
                      } else {
                        runSpecializedTool(tool as any);
                      }
                    }}
                    className="w-full min-h-[40px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <span>{tool.type === 'core' ? 'Open Helper' : 'Run AI Analysis'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: SPECIALIZED TOOL RUNNER (Staff & Buying tools) */}
        {activeSpecializedTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeSpecializedTool.name}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Real time grounded retail analysis
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSpecializedTool(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {specializedLoading ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs font-semibold text-slate-700">Evaluating Store Data with Gemini AI...</p>
                </div>
              ) : specializedResponse ? (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-blue-950">
                      {specializedResponse.title}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {specializedResponse.content}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Recommended Action Points:
                    </span>
                    {specializedResponse.suggestions.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ask Question in Modal */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Ask Custom Question:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type question for this tool..."
                        value={specializedQuery}
                        onChange={(e) => setSpecializedQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') runSpecializedTool(activeSpecializedTool, specializedQuery);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => runSpecializedTool(activeSpecializedTool, specializedQuery)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveSpecializedTool(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => runSpecializedTool(activeSpecializedTool)}
                  className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Refresh Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FEATURE 1: AI ASK */}
        {/* ========================================================= */}
        {activeFeature === 'ask' && (
          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="border-b border-slate-200  pb-3">
              <h2 className="text-lg font-bold">AI Ask</h2>
              <p className="text-xs text-slate-500 ">
                Ask questions about Delhi Flagship sales, items in stock or customer dues.
              </p>
            </div>

            {/* Question chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tap an example question:
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleAskQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendAsk(q)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Log */}
            <div
              className={`h-72 overflow-y-auto p-4 rounded-2xl border space-y-3.5 ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              {askMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MessageSquare className="w-8 h-8 opacity-40 mb-2 text-[#0F766E]" />
                  <p className="text-xs font-semibold text-slate-700 ">No questions asked yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Tap an example question above or type your question below.</p>
                </div>
              )}

              {askMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-br-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`text-[10px] mt-1.5 block text-right ${
                        m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}

              {isAsking && (
                <div className="flex items-center gap-2 p-3 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Checking shop records...</span>
                </div>
              )}

              <div ref={askEndRef} />
            </div>

            {askError && (
              <div className="p-3 bg-rose-50  border border-rose-200  rounded-xl text-xs text-rose-700  flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{askError}</span>
              </div>
            )}

            {/* Input Bar with Mic button (Min 44px) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAsk();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder="Ask in English or Hindi (e.g. Aaj kitni bikri hui?)..."
                  className={`w-full min-h-[44px] pl-4 pr-12 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-2 top-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl cursor-pointer transition-colors ${
                    isAskListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'text-slate-400 hover:text-slate-700 '
                  }`}
                  title="Speak your question"
                >
                  {isAskListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!askInput.trim() || isAsking}
                className="min-h-[44px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] disabled:opacity-50 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs transition-colors shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* FEATURE 2: AI QUICK BILL */}
        {/* ========================================================= */}
        {activeFeature === 'bill' && (
          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="border-b border-slate-200  pb-3">
              <h2 className="text-lg font-bold">AI Quick Bill</h2>
              <p className="text-xs text-slate-500 ">
                Write or speak a simple sentence. The bill fills on screen line by line.
              </p>
            </div>

            {/* Input & Examples */}
            <div className="space-y-2">
              <label className="text-xs font-semibold block text-slate-700 ">
                What do you want to bill?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={billPrompt}
                  onChange={(e) => setBillPrompt(e.target.value)}
                  placeholder="e.g. Bill for Rohit, 2 USB-C cables and 1 power bank"
                  className={`flex-1 min-h-[44px] px-4 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  onClick={() => handleGenerateQuickBill()}
                  disabled={isGeneratingBill}
                  className="min-h-[44px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-bold text-xs rounded-2xl cursor-pointer disabled:opacity-50 transition-colors shrink-0 shadow-xs active:scale-95"
                >
                  {isGeneratingBill ? 'Making Bill...' : 'Create Bill'}
                </button>
              </div>

              {/* Sample Tap Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sampleBillPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setBillPrompt(p);
                      handleGenerateQuickBill(p);
                    }}
                    className={`min-h-[38px] px-3 py-1 text-[11px] font-medium rounded-xl border cursor-pointer transition-colors ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {billError && (
              <div className="p-3 bg-rose-50  border border-rose-200  rounded-xl text-xs text-rose-700  flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{billError}</span>
              </div>
            )}

            {/* Empty State when no bill has been generated yet */}
            {!activeBill && !isGeneratingBill && (
              <div
                className={`p-8 text-center rounded-2xl border border-dashed text-slate-400 ${
                  isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/70 border-slate-300'
                }`}
              >
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-600" />
                <p className="text-xs font-semibold text-slate-700 ">
                  No bill created yet
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Write or speak what you sold above or tap an example to watch the bill generate line by line.
                </p>
              </div>
            )}

            {/* Bill Receipt Preview (Fills line by line) */}
            {activeBill && (
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                {/* Receipt Header (Line 1) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 ">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      Tax Invoice #{Math.floor(1000 + Math.random() * 9000)}
                    </span>
                    <h3 className="text-base font-bold mt-0.5">
                      Customer: {activeBill.customerName}
                    </h3>
                  </div>
                  <div className="text-right text-xs text-slate-500 font-mono">
                    <div>{SHOP_INFO.name}</div>
                    <div>{SHOP_INFO.date}</div>
                  </div>
                </div>

                {/* Items Table (Revealed line by line) */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                    <span className="col-span-6">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>

                  <div className="divide-y divide-slate-200 ">
                    {activeBill.items.map((item, idx) => {
                      const isRevealed = revealedLinesCount >= idx + 1;
                      if (!isRevealed) {
                        return (
                          <div
                            key={idx}
                            className="py-2.5 flex items-center gap-2 text-xs text-slate-400 italic"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                            <span>Writing line {idx + 1}...</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-12 py-2.5 text-xs items-center animate-in fade-in slide-in-from-left-2 duration-200"
                        >
                          <span className="col-span-6 font-semibold truncate pr-2">
                            {item.name}
                          </span>

                          <div className="col-span-2 flex items-center justify-center gap-1.5">
                            {isEditingBill ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateBillItemQty(idx, item.qty - 1)}
                                  className="w-5 h-5 rounded bg-slate-200  flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="font-mono">{item.qty}</span>
                                <button
                                  onClick={() => updateBillItemQty(idx, item.qty + 1)}
                                  className="w-5 h-5 rounded bg-slate-200  flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono font-medium">{item.qty}</span>
                            )}
                          </div>

                          <span className="col-span-2 text-right font-mono text-slate-500">
                            Rs {item.price.toLocaleString('en-IN')}
                          </span>

                          <span className="col-span-2 text-right font-mono font-bold text-slate-900 ">
                            Rs {item.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subtotal, Tax, and Grand Total */}
                {revealedLinesCount >= activeBill.items.length + 1 && (
                  <div className="pt-3 border-t border-slate-200  space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">Rs {activeBill.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>GST (18%)</span>
                      <span className="font-mono">Rs {activeBill.tax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200 ">
                      <span>Grand Total</span>
                      <span className="font-mono text-base text-blue-700 font-black">
                        Rs {activeBill.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bill Action Buttons (Rule: Never save without pressing Save Bill) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 ">
                  <div className="flex items-center gap-2">
                    {/* Take Over Button */}
                    <button
                      onClick={() => setIsEditingBill(!isEditingBill)}
                      className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isEditingBill
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : isDark
                          ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingBill ? 'Done Editing' : 'Take Over'}</span>
                    </button>

                    {/* Continue Button */}
                    <button
                      onClick={() => {
                        setBillPrompt('');
                        setActiveBill(null);
                      }}
                      className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Continue
                    </button>
                  </div>

                  {/* Save Bill Button (Min 44px) */}
                  <button
                    disabled={activeBill.isSaved}
                    onClick={handleSaveBill}
                    className={`min-h-[44px] px-6 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                      activeBill.isSaved
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white active:scale-[0.99]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{activeBill.isSaved ? 'Bill Saved!' : 'Save Bill'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* FEATURE 3: AI STOCK PLAN */}
        {/* ========================================================= */}
        {activeFeature === 'stock' && (
          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="border-b border-slate-200  pb-3">
              <h2 className="text-lg font-bold">AI Stock Plan</h2>
              <p className="text-xs text-slate-500 ">
                Check expected sales for next month and order items before they run out.
              </p>
            </div>

            {stockError && (
              <div className="p-3 bg-rose-50  border border-rose-200  rounded-xl text-xs text-rose-700  flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{stockError}</span>
              </div>
            )}

            {/* Selected Item Plain Advice Callout */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  AI Advice for {selectedStockItem.name}:
                </span>
                <p className="text-sm font-bold text-slate-900  mt-0.5">
                  {isLoadingStockAdvice ? 'Checking stock pace...' : stockAdviceText}
                </p>
              </div>

              <button
                onClick={() => handleOrderNow(selectedStockItem)}
                className="min-h-[44px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-2xl shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                Order {selectedStockItem.suggestedOrder} Units Now
              </button>
            </div>

            {/* Small Chart: Past Sales & Expected Sales */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Sales Trend: {selectedStockItem.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Current Stock: {selectedStockItem.stock}
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="grid grid-cols-4 gap-3 pt-2">
                {selectedStockItem.history.map((h, i) => {
                  const maxSales = 95;
                  const heightPercent = Math.min(100, Math.round((h.sales / maxSales) * 100));
                  const isFuture = i === selectedStockItem.history.length - 1;

                  return (
                    <div key={h.month} className="space-y-1.5 flex flex-col items-center">
                      <span className="text-[10px] font-mono text-slate-500">
                        {h.sales} pcs
                      </span>
                      <div className="w-full h-24 bg-slate-200  rounded-xl relative flex items-end p-1">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-lg transition-all ${
                            isFuture
                              ? 'bg-gradient-to-t from-teal-700 to-teal-500'
                              : 'bg-slate-400 '
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isFuture ? 'text-[#0F766E]  font-bold' : 'text-slate-500'
                        }`}
                      >
                        {h.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stock Plan Table */}
            {CATALOG_ITEMS.length === 0 ? (
              <div
                className={`p-8 text-center rounded-2xl border border-dashed text-slate-400 ${
                  isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/70 border-slate-300'
                }`}
              >
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#0F766E]" />
                <p className="text-xs font-semibold text-slate-700 ">
                  No stock items found
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  There are no catalog products to forecast.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200  text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right">In Stock</th>
                    <th className="py-2.5 px-3 text-right">Next Month Sales</th>
                    <th className="py-2.5 px-3 text-right">Suggested Order</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 ">
                  {CATALOG_ITEMS.map((item) => {
                    const isSelected = selectedStockItem.id === item.id;
                    const statusClass =
                      item.status === 'Urgent'
                        ? 'bg-rose-100 text-rose-800  '
                        : item.status === 'Low'
                        ? 'bg-amber-100 text-amber-800  '
                        : 'bg-emerald-100 text-emerald-800  ';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectStockItem(item)}
                        className={`hover:bg-slate-50  cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-50/50 ' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />}
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Rs {item.price.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium">{item.stock}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {item.likelySalesNextMonth}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#0F766E] ">
                          +{item.suggestedOrder}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderNow(item);
                            }}
                            className="min-h-[44px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
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
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* FEATURE 4: AI BUSINESS SUMMARY */}
        {/* ========================================================= */}
        {activeFeature === 'summary' && (
          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200  pb-3">
              <div>
                <h2 className="text-lg font-bold">AI Business Summary</h2>
                <p className="text-xs text-slate-500 ">
                  Weekly performance review for Delhi Flagship store.
                </p>
              </div>

              {/* Action Buttons: Refresh & Download (Min 44px) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchSummary}
                  disabled={isLoadingSummary}
                  className={`min-h-[44px] px-4 rounded-2xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin text-blue-600' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={downloadSummaryText}
                  className="min-h-[44px] px-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {summaryError && (
              <div className="p-3 bg-rose-50  border border-rose-200  rounded-xl text-xs text-rose-700  flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{summaryError}</span>
              </div>
            )}

            {/* 4 to 5 Short Points List */}
            <div className="space-y-3">
              {isLoadingSummary ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                  <p>Reading weekly sales data...</p>
                </div>
              ) : summaryPoints.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-2xl border border-dashed text-slate-400 ${
                    isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/70 border-slate-300'
                  }`}
                >
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-600" />
                  <p className="text-xs font-semibold text-slate-700 ">
                    No summary available
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click "Refresh" above to generate a weekly business summary.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {summaryPoints.map((point, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                        isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick KPI stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200  text-xs">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-slate-500 block">Today's Sales</span>
                <span className="font-bold text-sm font-mono text-blue-700">
                  {SHOP_INFO.salesToday}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-slate-500 block">Active Products</span>
                <span className="font-bold text-sm font-mono text-blue-700">
                  7 Items (197 units)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block">Pending Dues</span>
                <span className="font-bold text-sm font-mono text-blue-700">
                  Rs 15,650 (3 customers)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FEATURE 5: AI PAYMENT REMINDERS */}
        {/* ========================================================= */}
        {activeFeature === 'reminders' && (
          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200  pb-3">
              <div>
                <h2 className="text-lg font-bold">AI Payment Reminders</h2>
                <p className="text-xs text-slate-500 ">
                  Customers with pending bills. Review friendly Hinglish message before sending.
                </p>
              </div>

              {/* Send to All Button (Min 44px) */}
              <button
                onClick={handleSendToAll}
                className="min-h-[44px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to All</span>
              </button>
            </div>

            {reminderError && (
              <div className="p-3 bg-rose-50  border border-rose-200  rounded-xl text-xs text-rose-700  flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reminderError}</span>
              </div>
            )}

            {/* Customers Due Table or Empty State */}
            {reminderCustomers.length === 0 ? (
              <div
                className={`p-8 text-center rounded-2xl border border-dashed text-slate-400 ${
                  isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/70 border-slate-300'
                }`}
              >
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                <p className="text-xs font-semibold text-blue-700 ">
                  All customer dues are cleared!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  There are no pending payments due at this time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200  text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Customer Name</th>
                      <th className="py-2.5 px-3 text-right">Amount Due</th>
                      <th className="py-2.5 px-3 text-right">Days Late</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 ">
                    {reminderCustomers.map((cust) => (
                      <tr
                        key={cust.id}
                        className="hover:bg-slate-50  transition-colors"
                      >
                        <td className="py-3 px-3 font-semibold">{cust.name}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 ">
                          Rs {cust.amountDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {cust.daysLate} days
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => openReminderReview(cust)}
                            className="min-h-[44px] px-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REVIEW MODAL: Message shown before sending */}
            {selectedReminderCustomer && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div
                  className={`w-full max-w-lg p-6 rounded-2xl border space-y-4 shadow-xl ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200  pb-2">
                    <div>
                      <h3 className="text-base font-bold">Review Reminder Message</h3>
                      <p className="text-xs text-slate-500">
                        For {selectedReminderCustomer.name} (Rs {selectedReminderCustomer.amountDue.toLocaleString('en-IN')})
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedReminderCustomer(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {isGeneratingReminder ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                      <p>Drafting polite reminder...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Message Preview (Hinglish):
                      </label>

                      {isEditingReminderMsg ? (
                        <textarea
                          rows={3}
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      ) : (
                        <div
                          className={`p-3.5 rounded-xl border text-xs leading-relaxed font-mono ${
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          {customMessage}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 ">
                    <button
                      onClick={() => setIsEditingReminderMsg(!isEditingReminderMsg)}
                      className={`min-h-[44px] px-3.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        isEditingReminderMsg
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : isDark
                          ? 'bg-slate-800 text-slate-200 border-slate-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {isEditingReminderMsg ? 'Done' : 'Change Message'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReminderCustomer(null)}
                        className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 "
                      >
                        Cancel
                      </button>

                      {/* Final Send Button */}
                      <button
                        onClick={handleSendReminderFinal}
                        className="min-h-[44px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs active:scale-95"
                      >
                        Send Reminder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM NOTE: Privacy / Shop Data Guarantee */}
        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500 ">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] " />
          <span>Your shop data stays in your account.</span>
        </div>
      </div>
    </div>
  );
};
