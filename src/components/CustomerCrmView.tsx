import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import {
  Users,
  Search,
  Phone,
  Mail,
  Award,
  ShoppingBag,
  Send,
  CheckCircle,
  Copy,
  AlertTriangle,
  IndianRupee,
  MessageSquare,
  Sparkles,
  Filter,
  CreditCard,
  Calendar,
  Share2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface ExtendedCustomer extends Customer {
  city: string;
  unpaidDue?: number;
  lastVisitDate?: string;
  upiPaymentLink?: string;
}

export const CustomerCrmView: React.FC = () => {
  const { customers, currentBusiness } = useApp();

  // Enrich customers with udhaar / unpaid data
  const enrichedCustomers: ExtendedCustomer[] = useMemo(() => {
    const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Noida', 'Gurugram'];
    return customers.map((c, index) => {
      // Give some customers realistic unpaid debt (Udhaar)
      const dues = [3450, 0, 1850, 0, 5200, 0, 890];
      const unpaidDue = dues[index % dues.length];
      const city = cities[index % cities.length];
      const link = `https://pay.dukaaniq.in/u/${c.id}?amt=${unpaidDue}`;
      return {
        ...c,
        city,
        unpaidDue,
        lastVisitDate: index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${10 + index} Oct 2026`,
        upiPaymentLink: link,
      };
    });
  }, [customers]);

  const [filterMode, setFilterMode] = useState<'all' | 'debtors' | 'high_loyalty'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<ExtendedCustomer>(enrichedCustomers[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoTemplate, setPromoTemplate] = useState('festive');
  const [promoNotice, setPromoNotice] = useState<string | null>(null);

  // Filtered list
  const filteredList = useMemo(() => {
    return enrichedCustomers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'debtors') {
        return (c.unpaidDue || 0) > 0;
      }
      if (filterMode === 'high_loyalty') {
        return c.loyaltyPoints > 300;
      }
      return true;
    });
  }, [enrichedCustomers, searchQuery, filterMode]);

  // Total summary metrics
  const totalDebtorsCount = enrichedCustomers.filter((c) => (c.unpaidDue || 0) > 0).length;
  const totalDuesAmount = enrichedCustomers.reduce((sum, c) => sum + (c.unpaidDue || 0), 0);
  const totalLoyaltyPointsIssued = enrichedCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  // Payment reminder message
  const paymentReminderText = useMemo(() => {
    return `Namaste ${selectedCust.name}! Your pending payment at ${currentBusiness.name} is Rs ${(selectedCust.unpaidDue || 0).toLocaleString('en-IN')}. Kindly clear via UPI: ${selectedCust.upiPaymentLink}. Thank you for shopping with us!`;
  }, [selectedCust, currentBusiness]);

  // Promotional message
  const promoMessageText = useMemo(() => {
    if (promoTemplate === 'festive') {
      return `Namaste ${selectedCust.name}! Festive Special Offer at ${currentBusiness.name}: Get flat 15% OFF on ${selectedCust.preferredCategory || 'all items'} this week! Show code FESTIVE15 at checkout counter.`;
    }
    if (promoTemplate === 'loyalty') {
      return `Dear ${selectedCust.name}, you have ${selectedCust.loyaltyPoints} Loyalty Points at ${currentBusiness.name}! Redeem them for Rs ${Math.round(selectedCust.loyaltyPoints * 0.5)} discount on your next visit today!`;
    }
    return `Hello ${selectedCust.name}! We miss you at ${currentBusiness.name}! Visit us this weekend and get a surprise gift with any billing above Rs 1,000!`;
  }, [selectedCust, currentBusiness, promoTemplate]);

  // Handlers
  const handleCopyPaymentLink = () => {
    navigator.clipboard.writeText(paymentReminderText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendReminder = (channel: 'whatsapp' | 'sms') => {
    const text = encodeURIComponent(paymentReminderText);
    const cleanPhone = selectedCust.phone.replace(/\D/g, '');
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
    } else {
      window.open(`sms:+91${cleanPhone}?body=${text}`, '_blank');
    }
    setReminderNotice(`Payment reminder sent to ${selectedCust.name} via ${channel.toUpperCase()}!`);
    setTimeout(() => setReminderNotice(null), 3500);
  };

  const handleSendPromotion = (channel: 'whatsapp' | 'sms') => {
    const text = encodeURIComponent(promoMessageText);
    const cleanPhone = selectedCust.phone.replace(/\D/g, '');
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
    } else {
      window.open(`sms:+91${cleanPhone}?body=${text}`, '_blank');
    }
    setPromoNotice(`Promotional message sent to ${selectedCust.name}!`);
    setTimeout(() => {
      setPromoNotice(null);
      setPromoModalOpen(false);
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#101828] ">
              Customer Relationship & Udhaar Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#2563EB] ">
              {enrichedCustomers.length} Customers
            </span>
          </div>
          <p className="text-xs text-[#667085]  mt-1">
            Manage customer spend, loyalty points, visit cadence, pending Udhaar balances, and send automated WhatsApp reminders.
          </p>
        </div>

        {/* Global Action: Broadcast Promotion */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPromoModalOpen(true)}
            className="h-[40px] px-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-[10px] text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Send Promotion Message</span>
          </button>
        </div>
      </div>

      {reminderNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reminderNotice}</span>
        </div>
      )}

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white  p-5 rounded-[16px] border border-[#E8EBF2]  shadow-xs">
          <span className="text-xs text-[#667085] ">Total Customers</span>
          <div className="text-2xl font-bold text-[#101828]  mt-1">
            {enrichedCustomers.length} Verified
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Active in Connaught Place store
          </div>
        </div>

        <div className="bg-white  p-5 rounded-[16px] border border-rose-200  shadow-xs bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700  font-semibold">Payment Not Paid (Udhaar)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-700  mt-1">
            Rs {totalDuesAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {totalDebtorsCount} customers have pending balance
          </div>
        </div>

        <div className="bg-white  p-5 rounded-[16px] border border-[#E8EBF2]  shadow-xs">
          <span className="text-xs text-[#667085] ">Loyalty Points Balance</span>
          <div className="text-2xl font-bold text-[#2563EB] mt-1">
            {totalLoyaltyPointsIssued.toLocaleString('en-IN')} Pts
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Worth approx Rs {Math.round(totalLoyaltyPointsIssued * 0.5).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white  p-5 rounded-[16px] border border-[#E8EBF2]  shadow-xs">
          <span className="text-xs text-[#667085] ">Average Order Value (AOV)</span>
          <div className="text-2xl font-bold text-[#101828]  mt-1">
            Rs 1,480
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            +Rs 120 vs previous quarter
          </div>
        </div>
      </div>

      {/* Main Grid: Customer List on Left, Detailed Profile & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Customer List (5 cols) */}
        <div className="lg:col-span-5 bg-white  rounded-[18px] border border-[#E8EBF2]  shadow-xs overflow-hidden flex flex-col">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-[#E8EBF2]  space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50  border border-slate-200  rounded-xl focus:outline-hidden focus:border-[#2563EB]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100  rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white  text-[#2563EB] shadow-xs font-bold'
                    : 'text-slate-600 '
                }`}
              >
                All ({enrichedCustomers.length})
              </button>
              <button
                onClick={() => setFilterMode('debtors')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'debtors'
                    ? 'bg-white  text-rose-600 shadow-xs font-bold'
                    : 'text-slate-600 '
                }`}
              >
                Udhaar Due ({totalDebtorsCount})
              </button>
              <button
                onClick={() => setFilterMode('high_loyalty')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'high_loyalty'
                    ? 'bg-white  text-[#2563EB] shadow-xs font-bold'
                    : 'text-slate-600 '
                }`}
              >
                VIP Loyalty
              </button>
            </div>
          </div>

          {/* Customer Scroll List */}
          <div className="divide-y divide-slate-100  max-h-[580px] overflow-y-auto no-scrollbar">
            {filteredList.map((c) => {
              const isSelected = selectedCust.id === c.id;
              const hasDebt = (c.unpaidDue || 0) > 0;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCust(c)}
                  className={`p-3.5 transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-[#E8F0FE]  border-l-4 border-l-[#2563EB]'
                      : 'hover:bg-slate-50 '
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101828]  text-sm">{c.name}</span>
                    {hasDebt ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 ">
                        Due: Rs {c.unpaidDue?.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 ">
                        Paid
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{c.phone} · {c.city}</span>
                    <span className="font-semibold text-slate-700 ">
                      Spend: Rs {c.totalSpend.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{c.totalVisits} store visits</span>
                    <span className="text-[#2563EB] font-bold">{c.loyaltyPoints} Pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Customer Detail Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Profile Info */}
          <div className="bg-white  rounded-[18px] border border-[#E8EBF2]  p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#101828] ">
                    {selectedCust.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 ">
                    {selectedCust.loyaltyTier} Tier
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCust.phone}</span>
                  </span>
                  <span>·</span>
                  <span>{selectedCust.city}</span>
                  <span>·</span>
                  <span>Last visited: {selectedCust.lastVisitDate}</span>
                </div>
              </div>

              {/* Outstanding Debt Box */}
              {(selectedCust.unpaidDue || 0) > 0 ? (
                <div className="p-3 bg-rose-50  border border-rose-200  rounded-xl text-right">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                    Payment Not Paid (Udhaar)
                  </span>
                  <div className="text-xl font-black text-rose-700  mt-0.5">
                    Rs {selectedCust.unpaidDue?.toLocaleString('en-IN')}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50  border border-emerald-200 rounded-xl text-right">
                  <span className="text-[10px] font-bold text-emerald-700 block">All Bills Cleared</span>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">Zero Pending Debt</div>
                </div>
              )}
            </div>

            {/* The 4 Specific Customer Options Required */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 ">
              {/* Option 1: Total Spend */}
              <div className="p-3 bg-slate-50  rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold block">Total Spend</span>
                <div className="text-base font-bold text-[#101828]  mt-0.5">
                  Rs {selectedCust.totalSpend.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Option 2: Average Order Value */}
              <div className="p-3 bg-slate-50  rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold block">Avg Order Value (AOV)</span>
                <div className="text-base font-bold text-[#101828]  mt-0.5">
                  Rs {Math.round(selectedCust.totalSpend / Math.max(1, selectedCust.totalVisits)).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Option 3: Total Store Visits */}
              <div className="p-3 bg-slate-50  rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold block">Total Store Visits</span>
                <div className="text-base font-bold text-[#101828]  mt-0.5">
                  {selectedCust.totalVisits} Visits
                </div>
              </div>

              {/* Option 4: Customer Loyalty Points */}
              <div className="p-3 bg-[#E8F0FE]  rounded-xl text-center border border-[#2563EB]/20">
                <span className="text-[10px] text-[#2563EB] font-bold block">Loyalty Points</span>
                <div className="text-base font-bold text-[#2563EB] mt-0.5">
                  {selectedCust.loyaltyPoints} Pts
                </div>
              </div>
            </div>
          </div>

          {/* Payment Reminder Option for Debtors */}
          {(selectedCust.unpaidDue || 0) > 0 && (
            <div className="bg-white  rounded-[18px] border-2 border-rose-200  p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-[#101828] ">
                    Send Payment Reminder for Debtors (With UPI Payment Link)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Instant Payment Link
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Send a pre-filled polite payment reminder via WhatsApp or SMS with instant UPI payment link for this customer.
              </p>

              {/* Message Preview */}
              <div className="p-3.5 bg-slate-50  rounded-xl border border-slate-200  text-xs font-mono text-slate-800  leading-relaxed">
                {paymentReminderText}
              </div>

              {/* Action Buttons (Gradient Blue only) */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={handleCopyPaymentLink}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200   text-slate-800  rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Payment Link'}</span>
                </button>

                <button
                  onClick={() => handleSendReminder('sms')}
                  className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via SMS</span>
                </button>

                <button
                  onClick={() => handleSendReminder('whatsapp')}
                  className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Promotion Message Action Box */}
          <div className="bg-white  rounded-[18px] border border-[#E8EBF2]  p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#101828] ">
                  Send Promotion Message to {selectedCust.name}
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-[#2563EB] bg-[#E8F0FE] px-2 py-0.5 rounded">
                Personalized
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Select an offer template to send promotional messages directly to this customer's mobile number.
            </p>

            {/* Template Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPromoTemplate('festive')}
                className={`p-2.5 rounded-xl text-left border text-xs font-semibold cursor-pointer transition-all ${
                  promoTemplate === 'festive'
                    ? 'border-[#2563EB] bg-[#E8F0FE] text-[#2563EB]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Festive 15% OFF
              </button>
              <button
                type="button"
                onClick={() => setPromoTemplate('loyalty')}
                className={`p-2.5 rounded-xl text-left border text-xs font-semibold cursor-pointer transition-all ${
                  promoTemplate === 'loyalty'
                    ? 'border-[#2563EB] bg-[#E8F0FE] text-[#2563EB]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Redeem Loyalty Pts
              </button>
              <button
                type="button"
                onClick={() => setPromoTemplate('winback')}
                className={`p-2.5 rounded-xl text-left border text-xs font-semibold cursor-pointer transition-all ${
                  promoTemplate === 'winback'
                    ? 'border-[#2563EB] bg-[#E8F0FE] text-[#2563EB]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                We Miss You Gift
              </button>
            </div>

            {/* Message Preview */}
            <div className="p-3.5 bg-slate-50  rounded-xl border border-slate-200  text-xs font-mono text-slate-800  leading-relaxed">
              {promoMessageText}
            </div>

            {/* Send Promotion Buttons (Gradient Blue only) */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                onClick={() => handleSendPromotion('sms')}
                className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Promo via SMS</span>
              </button>
              <button
                onClick={() => handleSendPromotion('whatsapp')}
                className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Promo via WhatsApp</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Broadcast Promotion Modal */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white  rounded-3xl shadow-2xl border border-slate-200  w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 ">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#101828] ">
                  Send Customer Promotion Campaign
                </h3>
              </div>
              <button
                onClick={() => setPromoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Broadcast special retail promotional offers and discount coupons to {selectedCust.name} or your entire customer database.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 ">
                Campaign Message:
              </label>
              <textarea
                rows={4}
                value={promoMessageText}
                readOnly
                className="w-full p-3 text-xs bg-slate-50  border border-slate-200  rounded-xl font-mono leading-relaxed focus:outline-hidden"
              />
            </div>

            {promoNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{promoNotice}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 ">
              <button
                onClick={() => setPromoModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendPromotion('whatsapp')}
                className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Broadcast on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
