import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle2,
  FileQuestion,
  PhoneCall,
  Mail,
  Zap,
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How do I start billing an item using a USB or Bluetooth barcode scanner?',
      a: 'Plug in any standard USB HID or Bluetooth barcode reader. Click into the search bar or press Enter on the POS Terminal. Scanning the barcode will automatically match the SKU and append the item to your active cart with audio confirmation.',
    },
    {
      q: 'Can I bill customers when the internet or Wi-Fi is temporarily disconnected?',
      a: 'Yes! DukaanIQ has a built-in offline billing queue. When offline, sales are securely saved to local storage with deterministic tax calculations. Once internet connectivity is restored, click "Sync Offline Queue" to upload sales to the cloud.',
    },
    {
      q: 'How are CGST and SGST taxes calculated on my bills?',
      a: 'Taxes are deterministically partitioned based on the product HSN code. For intrastate transactions within your store state, tax is split evenly into 50% CGST and 50% SGST. For interstate shipping, IGST is applied.',
    },
    {
      q: 'How do I send customer balance payment links via WhatsApp?',
      a: 'Open the "Customer Accounts" tab or click "Send Reminder" on the Dashboard. DukaanIQ generates a polite payment link with your store UPI VPA and exact outstanding balance ready to copy or send directly in WhatsApp.',
    },
    {
      q: 'How do I close the cashier shift and verify cash drawer float?',
      a: 'Navigate to "Staff & Shifts" in the sidebar. Click "Close Shift", enter the counted physical cash in your drawer, and the system instantly audits for any cash variance against finalized sales.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setTicketSubmitted(true);
    setTicketMessage('');
    setTimeout(() => setTicketSubmitted(false), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Help & Retail Support Center
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Step-by-step guides, POS keyboard shortcuts, video tutorials, and dedicated merchant support.
        </p>

        {/* Search */}
        <div className="relative max-w-xl mt-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, billing questions, printer setup..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Quick Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-900 font-heading">Quick Setup Guide</div>
          <p className="text-[11px] text-slate-500">
            Learn how to import inventory spreadsheets, configure your store GSTIN, and pair thermal printers.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-900 font-heading">Priority Merchant Helpline</div>
          <p className="text-[11px] text-slate-500">
            Direct hotline for active Growth and Enterprise subscribers: <strong>+91 80 4719 3200</strong>
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-900 font-heading">Dedicated Email Support</div>
          <p className="text-[11px] text-slate-500">
            Average response time under 15 minutes during standard Indian business hours.
          </p>
        </div>
      </div>

      {/* POS Keyboard Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            POS Billing Keyboard Shortcuts
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'Enter', action: 'Scan / Add Item to Cart' },
            { key: 'Space', action: 'Open Payment / Tender Window' },
            { key: 'Ctrl + H', action: 'Hold Current Customer Cart' },
            { key: 'Esc', action: 'Clear Current Search / Reset' },
          ].map((item, i) => (
            <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-slate-300 rounded shadow-2xs text-slate-800">
                {item.key}
              </kbd>
              <div className="text-[11px] text-slate-600 font-medium mt-1">{item.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-indigo-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4 text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="mt-2 text-xs text-slate-600 leading-relaxed pl-2 border-l-2 border-indigo-200 animate-in fade-in duration-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Support Ticket */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Ask Retail Support</span>
        </h3>

        {ticketSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Support ticket submitted! A retail specialist will get in touch shortly.</span>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-3">
            <textarea
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Describe your issue or question (e.g. Setting up thermal printer, tax discrepancy, Tally export)..."
              rows={3}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Ticket</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
