import React, { useState } from 'react';
import { useApp, SEED_USERS } from '../context/AppContext';
import {
  TrendingUp,
  Package,
  Sparkles,
  ShoppingBag,
  Percent,
  Layers,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  Store,
  Receipt,
  Truck,
  Cpu,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  HelpCircle,
  Star,
  Zap,
  Check,
  CreditCard,
  QrCode,
  ScanBarcode,
} from 'lucide-react';
import { CandyButton } from '../design-system/components/CandyButton';
import { PriceTagBadge } from '../design-system/components/PriceTagBadge';
import { PricingSimulator } from '../design-system/components/PricingSimulator';
import { DukaanIqLogo } from './DukaanIqLogo';
import {
  BarcodeStripe,
  DotGridPattern,
  RetailBlob,
  ShelfProblemSolutionVisual,
} from '../design-system/components/DecorativeShapes';

export const MarketingPage: React.FC = () => {
  const {
    setActiveView,
    currentUser,
    isAuthenticated,
    openAuthModal,
    logout,
    login,
  } = useApp();

  const [selectedPersona, setSelectedPersona] = useState<'ops' | 'merch' | 'supply' | 'cfo'>('ops');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const capabilities = [
    {
      title: 'Predictive Demand Forecasting',
      category: 'Inventory',
      description:
        'Calculates exact sales velocity, safety stock, and supplier lead times so you never stock out during sales surges.',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-700',
      tag: 'Grounded Forecast',
      view: 'inventory',
    },
    {
      title: 'Dynamic Pricing Optimization',
      category: 'Margin Engine',
      description:
        'Simulates price elasticity and recommends optimal price points that maximize gross profit without losing turnover.',
      icon: Percent,
      color: 'bg-amber-50 text-amber-700',
      tag: 'Elasticity Model',
      view: 'pricing',
    },
    {
      title: 'AI Smart Billing & POS',
      category: 'Counter Speed',
      description:
        'High-speed checkout with voice search, automatic cross-sell bundle recommendations, and dynamic UPI QR generation.',
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-700',
      tag: 'Under 1.2s Finalize',
      view: 'pos',
    },
    {
      title: 'Multi-Store & Transfer Hub',
      category: 'Operations',
      description:
        'Monitor stock balances across Delhi, Mumbai, and Bengaluru stores with instant inter-branch inventory transfers.',
      icon: Store,
      color: 'bg-sky-50 text-sky-700',
      tag: 'Centralized Control',
      view: 'inventory',
    },
    {
      title: 'Automated Purchase Orders',
      category: 'Supply Chain',
      description:
        'Generates one-click purchase orders based on lead-time demand and pack sizes, with supplier delivery scorecards.',
      icon: Truck,
      color: 'bg-violet-50 text-violet-700',
      tag: 'Auto-Draft POs',
      view: 'purchasing',
    },
    {
      title: 'Smart GST & Tax Automation',
      category: 'Finance',
      description:
        'Automated CGST/SGST/IGST calculations with 8-digit HSN tagging, tax anomaly audits, and one-click GSTR-1 CSV exports.',
      icon: Receipt,
      color: 'bg-pink-50 text-pink-700',
      tag: '100% Tax Compliant',
      view: 'finance',
    },
  ];

  const personaContent = {
    ops: {
      title: 'For Store Managers & Counter Cashiers',
      sub: 'Speed up line queues, eliminate billing mistakes, and reconcile shifts effortlessly.',
      stat: '42s Average Checkout Duration',
      points: [
        'Voice and barcode instant product lookup',
        'Automatic customer loyalty discounts and cross-sell bundles',
        'Offline sales queuing with zero data loss',
        'Cash drawer shift float open/close with variance auditing',
      ],
      action: 'Launch POS Counter',
      view: 'pos',
    },
    merch: {
      title: 'For Merchandisers & Category Planners',
      sub: 'Know which SKUs drive the highest margins and run intelligent pricing experiments.',
      stat: '+18.4% Average Margin Uplift',
      points: [
        'AI suggested price points based on sales velocity',
        'Elasticity simulator to test promotional discounts before launch',
        'Slow-moving stock alerts with markdown recommendations',
        'Category-level revenue and contribution margin breakdown',
      ],
      action: 'Open Pricing Optimizer',
      view: 'pricing',
    },
    supply: {
      title: 'For Supply Chain & Inventory Managers',
      sub: 'Avoid costly stockouts while keeping working capital lean.',
      stat: '99.4% On-Shelf Availability',
      points: [
        'Lead-time demand formula factoring supplier delivery days',
        'One-click draft PO creation with minimum order quantity rounding',
        'Supplier delivery speed and on-time scorecards',
        'Inter-store stock transfers between retail branches and warehouses',
      ],
      action: 'View Inventory Forecast',
      view: 'inventory',
    },
    cfo: {
      title: 'For Retail Executives & CFOs',
      sub: 'Clear, trusted financial clarity with zero non-deterministic hallucinations.',
      stat: '₹12,40,000 Projected Quarterly Profit',
      points: [
        'Real-time P&L statement with COGS and operating expense tracking',
        'Logistics cost optimization diagnostics',
        'Statutory GST compliance reporting with input tax credit matching',
        'Grounded Gemini AI Copilot for natural language business queries',
      ],
      action: 'Review Financial & GST Center',
      view: 'finance',
    },
  };

  const integrations = [
    'Tally Prime',
    'SAP Business One',
    'Zoho Books',
    'Shopify',
    'Pine Labs POS',
    'Paytm EDC',
    'E-Way Bill Portal',
    'Razorpay POS',
  ];

  const faqs = [
    {
      q: 'Does DukaanIQ continue working when the internet disconnects?',
      a: 'Yes. DukaanIQ features fully local offline caching for POS barcode scanning, cart calculations, and queue processing. Invoices are signed locally and queued to automatically synchronize with the cloud once connectivity resumes.',
    },
    {
      q: 'How does DukaanIQ ensure GST compliance and GSTR-1 accuracy?',
      a: 'All transactions automatically calculate intra-state (CGST + SGST) and inter-state (IGST) rates based on store and customer locations. You can export clean, audit-ready GSTR-1 and GSTR-3B summary CSV files with 8-digit HSN tagging at any time.',
    },
    {
      q: 'Can I connect barcode scanners and thermal receipt printers?',
      a: 'Yes. DukaanIQ works natively with standard 1D/2D USB and Bluetooth HID barcode scanners, as well as 80mm ESC/POS thermal receipt printers with full browser print formatting.',
    },
    {
      q: 'How are Gemini AI business answers grounded?',
      a: 'The DukaanIQ Copilot exclusively queries your live store SQLite/Firestore database. Every financial stat, reorder quantity, and margin prediction provides exact data citation IDs so you can audit every figure.',
    },
    {
      q: 'Can I import my existing product catalogue from Excel or Tally?',
      a: 'Yes! Our built-in RFC 4180 CSV engine lets you drag and drop or paste spreadsheets. It intelligently auto-maps column headers, validates stock numbers and GST slabs, and updates your catalogue in seconds.',
    },
  ];

  const handleQuickDemoLogin = async (user: typeof SEED_USERS[0]) => {
    await login(user.email, 'demo-password', user.role);
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] text-slate-900 overflow-x-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      <DotGridPattern />
      <RetailBlob color="indigo" className="-top-40 -left-40 w-96 h-96 opacity-30" />
      <RetailBlob color="violet" className="top-1/3 -right-40 w-96 h-96 opacity-25" />
      <RetailBlob color="amber" className="bottom-40 left-10 w-80 h-80 opacity-20" />

      {/* STANDALONE PUBLIC NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="cursor-pointer text-left focus:outline-none"
            >
              <DukaanIqLogo size="md" />
            </button>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Home
              </button>
              <a href="#features" className="hover:text-indigo-600 transition-colors">
                Features
              </a>
              <a href="#ai-tools" className="hover:text-indigo-600 transition-colors">
                AI Tools
              </a>
              <a href="#pricing" className="hover:text-indigo-600 transition-colors">
                Pricing
              </a>
              <button
                onClick={() => setActiveView('contact')}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="truncate max-w-[120px]">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono capitalize">({currentUser.role})</span>
                </div>

                <CandyButton
                  size="sm"
                  variant="primary"
                  withArrow={true}
                  onClick={() => setActiveView('dashboard')}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Open Dashboard</span>
                </CandyButton>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('signin')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Log In
                </button>

                <CandyButton
                  size="sm"
                  variant="primary"
                  withArrow={true}
                  onClick={() => setActiveView('signin')}
                >
                  Sign Up Free
                </CandyButton>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Proof, and Candy CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Price-tag sticker badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <PriceTagBadge color="amber" rotated={true}>
                +24% Sell-Through
              </PriceTagBadge>
              <PriceTagBadge color="mint">
                Zero Stockout Surprises
              </PriceTagBadge>
              <PriceTagBadge color="pink" rotated={true}>
                100% Grounded AI
              </PriceTagBadge>
            </div>

            {/* Gradient-split headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.08] text-slate-950">
              Know what shoppers want{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                before they do.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              DukaanIQ unites high-speed Point of Sale, dynamic pricing, and multi-store inventory forecasting with explainable Gemini 3.8 Flash intelligence. Never lose another sale to empty shelves or manual guesswork.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <CandyButton
                size="lg"
                variant="primary"
                withArrow={true}
                onClick={() => setActiveView('signin')}
              >
                <LayoutDashboard className="w-4 h-4 mr-1 inline" />
                <span>Launch Store Dashboard</span>
              </CandyButton>

              <CandyButton
                size="lg"
                variant="secondary"
                onClick={() => setActiveView('signin')}
              >
                Start Free Trial
              </CandyButton>
            </div>

            {/* Quick 1-Click Role Switcher Demo Cards */}
            <div className="pt-3 bg-white/80 backdrop-blur-xs p-4 rounded-2xl border-2 border-slate-900 shadow-pop space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Instant Live Demo (Click any role to test)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  No Password Needed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SEED_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setActiveView('signin')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/70 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-300"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-[10px]">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                          {u.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize font-medium flex items-center justify-between">
                      <span>{u.role} Access</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust row */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700">Deterministic GST Math</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-700">Explainable Reorder Drafts</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="font-semibold text-slate-700">Gemini 3.8 Flash Server</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Tilted Hero Dashboard Preview */}
          <div className="lg:col-span-5 relative">
            <div className="perspective-[2000px]">
              <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 space-y-4 rotate-x-[4deg] rotate-y-[-8deg] hover:rotate-0 transition-all duration-500">
                {/* Dashboard Card Top Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs font-bold text-slate-800 font-heading ml-2">
                      Delhi Flagship · Real-Time Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    99.4% Stock Health
                  </span>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FBFAF7] rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-heading">
                      Today Gross Sales
                    </div>
                    <div className="text-xl font-extrabold font-heading text-slate-900 mt-0.5 tabular-nums">
                      ₹48,920
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                      ↑ 18.4% vs last Thursday
                    </div>
                  </div>

                  <div className="p-3 bg-[#FBFAF7] rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-heading">
                      Active POS Carts
                    </div>
                    <div className="text-xl font-extrabold font-heading text-slate-900 mt-0.5 tabular-nums">
                      3 Counters
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                      Avg speed: 1.1s / scan
                    </div>
                  </div>
                </div>

                {/* Simulated Stock Alert */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-heading">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Gemini Copilot Proactive Alert
                    </span>
                    <span className="text-[10px] font-mono font-semibold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                      Lead-time Risk
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-snug">
                    Wireless ANC Pro Headphones (SKU: TECH-990) has only 12 units remaining. Forecast indicates stockout in 3 days.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-amber-700 font-mono">Supplier: SoundTech Corp</span>
                    <button
                      onClick={() => setActiveView('signin')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      Draft PO for 40 units →
                    </button>
                  </div>
                </div>

                {/* Simulated POS Quick Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Ready to explore?</span>
                  <CandyButton
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveView('signin')}
                  >
                    Open POS Terminal
                  </CandyButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RETAIL LOGOS BAR */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 font-heading mb-6">
            Seamless ERP & Payment Ecosystem Integrations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
            {integrations.map((name) => (
              <span
                key={name}
                className="font-mono text-sm font-bold text-slate-700 tracking-tight"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AI TOOLS IN CARD VIEW (3 cards + View More option) */}
      <section id="ai-tools" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <PriceTagBadge color="pink">AI Retail Intelligence</PriceTagBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950">
            AI Tools Built for Shop Owners
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Simple Indian retail intelligence. Clean forecasting, price optimization, and stock recommendations without robot icons or fancy math.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: AI Demand Forecast */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between hover:shadow-pop-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
                📈
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                  Inventory AI
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-heading mt-1">
                  AI Demand Forecaster
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Calculates exact daily sales velocity and safety stock for next 30 days so you never run out of stock during festival surges.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setActiveView('signin')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sign In to Access
              </button>
            </div>
          </div>

          {/* Card 2: AI Dynamic Pricing */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between hover:shadow-pop-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xl">
                🏷️
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">
                  Margin Optimizer
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-heading mt-1">
                  AI Dynamic Price Engine
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Simulates price elasticity on slow-moving vs fast-moving items. Suggests optimal discounts that boost total gross profit without hurting sales volume.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setActiveView('signin')}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sign In to Access
              </button>
            </div>
          </div>

          {/* Card 3: AI Stock Manager */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between hover:shadow-pop-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl">
                📦
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 font-mono">
                  Stock Assistant
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-heading mt-1">
                  AI Stock Manager
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Answers stock queries in simple Indian English, finds capital stuck in slow inventory, and automatically prepares supplier WhatsApp purchase orders.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setActiveView('signin')}
                className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sign In to Access
              </button>
            </div>
          </div>

          {/* Card 4: View More Option (Redirects to Sign In) */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 text-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between hover:shadow-pop-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-lg">
                ✨
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 font-mono">
                  +5 More AI Tools
                </span>
                <h3 className="text-lg font-bold font-heading mt-1 text-white">
                  View More AI Tools
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Unlock AI Billing Voice Search, Shrinkage & Discrepancy Detector, Automatic Bundle Creator, and AI Staff Shift Optimizer.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20 mt-4">
              <button
                onClick={() => setActiveView('signin')}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>View More AI Tools</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE ENTERPRISE CAPABILITIES / FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <PriceTagBadge color="mint">Engineered for Indian Retail</PriceTagBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950">
            Six engines powering the modern high-margin store
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every module is designed to eliminate manual guesswork, reduce inventory holding costs, and speed up customer checkout counters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between hover:shadow-pop-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cap.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {cap.tag}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase text-indigo-600 font-heading">
                      {cap.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-heading mt-0.5">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => setActiveView('signin')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>Launch {cap.category}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POS TERMINAL SHOWCASE */}
      <section id="pos-demo" className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold font-mono">
                <ScanBarcode className="w-4 h-4" />
                <span>Next-Gen Counter Billing</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">
                Checkout lines that move in seconds, not minutes.
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Traditional legacy POS systems slow down during rush hours. DukaanIQ POS is built with local caching, voice lookup, dynamic UPI QR codes, split tenders, and instant 80mm ESC/POS thermal printing.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-white/10 rounded-xl border border-white/10">
                  <div className="text-2xl font-black font-heading text-emerald-400">1.2s</div>
                  <div className="text-xs text-slate-300 mt-0.5">Average checkout speed</div>
                </div>
                <div className="p-3.5 bg-white/10 rounded-xl border border-white/10">
                  <div className="text-2xl font-black font-heading text-indigo-300">100%</div>
                  <div className="text-xs text-slate-300 mt-0.5">Offline transaction safety</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <CandyButton
                  size="md"
                  variant="primary"
                  withArrow={true}
                  onClick={() => setActiveView('pos')}
                >
                  Try POS Terminal Now
                </CandyButton>
                <CandyButton
                  size="md"
                  variant="secondary"
                  onClick={() => setActiveView('workforce')}
                >
                  View Cashier Shift Float
                </CandyButton>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-800/80 rounded-3xl p-6 border-2 border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-heading">POS Terminal V4</span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                  Connected & Ready
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Cart Items (2)</span>
                  <span className="font-mono text-white font-bold">Total: ₹4,128.82</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-white">Sony WH-1000XM5</div>
                    <div className="text-[10px] text-slate-400">HSN: 85183000 · 18% GST</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">₹3,499.00</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-white">Type-C Braided Cable 65W</div>
                    <div className="text-[10px] text-slate-400">HSN: 85444299 · 18% GST</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">₹629.82</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <QrCode className="w-4 h-4" />
                  <span>Dynamic UPI QR code ready for customer</span>
                </div>
                <button
                  onClick={() => setActiveView('signin')}
                  className="font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  Simulate Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONA TABS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <PriceTagBadge color="pink">Tailored for Every Team Member</PriceTagBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950">
            One platform, purpose-built for each role
          </h2>
        </div>

        {/* Persona Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'ops', label: 'Store Managers & Cashiers' },
            { id: 'merch', label: 'Merchandisers & Planners' },
            { id: 'supply', label: 'Inventory & Supply Chain' },
            { id: 'cfo', label: 'Retail Owners & CFOs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPersona(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedPersona === tab.id
                  ? 'bg-slate-900 text-white shadow-pop-active'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Persona Active Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Role Spotlight
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-950">
                {personaContent[selectedPersona].title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {personaContent[selectedPersona].sub}
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {personaContent[selectedPersona].points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <CandyButton
                  variant="primary"
                  withArrow={true}
                  onClick={() => setActiveView('signin')}
                >
                  {personaContent[selectedPersona].action}
                </CandyButton>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#FBFAF7] rounded-2xl border border-slate-200 p-6 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Measurable Impact
              </span>
              <div className="text-2xl font-extrabold font-heading text-indigo-900">
                {personaContent[selectedPersona].stat}
              </div>
              <p className="text-xs text-slate-500">
                Observed across 1,200+ multi-category retail locations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC PRICING SIMULATOR */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/60 rounded-3xl border-2 border-slate-900 shadow-pop p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <PriceTagBadge color="amber" rotated={true}>
                Try Interactive Model
              </PriceTagBadge>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-950">
                Test price elasticity without risking store turnover
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Adjust the slider on the right to see how DukaanIQ calculates projected margin dollars versus customer demand curve drop-offs.
              </p>
              <div className="pt-2">
                <CandyButton
                  variant="primary"
                  onClick={() => setActiveView('signin')}
                >
                  Launch Full Pricing Optimizer
                </CandyButton>
              </div>
            </div>

            <div className="lg:col-span-7">
              <PricingSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <PriceTagBadge color="mint">Transparent Retail Pricing</PriceTagBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950">
            Simple plans tailored to store size
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No hidden transaction commissions. 14-day free trial on all plans.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Plan 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Single Counter
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Starter Dukaan</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ideal for standalone neighborhood retail shops.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-3xl font-extrabold font-heading text-slate-900">
                  {billingCycle === 'annual' ? '₹1,199' : '₹1,499'}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ 1 POS Checkout Counter</li>
                <li className="flex items-center gap-2">✓ Unlimited Inventory SKUs</li>
                <li className="flex items-center gap-2">✓ GST Invoicing & GSTR-1 CSV</li>
                <li className="flex items-center gap-2">✓ Cash Drawer Shift Float Reconcile</li>
              </ul>
            </div>

            <CandyButton
              variant="secondary"
              onClick={() => setActiveView('signin')}
            >
              Start Free Trial
            </CandyButton>
          </div>

          {/* Plan 2: Pro (Highlighted) */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl font-heading">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-heading">
                  Growing Superstores
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Pro Retailer</h3>
                <p className="text-xs text-slate-500 mt-1">
                  For stores with multiple billing counters and warehouse hubs.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-3xl font-extrabold font-heading text-slate-900">
                  {billingCycle === 'annual' ? '₹2,799' : '₹3,499'}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Up to 4 POS Counters</li>
                <li className="flex items-center gap-2">✓ AI Predictive Demand Forecasting</li>
                <li className="flex items-center gap-2">✓ RFC-4180 CSV Bulk Import Engine</li>
                <li className="flex items-center gap-2">✓ Dynamic Pricing & Margin Simulator</li>
                <li className="flex items-center gap-2">✓ Multi-Store Inter-Branch Transfers</li>
              </ul>
            </div>

            <CandyButton
              variant="primary"
              withArrow={true}
              onClick={() => setActiveView('signin')}
            >
              Get Started with Pro
            </CandyButton>
          </div>

          {/* Plan 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Large Chains & Franchises
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Multi-Store Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">
                  For regional chains with 5+ branches.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-3xl font-extrabold font-heading text-slate-900">
                  {billingCycle === 'annual' ? '₹6,399' : '₹7,999'}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Unlimited Locations & Warehouses</li>
                <li className="flex items-center gap-2">✓ Dedicated Gemini AI Copilot Integration</li>
                <li className="flex items-center gap-2">✓ Custom ESC/POS Hardware Drivers</li>
                <li className="flex items-center gap-2">✓ 24/7 Dedicated Priority Phone Support</li>
              </ul>
            </div>

            <CandyButton
              variant="secondary"
              onClick={() => setActiveView('signin')}
            >
              Sign Up Enterprise
            </CandyButton>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & STATS */}
      <section id="testimonials" className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <PriceTagBadge color="mint">Proven in Retail Trenches</PriceTagBadge>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              Trusted by 10,000+ retail counters across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
 "Our weekend festival rush used to cause 15-minute checkout queues. With DukaanIQ barcode speed and dynamic UPI QR, average billing dropped to 40 seconds."
              </p>
              <div className="pt-2 border-t border-slate-100">
                <div className="font-bold text-xs text-slate-900">Vikram Malhotra</div>
                <div className="text-[10px] text-slate-500">Owner, Malhotra Supermarket (Delhi NCR)</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
 "The AI Demand Forecasting caught our seasonal earphone surge two weeks before Diwali. We drafted supplier POs in 1-click and avoided a ₹3.5 lakh stockout."
              </p>
              <div className="pt-2 border-t border-slate-100">
                <div className="font-bold text-xs text-slate-900">Pooja Shenoy</div>
                <div className="text-[10px] text-slate-500">Merchandiser, GadgetGalaxy Retail (Bengaluru)</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
 "Filing GSTR-1 used to take our CA 3 full days of manual tallying. With DukaanIQ's one-click CSV export with HSN codes, it's done in 5 minutes."
              </p>
              <div className="pt-2 border-t border-slate-100">
                <div className="font-bold text-xs text-slate-900">Kavita Rao</div>
                <div className="text-[10px] text-slate-500">Director of Finance, Apex Group (Mumbai)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <PriceTagBadge color="amber">Got Questions?</PriceTagBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-950">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about setting up and scaling DukaanIQ.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900 font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden border-2 border-slate-900 shadow-pop">
          <RetailBlob color="violet" className="-top-20 left-10 w-72 h-72 opacity-25" />
          <RetailBlob color="amber" className="-bottom-20 right-10 w-72 h-72 opacity-20" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center">
              <PriceTagBadge color="amber" rotated={true}>
                Ready in under 2 minutes
              </PriceTagBadge>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight">
              Ready to give your store an{' '}
              <span className="text-[#FBBF24]">intelligent edge?</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore the live retail operations platform right now. Process sales, inspect predictive demand forecasts, simulate price elasticity, and ask Gemini Copilot questions with real store data.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <CandyButton
                size="lg"
                variant="primary"
                withArrow={true}
                onClick={() => setActiveView('signin')}
              >
                Start 14-Day Free Trial
              </CandyButton>
              <CandyButton
                size="lg"
                variant="secondary"
                onClick={() => setActiveView('signin')}
              >
                Try Live POS Terminal
              </CandyButton>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <DukaanIqLogo size="md" />
            <p className="text-xs text-slate-500 mt-1">
              AI Powered Ultimate POS & Autonomous Retail ERP
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Home
            </button>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#ai-tools" className="hover:text-indigo-600 transition-colors">
              AI Tools
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              Pricing
            </a>
            <button onClick={() => setActiveView('contact')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Contact Us
            </button>
            <button onClick={() => setActiveView('signin')} className="hover:text-indigo-600 font-bold text-indigo-600 transition-colors cursor-pointer">
              Sign In
            </button>
          </div>

          <div className="text-xs text-slate-400 text-center md:text-right">
            <div>© 2026 DukaanIQ Inc. All rights reserved.</div>
            <div className="text-[11px] text-slate-400 mt-0.5">GST Ready · Offline Resilient · ISO 27001 Cloud</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
