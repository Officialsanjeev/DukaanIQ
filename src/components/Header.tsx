import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  ExternalLink,
  LogOut,
  Store,
  Download,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    activeView,
    setActiveView,
    products,
    addToCart,
    currentLocation,
    currentBusiness,
    currentUser,
    logout,
    openAuthModal,
  } = useApp();

  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Keyboard shortcut Ctrl+K focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResultsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingProducts = globalSearch.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.barcode.includes(globalSearch)
        )
        .slice(0, 5)
    : [];

  return (
    <header className="h-16 bg-white border-b border-[#E8EBF2] sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & Search Box */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden w-9 h-9 rounded-[10px] flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC] transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Box */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input
              id="global-search-input"
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchResultsOpen(true);
              }}
              onFocus={() => setSearchResultsOpen(true)}
              placeholder="Search products, orders or customers..."
              className="w-full h-10 pl-9 pr-14 text-[13px] bg-[#F2F4F7] border border-transparent rounded-[12px] text-[#101828] placeholder-[#98A2B3] focus:bg-white focus:outline-hidden focus:border-[#2563EB] focus:ring-3 focus:ring-[#93B4FA]/40 transition-all font-sans"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-[10px] font-semibold text-[#98A2B3] bg-white border border-[#E8EBF2] px-1.5 py-0.5 rounded shadow-2xs">
                Ctrl K
              </span>
            </div>
          </div>

          {/* Search Dropdown Results */}
          {searchResultsOpen && matchingProducts.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E8EBF2] rounded-[12px] shadow-lg overflow-hidden z-50">
              <div className="p-2 border-b border-[#E8EBF2] text-[11px] font-semibold text-[#667085] uppercase">
                Products ({matchingProducts.length})
              </div>
              <div className="divide-y divide-[#E8EBF2]/60 max-h-60 overflow-y-auto">
                {matchingProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      addToCart(p);
                      setActiveView('pos');
                      setSearchResultsOpen(false);
                      setGlobalSearch('');
                    }}
                    className="p-2.5 hover:bg-[#F2F4F7] transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#101828]">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        SKU: {p.sku} • In Stock: {p.stockOnHand[currentLocation.id] || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#2563EB]">
                        Rs {p.sellingPrice.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[#12A150] font-medium">+ Add to bill</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Bell, User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Store Indicator (pill) */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F5F9] border border-[#E8EBF2] rounded-[10px] text-[12px] text-[#667085]">
          <Store className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-medium text-[#101828]">
            {currentLocation.name.split('(')[0]}
          </span>
        </div>

        {/* Bell Notification Button (36px round, no border) */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#667085] hover:bg-[#F2F4F7] active:bg-[#E4E7EC] transition-colors cursor-pointer relative focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2563EB]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8EBF2] rounded-[14px] shadow-lg p-3 z-50 text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8EBF2]">
                <span className="font-bold text-[#101828]">Store Notifications</span>
                <span className="text-[10px] text-[#2563EB] font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-[#E6F6EC] text-[#12A150]">
                  <span className="font-semibold block">Bill Finalized</span>
                  <span className="text-[11px] text-[#12A150]/90">Rs 1,038 collected via UPI PhonePe.</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FFF1E6] text-[#F97316]">
                  <span className="font-semibold block">Low Stock Alert</span>
                  <span className="text-[11px] text-[#F97316]/90">Amul Butter 500g is below reorder level (6 pcs left).</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Picture with Dropdown */}
        <div ref={userMenuRef} className="relative ml-1">
          {currentUser ? (
            <div>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F2F4F7] transition-colors cursor-pointer focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#E8EBF2]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#2563EB] font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                {currentUser.isDemo && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Demo Mode
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E8EBF2] rounded-[14px] shadow-lg p-2 z-50 space-y-1 text-xs">
                  <div className="px-2.5 py-2 border-b border-[#E8EBF2]">
                    <div className="font-bold text-[#101828] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-[#667085] capitalize">
                      {currentUser.role} • {currentBusiness.name}
                    </div>
                  </div>

                  {currentUser.isDemo && (
                    <div className="p-2 my-1 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                      <p className="font-bold">Restricted Demo Account</p>
                      <p className="text-[10px] text-amber-800/80 mt-0.5">
                        Exploring with sample data.
                      </p>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openAuthModal('signup');
                        }}
                        className="mt-1.5 w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                      >
                        Create Real Account
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#101828] hover:bg-[#F2F4F7] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>User Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#101828] hover:bg-[#F2F4F7] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#667085]" />
                    <span>Store Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('subscription');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#101828] hover:bg-[#F2F4F7] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#12A150]" />
                    <span>Subscription</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('help');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#101828] hover:bg-[#F2F4F7] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Help</span>
                  </button>

                  <a
                    href="/dukanniq-retail-ai-platform.zip"
                    download="dukanniq-retail-ai-platform.zip"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#101828] hover:bg-[#F2F4F7] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Export Source Code (ZIP)</span>
                  </a>

                  <div className="border-t border-[#E8EBF2] my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#E5484D] hover:bg-[#FDECEC] font-bold flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="h-9 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[10px] text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
