import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Search,
  CheckCircle2,
  ExternalLink,
  Settings,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface IntegrationApp {
  id: string;
  name: string;
  category: 'erp' | 'payment';
  categoryLabel: 'ERP Integration' | 'Payment Integration';
  tagline: string;
  description: string;
  iconBg: string;
  badge?: string;
  isConnected: boolean;
  lastSync?: string;
  steps: { step: number; title: string; instruction: string }[];
  defaultCredentials: { key: string; label: string; placeholder: string; value?: string }[];
}

export const IntegrationsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'erp' | 'payment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'status'>('popular');
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);
  const [modalStep, setModalStep] = useState<number>(1);
  const [testSyncLoading, setTestSyncLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>({
    'pine-labs': true,
    'razorpay': true,
    'tally': true,
  });

  const apps: IntegrationApp[] = [
    {
      id: 'tally',
      name: 'Tally Prime',
      category: 'erp',
      categoryLabel: 'ERP Integration',
      tagline: 'Automated Day-End Vouchers & Ledger Sync',
      description: 'Pushes all daily retail sales invoices, returns, supplier purchase vouchers and GST taxes directly into Tally Prime via XML/JSON bridge.',
      iconBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badge: 'Most Popular ERP',
      isConnected: !!connectedIds['tally'],
      lastSync: 'Today at 02:30 PM',
      steps: [
        { step: 1, title: 'Open Tally Prime & Enable ODBC', instruction: 'In Tally Prime, press F1 -> Settings -> Connectivity -> Enable ODBC Server on Port 9000.' },
        { step: 2, title: 'Enter Tally IP & Port', instruction: 'Enter your local store Tally server IP (e.g. 192.168.1.100) or DukaanIQ Cloud Sync Agent key below.' },
        { step: 3, title: 'Select Ledger & Test Sync', instruction: 'Map default Sales Ledger, Cash in Hand, and CGST/SGST ledger accounts and press Test Connection.' },
      ],
      defaultCredentials: [
        { key: 'tallyIp', label: 'Tally Server IP Address', placeholder: '127.0.0.1', value: '192.168.1.105' },
        { key: 'tallyPort', label: 'Tally ODBC Port', placeholder: '9000', value: '9000' },
        { key: 'companyName', label: 'Tally Company Name', placeholder: 'Apex Retail Enterprises 2026-27' },
      ],
    },
    {
      id: 'sap-b1',
      name: 'SAP Business One',
      category: 'erp',
      categoryLabel: 'ERP Integration',
      tagline: 'Enterprise Multi-Warehouse ERP Connector',
      description: 'Synchronizes item master, branch stock balances, purchase orders and general ledger postings across enterprise retail chains.',
      iconBg: 'bg-blue-100 text-blue-900 border-blue-300',
      isConnected: !!connectedIds['sap-b1'],
      steps: [
        { step: 1, title: 'SAP Service Layer URL', instruction: 'Enter your SAP Business One HANA or SQL Service Layer endpoint.' },
        { step: 2, title: 'B1 Company Database & Credentials', instruction: 'Provide user credentials with B1 DI-API / Service Layer integration permissions.' },
        { step: 3, title: 'Map Warehouse & Item Master', instruction: 'Select the target SAP Warehouse Code (e.g. WH-DELHI-01) for inventory adjustments.' },
      ],
      defaultCredentials: [
        { key: 'serviceUrl', label: 'Service Layer Endpoint', placeholder: 'https://sap-server.store.in:50000/b1s/v2' },
        { key: 'companyDb', label: 'Company Database', placeholder: 'APEX_RETAIL_PROD' },
        { key: 'b1User', label: 'Integration Username', placeholder: 'B1_API_USER' },
      ],
    },
    {
      id: 'zoho-books',
      name: 'Zoho Books',
      category: 'erp',
      categoryLabel: 'ERP Integration',
      tagline: 'Real-time Cloud Accounting & GST Invoicing',
      description: 'Auto-creates customer contacts, item rate lists, debit/credit notes, and syncs finalized bills directly to Zoho Books.',
      iconBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      isConnected: !!connectedIds['zoho-books'],
      steps: [
        { step: 1, title: 'Generate Zoho OAuth Token', instruction: 'Login to Zoho API Console, create self-client or server-based application and copy Client ID.' },
        { step: 2, title: 'Enter Zoho Organization ID', instruction: 'Find your 9-digit Organization ID in Zoho Books Settings -> Organization Profile.' },
        { step: 3, title: 'Confirm Automatic Sync Frequency', instruction: 'Choose whether invoices sync immediately on finalize or in bulk at day-end.' },
      ],
      defaultCredentials: [
        { key: 'orgId', label: 'Zoho Organization ID', placeholder: '802341928' },
        { key: 'clientId', label: 'Client ID', placeholder: '1000.XXXXX' },
        { key: 'clientSecret', label: 'Client Secret', placeholder: '••••••••••••••••' },
      ],
    },
    {
      id: 'shopify',
      name: 'Shopify Store',
      category: 'erp',
      categoryLabel: 'ERP Integration',
      tagline: 'Omnichannel Online & In-Store Inventory Lock',
      description: 'Connects your online Shopify store with retail shop counter. When an item sells in Delhi store, online stock immediately decreases.',
      iconBg: 'bg-green-100 text-green-900 border-green-300',
      badge: 'Omnichannel',
      isConnected: !!connectedIds['shopify'],
      steps: [
        { step: 1, title: 'Install DukaanIQ Custom App', instruction: 'In Shopify Admin -> Apps -> Develop apps -> Create custom app with Read/Write Inventory permissions.' },
        { step: 2, title: 'Paste Admin API Access Token', instruction: 'Copy the Admin API token starting with shpat_ and paste below.' },
        { step: 3, title: 'Select Location to Sync', instruction: 'Choose which physical shop location maps to your Shopify fulfillment location.' },
      ],
      defaultCredentials: [
        { key: 'storeUrl', label: 'Shopify Store URL', placeholder: 'apexretail.myshopify.com' },
        { key: 'apiToken', label: 'Admin API Access Token', placeholder: 'shpat_••••••••••••••••••••••••' },
      ],
    },
    {
      id: 'eway-bill',
      name: 'E-Way Bill Portal (NIC)',
      category: 'erp',
      categoryLabel: 'ERP Integration',
      tagline: 'Instant 1-Click E-Way Bill for B2B Shipments',
      description: 'Direct government NIC portal integration. Generates E-Way Bill number and printable QR code for invoices above Rs 50,000 without logging into GST portal.',
      iconBg: 'bg-purple-100 text-purple-900 border-purple-300',
      isConnected: !!connectedIds['eway-bill'],
      steps: [
        { step: 1, title: 'Register on E-Way Bill API', instruction: 'Go to ewaybillgst.gov.in -> Registration -> For GSP/API and register DukaanIQ as your ERP.' },
        { step: 2, title: 'Enter GSTIN & API Credentials', instruction: 'Enter your 15-digit GSTIN and the API username & password generated on the portal.' },
        { step: 3, title: 'Set Default Vehicle & Transporter', instruction: 'Specify default distance calculation and transporter ID to speed up checkout.' },
      ],
      defaultCredentials: [
        { key: 'gstin', label: 'Registered GSTIN', placeholder: '07AAAAA0000A1Z5', value: '07AAAAA1234F1Z8' },
        { key: 'apiUser', label: 'E-Way Bill API Username', placeholder: 'APEX_EWAY_API' },
        { key: 'apiPassword', label: 'API Password', placeholder: '••••••••' },
      ],
    },
    {
      id: 'pine-labs',
      name: 'Pine Labs POS',
      category: 'payment',
      categoryLabel: 'Payment Integration',
      tagline: 'Smart Android EDC Card Machine Auto-Push',
      description: 'Pushes exact checkout bill amount to Pine Labs Plutus POS machine automatically. Cashier does not need to type the amount on the keypad.',
      iconBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badge: 'Auto Terminal Push',
      isConnected: !!connectedIds['pine-labs'],
      lastSync: 'Live Connected',
      steps: [
        { step: 1, title: 'Connect Pine Labs EDC to Wi-Fi', instruction: 'Ensure Pine Labs machine is connected to the same Wi-Fi network as this billing PC.' },
        { step: 2, title: 'Enter Terminal ID (TID)', instruction: 'Find the 8-digit TID on the back of the Pine Labs machine or on any printed receipt.' },
        { step: 3, title: 'Pair & Send Test Ping', instruction: 'Press Test Sync to send a test Rs 1 authorization ping to the screen.' },
      ],
      defaultCredentials: [
        { key: 'tid', label: 'Terminal ID (TID)', placeholder: '89102456', value: '89102456' },
        { key: 'edcIp', label: 'Pine Labs Terminal IP', placeholder: '192.168.1.55', value: '192.168.1.55' },
      ],
    },
    {
      id: 'paytm-edc',
      name: 'Paytm EDC & Soundbox',
      category: 'payment',
      categoryLabel: 'Payment Integration',
      tagline: 'Card Swiper & Audio Payment Announcement',
      description: 'Instant payment voice alert ("Paytm par Rs 450 prapt hue") plus automatic swipe payment confirmation right on the billing screen.',
      iconBg: 'bg-sky-100 text-sky-900 border-sky-300',
      isConnected: !!connectedIds['paytm-edc'],
      steps: [
        { step: 1, title: 'Get Merchant ID (MID) from Paytm Dashboard', instruction: 'Log in to Paytm for Business and locate your 20-digit Merchant ID.' },
        { step: 2, title: 'Enter Soundbox / EDC Device Serial', instruction: 'Enter the barcode device serial number printed under your Soundbox device.' },
        { step: 3, title: 'Authorize Webhook', instruction: 'Enable real-time payment confirmation notifications for counter billing.' },
      ],
      defaultCredentials: [
        { key: 'mid', label: 'Paytm Merchant ID (MID)', placeholder: 'PAYTM_MID_9823481238' },
        { key: 'deviceSerial', label: 'Soundbox / Device Serial Number', placeholder: 'SNDBX-98124' },
      ],
    },
    {
      id: 'razorpay',
      name: 'Razorpay POS',
      category: 'payment',
      categoryLabel: 'Payment Integration',
      tagline: 'Dynamic QR & Tap-and-Pay NFC Terminal',
      description: 'Displays customer-facing dynamic UPI QR code with auto-reconcile, supports BharatQR, contactless Tap-to-Phone and credit card EMI.',
      iconBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badge: 'Dynamic UPI QR',
      isConnected: !!connectedIds['razorpay'],
      lastSync: 'Live Connected',
      steps: [
        { step: 1, title: 'Razorpay API Key ID & Secret', instruction: 'Generate API keys in Razorpay Dashboard -> Settings -> API Keys.' },
        { step: 2, title: 'Pair Smart Terminal ID', instruction: 'Enter your Razorpay POS Device Serial or use Dynamic Screen QR generation.' },
        { step: 3, title: 'Verify Webhook Callback', instruction: 'Confirm the webhook URL to receive instant payment success notifications.' },
      ],
      defaultCredentials: [
        { key: 'keyId', label: 'Razorpay Key ID', placeholder: 'rzp_live_••••••••', value: 'rzp_live_89a24bc109' },
        { key: 'keySecret', label: 'Razorpay Key Secret', placeholder: '••••••••••••••••', value: '••••••••••••••••' },
      ],
    },
  ];

  // Filtering & Sorting
  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
        const matchesSearch =
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'status') return Number(b.isConnected) - Number(a.isConnected);
        return 0; // default popular
      });
  }, [apps, activeCategory, searchQuery, sortBy]);

  const handleOpenConfig = (app: IntegrationApp) => {
    setSelectedApp(app);
    setModalStep(1);
    setTestSuccess(false);
  };

  const handleTestConnection = () => {
    setTestSyncLoading(true);
    setTestSuccess(false);
    setTimeout(() => {
      setTestSyncLoading(false);
      setTestSuccess(true);
      if (selectedApp) {
        setConnectedIds((prev) => ({ ...prev, [selectedApp.id]: true }));
      }
    }, 1200);
  };

  const handleToggleDisconnect = (appId: string) => {
    setConnectedIds((prev) => ({ ...prev, [appId]: !prev[appId] }));
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#101828] ">
              ERP & Payment Integrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 ">
              3 Active Connections
            </span>
          </div>
          <p className="text-xs text-[#667085]  mt-1">
            Connect your DukaanIQ retail counter with popular accounting software, smart EDC machines, and government GST portals.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white  p-3.5 rounded-[16px] border border-[#E8EBF2]  shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100  rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white  text-[#2563EB] shadow-xs font-bold'
                : 'text-slate-600  hover:text-slate-900'
            }`}
          >
            All Integrations ({apps.length})
          </button>
          <button
            onClick={() => setActiveCategory('erp')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeCategory === 'erp'
                ? 'bg-white  text-[#2563EB] shadow-xs font-bold'
                : 'text-slate-600  hover:text-slate-900'
            }`}
          >
            ERP Integration ({apps.filter((a) => a.category === 'erp').length})
          </button>
          <button
            onClick={() => setActiveCategory('payment')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeCategory === 'payment'
                ? 'bg-white  text-[#2563EB] shadow-xs font-bold'
                : 'text-slate-600  hover:text-slate-900'
            }`}
          >
            Payment Integration ({apps.filter((a) => a.category === 'payment').length})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ERP, EDC or portal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50  border border-slate-200  rounded-xl focus:outline-hidden focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50  border border-slate-200  rounded-xl text-xs font-medium cursor-pointer focus:outline-hidden"
            >
              <option value="popular">Popular First</option>
              <option value="name">Name (A-Z)</option>
              <option value="status">Connected First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white  rounded-[18px] border border-[#E8EBF2]  p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Top: Icon & Status */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm border ${app.iconBg}`}
                >
                  {app.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex flex-col items-end gap-1">
                  {app.isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 ">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100  text-slate-500">
                      Not Connected
                    </span>
                  )}

                  {app.badge && (
                    <span className="text-[9px] font-bold text-[#2563EB] bg-[#E8F0FE]  px-1.5 py-0.5 rounded">
                      {app.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-base font-bold text-[#101828]  group-hover:text-[#2563EB] transition-colors">
                {app.name}
              </h3>
              <p className="text-[11px] font-semibold text-[#2563EB]  mt-0.5">
                {app.tagline}
              </p>
              <p className="text-xs text-[#667085]  mt-2 line-clamp-3 leading-relaxed">
                {app.description}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100  flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 capitalize">
                {app.categoryLabel}
              </span>

              <button
                onClick={() => handleOpenConfig(app)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  app.isConnected
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700  '
                    : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white shadow-xs'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{app.isConnected ? 'Configure' : 'Connect'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EASY INTEGRATION STEPS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white  rounded-3xl shadow-2xl border border-slate-200  w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100  flex items-center justify-between bg-slate-50/50 ">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${selectedApp.iconBg}`}
                >
                  {selectedApp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828] ">
                    {selectedApp.name} Setup Guide
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedApp.categoryLabel} · Easy 3-Step Setup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Step Navigation Pills */}
              <div className="grid grid-cols-3 gap-2">
                {selectedApp.steps.map((st) => (
                  <button
                    key={st.step}
                    onClick={() => setModalStep(st.step)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      modalStep === st.step
                        ? 'border-[#2563EB] bg-[#E8F0FE] '
                        : 'border-slate-200  hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[#2563EB]">STEP 0{st.step}</div>
                    <div className="text-xs font-semibold text-[#101828]  truncate">
                      {st.title}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Step Description */}
              <div className="p-4 bg-slate-50  rounded-2xl border border-slate-200 ">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {modalStep}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] ">
                      {selectedApp.steps[modalStep - 1].title}
                    </h4>
                    <p className="text-xs text-slate-600  mt-1 leading-relaxed">
                      {selectedApp.steps[modalStep - 1].instruction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credential Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700  uppercase tracking-wider">
                  Connection Credentials
                </h4>
                {selectedApp.defaultCredentials.map((cred) => (
                  <div key={cred.key}>
                    <label className="block text-xs font-semibold text-slate-700  mb-1">
                      {cred.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={cred.value || ''}
                      placeholder={cred.placeholder}
                      className="w-full px-3 py-2 text-xs bg-white  border border-slate-300  rounded-xl focus:outline-hidden focus:border-[#2563EB]"
                    />
                  </div>
                ))}
              </div>

              {/* Test Connection Output */}
              {testSuccess && (
                <div className="p-3.5 bg-emerald-50  border border-emerald-200  text-emerald-900  rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Connected Successfully!</span>
                    <span className="text-[11px] text-emerald-700 ">
                      Live heartbeat verified with {selectedApp.name}. Transactions will now sync automatically.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100  flex items-center justify-between bg-slate-50/50 ">
              <button
                type="button"
                onClick={() => handleToggleDisconnect(selectedApp.id)}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                {selectedApp.isConnected ? 'Disconnect Integration' : 'Reset Credentials'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testSyncLoading}
                  className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
                >
                  {testSyncLoading ? 'Testing Live Link...' : 'Test & Save Connection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
