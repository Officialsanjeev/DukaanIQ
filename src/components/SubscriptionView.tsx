import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  CreditCard,
  Download,
  Calendar,
  Layers,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { CandyButton } from '../design-system/components/CandyButton';

export const SubscriptionView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activePlan, setActivePlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter Dukaan',
      badge: 'Single Counter',
      priceMonthly: 999,
      priceAnnual: 799,
      description: 'Ideal for neighborhood kiranas and small retail shops needing fast barcode billing.',
      features: [
        'Up to 1 Store Location',
        '2 Cashier Terminal Logins',
        'Up to 1,000 Catalog SKUs',
        'Standard GST Invoicing & Thermal Printing',
        'Offline Billing Queue (Up to 50 sales)',
        'Standard Email Support',
      ],
    },
    {
      id: 'growth',
      name: 'Growth Retailer',
      badge: 'Most Popular',
      priceMonthly: 2499,
      priceAnnual: 1999,
      description: 'For growing retail chains, supermarkets, and electronic showrooms needing multi-store control.',
      popular: true,
      features: [
        'Up to 5 Store Branches + 1 Central Warehouse',
        '10 Staff / Cashier Accounts with Role Access',
        'Unlimited Product Catalogue & Barcodes',
        'Explainable Gemini 3.8 Flash AI Copilot',
        'Automated Wholesale & Supplier Reorders',
        'Customer Credit WhatsApp Reminders',
        'One-Click GSTR-1 CSV Filing Reports',
        'Priority 24/7 Phone & WhatsApp Support',
      ],
    },
    {
      id: 'enterprise',
      name: 'Multi-Store Enterprise',
      badge: 'High Volume',
      priceMonthly: 4999,
      priceAnnual: 3999,
      description: 'For regional retail brands requiring custom ERP sync, Tally integration, and dedicated account manager.',
      features: [
        'Unlimited Store Locations & Hubs',
        'Unlimited Cashier & Manager Seats',
        'Tally Prime & SAP ERP Direct Sync',
        'Custom ESC/POS Thermal Template Design',
        'Dedicated Solutions Architect',
        '99.9% Uptime SLA Agreement',
      ],
    },
  ];

  const invoices = [
    { id: 'INV-2026-09', date: '01 Sep 2026', amount: '₹2,499.00', status: 'Paid', method: 'HDFC Corporate Card •••• 4018' },
    { id: 'INV-2026-08', date: '01 Aug 2026', amount: '₹2,499.00', status: 'Paid', method: 'HDFC Corporate Card •••• 4018' },
    { id: 'INV-2026-07', date: '01 Jul 2026', amount: '₹2,499.00', status: 'Paid', method: 'HDFC Corporate Card •••• 4018' },
  ];

  const handleSelectPlan = (planId: 'starter' | 'growth' | 'enterprise') => {
    setActivePlan(planId);
    setUpgradeSuccess(`Successfully updated subscription to ${plans.find(p => p.id === planId)?.name}!`);
    setTimeout(() => setUpgradeSuccess(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Subscription & Billing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store license, multi-branch limits, payment methods, and tax invoices.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              billingCycle === 'annual'
                ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded">Save 20%</span>
          </button>
        </div>
      </div>

      {upgradeSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{upgradeSuccess}</span>
        </div>
      )}

      {/* Current Active Plan Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Current Active License
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active • Renews 01 Nov 2026
            </span>
          </div>

          <div className="text-2xl font-black font-heading text-slate-900 mt-1">
            {plans.find(p => p.id === activePlan)?.name}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span>Billing: <strong className="text-slate-800">₹{billingCycle === 'monthly' ? '2,499' : '1,999'}/month</strong></span>
            <span>•</span>
            <span>Locations: <strong className="text-slate-800">3 of 5 Branches Used</strong></span>
            <span>•</span>
            <span>Staff Seats: <strong className="text-slate-800">4 of 10 Active</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto-Debit Active</span>
            </div>
            <div className="text-[11px] text-slate-400">HDFC Corporate •••• 4018</div>
          </div>
        </div>
      </div>

      {/* 3 Tier Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = activePlan === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-indigo-600 shadow-md ring-4 ring-indigo-50'
                  : 'bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-3 py-0.5 rounded-full shadow-xs">
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    {plan.name}
                  </h3>
                  {!plan.popular && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 min-h-[36px]">
                  {plan.description}
                </p>

                <div className="my-4 pb-4 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-heading text-slate-900">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/ month</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {billingCycle === 'annual' ? 'Billed annually (+18% GST)' : 'Billed monthly (+18% GST)'}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                    Included Features
                  </div>
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(plan.id as any)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <span>Switch to {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices & Billing History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">
              Billing History & Tax Receipts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download GST tax invoices for business expense reimbursement.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-mono font-bold text-slate-900">{inv.id}</div>
                <div className="text-[11px] text-slate-500">{inv.date} · {inv.method}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-slate-900">{inv.amount}</div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {inv.status}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Downloading GST Invoice ${inv.id} in PDF format`)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Download Invoice PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
