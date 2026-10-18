import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Sale } from '../types';
import { TenderModal } from './pos/TenderModal';
import { ThermalReceiptModal } from './pos/ThermalReceiptModal';
import {
  Search,
  Barcode,
  Mic,
  MicOff,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  User,
  CreditCard,
  PauseCircle,
  PlayCircle,
  Tag,
  RotateCcw,
  Check,
  Filter,
  ArrowUpDown,
  ChevronDown,
  X,
} from 'lucide-react';
import { CandyButton } from '../design-system/components/CandyButton';

export interface PosTerminalProps {
  onToggleMobileSidebar?: () => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = () => {
  const {
    products,
    currentLocation,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    setCartItemDiscount,
    clearCart,
    holdCurrentCart,
    heldCarts,
    resumeHeldCart,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    calculateCartTotals,
    addNewCustomer,
    processReturnProduct,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isTenderOpen, setIsTenderOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiCrossSells, setAiCrossSells] = useState<any[]>([]);

  // New Customer Modal State
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustError, setNewCustError] = useState('');

  // Return Product Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnProductId, setReturnProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnRefundAmount, setReturnRefundAmount] = useState(0);
  const [returnReason, setReturnReason] = useState('Customer return or exchange');
  const [returnCustomerName, setReturnCustomerName] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const totals = calculateCartTotals();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play audio beep on barcode scan or item add
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch {
      // Audio muted or not allowed
    }
  };

  // Categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered and Sorted products
  const filteredProducts = products
    .filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'stock-desc') {
        const stockA = a.stockOnHand[currentLocation.id] || 0;
        const stockB = b.stockOnHand[currentLocation.id] || 0;
        return stockB - stockA;
      }
      if (sortBy === 'stock-asc') {
        const stockA = a.stockOnHand[currentLocation.id] || 0;
        const stockB = b.stockOnHand[currentLocation.id] || 0;
        return stockA - stockB;
      }
      return 0;
    });

  // Handle direct barcode or SKU scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = products.find(
      (p) =>
        p.barcode === searchQuery.trim() ||
        p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      playBeep();
      setSearchQuery('');
    }
  };

  // Voice Search simulation
  const toggleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Fetch AI Cross-Sell Suggestions
  useEffect(() => {
    if (cart.length === 0) {
      setAiCrossSells([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/cross-sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cart,
            availableProducts: products,
          }),
        });
        const data = await res.json();
        setAiCrossSells(data.recommendations || []);
      } catch (err) {
        console.error('Cross-sell fetch failed', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cart, products]);

  const handleSaleSuccess = (finalSale: Sale) => {
    setIsTenderOpen(false);
    setCompletedSale(finalSale);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* LEFT: Product Catalog & Fast Scanner (Clean & Compact) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200/90 overflow-hidden bg-white">
        {/* Clean Header: Only Search Bar, Scan, Filter (All Categories), and Sort */}
        <div className="p-3 border-b border-slate-200/90 bg-white shrink-0">
          <div className="flex items-center gap-2">
            {/* 1. Search Bar */}
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode, type SKU or product name... (Press Enter to add)"
                className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
              />
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`absolute right-2.5 top-2 p-1 rounded-md transition-colors cursor-pointer ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </form>

            {/* 2. Scan Button */}
            <button
              onClick={handleBarcodeSubmit}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Add by Barcode"
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scan</span>
            </button>

            {/* 3. Filter Option (Contains all product categories) */}
            <div ref={filterRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                  selectedCategory !== 'All'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
                title="Filter by product category"
              >
                <Filter className={`w-3.5 h-3.5 ${selectedCategory !== 'All' ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className="max-w-[120px] truncate">
                  {selectedCategory === 'All' ? 'Filter' : selectedCategory}
                </span>
                {selectedCategory !== 'All' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100 max-h-72 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Product Categories
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {categories.map((cat) => {
                      const count =
                        cat === 'All'
                          ? products.length
                          : products.filter((p) => p.category === cat).length;
                      const isSelected = selectedCategory === cat;

                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-700 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <span className="truncate">{cat === 'All' ? 'All Categories' : cat}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Sort Option */}
            <div ref={sortRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                  sortBy !== 'featured'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
                title="Sort products"
              >
                <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy !== 'featured' ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>Sort</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100 space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sort Products
                  </div>
                  {[
                    { id: 'featured', label: 'Default / Featured' },
                    { id: 'name-asc', label: 'Name (A to Z)' },
                    { id: 'name-desc', label: 'Name (Z to A)' },
                    { id: 'price-asc', label: 'Price (Low to High)' },
                    { id: 'price-desc', label: 'Price (High to Low)' },
                    { id: 'stock-desc', label: 'Stock (High to Low)' },
                    { id: 'stock-asc', label: 'Stock (Low to High)' },
                  ].map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Catalog Display: Exactly 3 cards in one line */}
        <div className="flex-1 p-3 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-2 opacity-50" />
              <div className="text-xs font-bold text-slate-600">No products match your search</div>
              <div className="text-[11px] text-slate-400">Try searching by SKU, barcode, or category</div>
            </div>
          ) : (
            /* Exactly 3 cards in one line */
            <div className="grid grid-cols-3 gap-3.5">
              {filteredProducts.map((product) => {
                const stock = product.stockOnHand[currentLocation.id] || 0;
                const isLow = stock <= product.reorderPoint;
                const isOutOfStock = stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCart(product);
                        playBeep();
                      }
                    }}
                    className={`bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all select-none group shadow-2xs hover:shadow-xs ${
                      isOutOfStock
                        ? 'opacity-60 border-slate-200 cursor-not-allowed bg-slate-50'
                        : 'border-slate-200/90 hover:border-indigo-400 cursor-pointer hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400 font-medium truncate max-w-[100px]">
                          {product.category}
                        </span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9px] ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : `${stock} in stock`}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h4>

                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SKU: {product.sku}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
                        ₹{product.sellingPrice.toLocaleString('en-IN')}
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            addToCart(product);
                            playBeep();
                          }
                        }}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-2xs'
                        }`}
                        title="Add to Bill"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Bill Ticket & Fast Checkout (Compact, non-lengthy) */}
      <div className="w-full lg:w-[380px] xl:w-[400px] shrink-0 bg-white flex flex-col justify-between shadow-xs border-l border-slate-200/90">
        {/* Customer Selector & Quick Hold Bar */}
        <div className="p-3 border-b border-slate-200/90 bg-slate-50/70 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Current Bill ({cart.reduce((a, b) => a + b.quantity, 0)} Items)</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* New Bill Button */}
              <button
                onClick={() => {
                  clearCart();
                  setSelectedCustomer(null);
                }}
                className="text-[11px] px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Start a fresh blank bill"
              >
                <Plus className="w-3 h-3" />
                <span>New Bill</span>
              </button>

              {/* Return Product Option */}
              <button
                onClick={() => {
                  setReturnProductId(products[0]?.id || '');
                  setReturnRefundAmount(products[0]?.sellingPrice || 0);
                  setIsReturnModalOpen(true);
                }}
                className="text-[11px] px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Return product from customer"
              >
                <RotateCcw className="w-3 h-3 text-amber-700" />
                <span>Return Item</span>
              </button>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold px-1.5 py-1 cursor-pointer"
                  title="Clear items"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Customer Attachment & New Customer Option */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const cust = customers.find((c) => c.id === e.target.value) || null;
                  setSelectedCustomer(cust);
                }}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Add New Customer Button */}
            <button
              onClick={() => {
                setNewCustError('');
                setIsNewCustomerModalOpen(true);
              }}
              className="h-[30px] px-2.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Add New Customer with Name, Phone, and Address"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            {selectedCustomer && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg shrink-0">
                {selectedCustomer.loyaltyTier}
              </span>
            )}
          </div>

          {/* Held Carts quick resumption */}
          {heldCarts.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[10px] text-slate-500 font-bold shrink-0">Held Bills:</span>
              {heldCarts.map((h) => (
                <button
                  key={h.id}
                  onClick={() => resumeHeldCart(h.id)}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <PlayCircle className="w-3 h-3 text-amber-600" />
                  <span>{h.customerName || 'Cart'} (₹{h.total})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart Item Rows (Clean and scroll-contained) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-2 opacity-40" />
              <div className="text-xs font-bold text-slate-600">No items in active bill</div>
              <div className="text-[11px] text-slate-400">Scan barcode or tap products to begin</div>
            </div>
          ) : (
            cart.map((item) => {
              const lineBase = item.unitPrice * item.quantity;
              const discountAmt = (lineBase * item.discountPercent) / 100;
              const lineTotal = lineBase - discountAmt;

              return (
                <div
                  key={item.product.id}
                  className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ₹{item.unitPrice} each · GST {item.product.taxRate}%
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    {/* Stepper */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Discount Input */}
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent || ''}
                        placeholder="0%"
                        onChange={(e) =>
                          setCartItemDiscount(item.product.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-11 text-center text-[10px] font-mono border border-slate-200 rounded bg-white py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                      <span className="text-[10px] text-slate-400">%</span>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-900">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </div>
                      {item.discountPercent > 0 && (
                        <div className="text-[9px] text-emerald-600 font-mono">
                          -₹{discountAmt.toFixed(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Slim 1-line AI Recommendation Pill (non-intrusive) */}
          {aiCrossSells.length > 0 && cart.length > 0 && (
            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-medium text-indigo-900 truncate">
                  Suggested: {products.find(p => p.id === aiCrossSells[0]?.productId)?.name || 'Add-on'}
                </span>
              </div>
              <button
                onClick={() => {
                  const target = products.find(p => p.id === aiCrossSells[0]?.productId);
                  if (target) {
                    addToCart(target);
                    playBeep();
                  }
                }}
                className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
              >
                + Add
              </button>
            </div>
          )}
        </div>

        {/* Bill Calculation Foot & Checkout Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2.5 shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discounts</span>
                <span className="font-mono">-₹{totals.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Taxes (CGST + SGST)</span>
              <span className="font-mono">₹{totals.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
              <span className="font-extrabold text-xs text-slate-900 font-heading">Total Payable</span>
              <span className="font-mono text-lg font-black text-indigo-900 tabular-nums">
                ₹{totals.roundedTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => holdCurrentCart()}
              disabled={cart.length === 0}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Hold</span>
            </button>

            <button
              onClick={() => setIsTenderOpen(true)}
              disabled={cart.length === 0}
              className="col-span-2 py-2.5 px-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Complete Sale (Pay ₹{totals.roundedTotal.toLocaleString('en-IN')})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tender Modal */}
      <TenderModal
        isOpen={isTenderOpen}
        onClose={() => setIsTenderOpen(false)}
        onSuccess={handleSaleSuccess}
      />

      {/* Printable Thermal Receipt Modal */}
      <ThermalReceiptModal
        sale={completedSale}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setCompletedSale(null);
        }}
      />

      {/* ADD NEW CUSTOMER MODAL */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
                  <p className="text-[11px] text-slate-500">Create profile and attach to current bill</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newCustError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {newCustError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustName.trim() || !newCustPhone.trim()) {
                  setNewCustError('Please enter Customer Full Name and Contact Number');
                  return;
                }
                addNewCustomer({
                  name: newCustName.trim(),
                  phone: newCustPhone.trim(),
                  address: newCustAddress.trim(),
                  email: newCustEmail.trim(),
                });
                setNewCustName('');
                setNewCustPhone('');
                setNewCustAddress('');
                setNewCustEmail('');
                setNewCustError('');
                setIsNewCustomerModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number (Phone) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98112 34567"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flat 402, Shivalik Tower, Connaught Place, New Delhi"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save & Attach to Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN PRODUCT MODAL */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Return & Restock Item</h3>
                  <p className="text-[11px] text-slate-500">Restock inventory and process customer refund</p>
                </div>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {returnSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-1">
                <Check className="w-6 h-6 mx-auto text-emerald-600" />
                <div className="font-bold text-xs">{returnSuccessMsg}</div>
                <p className="text-[11px] text-emerald-700">Stock updated and return ledger recorded.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!returnProductId) return;
                  const ok = processReturnProduct(
                    returnProductId,
                    returnQty,
                    returnRefundAmount,
                    returnReason,
                    returnCustomerName || selectedCustomer?.name
                  );
                  if (ok) {
                    setReturnSuccessMsg(`Item returned and ${returnQty} units restocked into inventory.`);
                    setTimeout(() => {
                      setReturnSuccessMsg('');
                      setIsReturnModalOpen(false);
                      setReturnProductId('');
                      setReturnQty(1);
                      setReturnRefundAmount(0);
                    }, 1500);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Product to Return
                  </label>
                  <select
                    value={returnProductId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setReturnProductId(pid);
                      const prod = products.find((p) => p.id === pid);
                      if (prod) {
                        setReturnRefundAmount(prod.sellingPrice * returnQty);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.sellingPrice} · Stock: {p.stockOnHand[currentLocation.id] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Return Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={returnQty}
                      onChange={(e) => {
                        const q = parseInt(e.target.value, 10) || 1;
                        setReturnQty(q);
                        const prod = products.find((p) => p.id === returnProductId);
                        if (prod) {
                          setReturnRefundAmount(prod.sellingPrice * q);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Refund Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={returnRefundAmount}
                      onChange={(e) => setReturnRefundAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Return
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Customer return or exchange">Customer return or exchange</option>
                    <option value="Defective or malfunctioning item">Defective or malfunctioning item</option>
                    <option value="Wrong product or specification">Wrong product or specification</option>
                    <option value="Dissatisfied with product">Dissatisfied with product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
                    value={returnCustomerName}
                    onChange={(e) => setReturnCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Confirm Return & Restock
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
