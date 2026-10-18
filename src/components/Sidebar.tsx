import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Truck,
  Tag,
  Users,
  CreditCard,
  UserCheck,
  Compass,
  Settings,
  HelpCircle,
  ChevronDown,
  BarChart2,
  Layers,
} from 'lucide-react';
import { DukaanIqLogo } from './DukaanIqLogo';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    products,
    currentLocation,
  } = useApp();

  const [accountsOpen, setAccountsOpen] = useState(false);

  const lowStockCount = products.filter(
    (p) => (p.stockOnHand[currentLocation.id] || 0) <= p.reorderPoint
  ).length;

  const handleNavClick = (id: string) => {
    setActiveView(id as any);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'pos',
      label: 'Billing',
      icon: Receipt,
    },
    {
      id: 'inventory',
      label: 'Stock',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
    },
    {
      id: 'purchasing',
      label: 'Buying',
      icon: Truck,
    },
    {
      id: 'pricing',
      label: 'Prices',
      icon: Tag,
    },
    {
      id: 'crm',
      label: 'Customer',
      icon: Users,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart2,
    },
    {
      id: 'integrations',
      label: 'ERP & Payments',
      icon: Layers,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* 240px Clean White Sidebar without any slider */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[240px] bg-white border-r border-[#E8EBF2] flex flex-col justify-between transition-all duration-200 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Official DukaanIQ Logo */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#E8EBF2]">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <DukaanIqLogo size="md" />
            </div>
          </div>

          {/* Navigation Links (Every option visible, no slider, no overflow container) */}
          <nav className="p-2 space-y-0.5 font-sans">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === 'dashboard' && (activeView === 'home' || activeView === 'dashboard'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative w-full h-[36px] px-3 rounded-[9px] flex items-center justify-between text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-[#2563EB] before:rounded-r'
                      : 'text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 ${
                        isActive ? 'text-[#2563EB]' : 'text-[#667085]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FDECEC] text-[#E5484D]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Accounts Expandable Menu */}
            <div>
              <button
                onClick={() => setAccountsOpen(!accountsOpen)}
                className={`w-full h-[36px] px-3 rounded-[9px] flex items-center justify-between text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                  activeView === 'finance'
                    ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold'
                    : 'text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="w-[17px] h-[17px] shrink-0 text-[#667085]" />
                  <span>Accounts</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#667085] transition-transform duration-150 ${
                    accountsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Accounts Submenu */}
              {accountsOpen && (
                <div className="pl-8 pr-2 py-0.5 space-y-0.5">
                  <button
                    onClick={() => handleNavClick('finance')}
                    className="w-full text-left py-1 px-2 rounded-md text-[11.5px] text-[#667085] hover:text-[#2563EB] hover:bg-[#E8F0FE]/60 font-medium transition-colors cursor-pointer"
                  >
                    Invoices
                  </button>
                  <button
                    onClick={() => handleNavClick('finance')}
                    className="w-full text-left py-1 px-2 rounded-md text-[11.5px] text-[#667085] hover:text-[#2563EB] hover:bg-[#E8F0FE]/60 font-medium transition-colors cursor-pointer"
                  >
                    Bills
                  </button>
                  <button
                    onClick={() => handleNavClick('finance')}
                    className="w-full text-left py-1 px-2 rounded-md text-[11.5px] text-[#667085] hover:text-[#2563EB] hover:bg-[#E8F0FE]/60 font-medium transition-colors cursor-pointer"
                  >
                    Reports
                  </button>
                </div>
              )}
            </div>

            {/* Staff */}
            <button
              onClick={() => handleNavClick('workforce')}
              className={`relative w-full h-[36px] px-3 rounded-[9px] flex items-center justify-between text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                activeView === 'workforce'
                  ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-[#2563EB] before:rounded-r'
                  : 'text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck className="w-[17px] h-[17px] shrink-0" />
                <span>Staff</span>
              </div>
            </button>

            {/* AI Helper */}
            <button
              onClick={() => handleNavClick('copilot')}
              className={`relative w-full h-[36px] px-3 rounded-[9px] flex items-center justify-between text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                activeView === 'copilot' || activeView === 'ai-helper'
                  ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-[#2563EB] before:rounded-r'
                  : 'text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Compass className="w-[17px] h-[17px] shrink-0 text-[#2563EB]" />
                <span>AI Helper</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Settings, Help & Plan Card (Fully visible) */}
        <div className="p-2.5 border-t border-[#E8EBF2] space-y-1.5 shrink-0">
          {/* Settings & Help */}
          <div className="space-y-0.5">
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full h-[32px] px-2.5 rounded-[8px] flex items-center gap-2.5 text-[12px] font-medium transition-colors cursor-pointer ${
                activeView === 'settings'
                  ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold'
                  : 'text-[#667085] hover:bg-[#F2F4F7]'
              }`}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNavClick('help')}
              className={`w-full h-[32px] px-2.5 rounded-[8px] flex items-center gap-2.5 text-[12px] font-medium transition-colors cursor-pointer ${
                activeView === 'help'
                  ? 'bg-[#E8F0FE] text-[#2563EB] font-semibold'
                  : 'text-[#667085] hover:bg-[#F2F4F7]'
              }`}
              title="Help"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Help</span>
            </button>
          </div>

          {/* Clean Plan Card */}
          <div className="rounded-[10px] p-2.5 bg-gradient-to-br from-[#0B1E5B] to-[#1E3FA8] text-white shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide uppercase opacity-90">
                Growth Plan
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] leading-tight text-white/80">
              Unlimited billing & GST e-invoices.
            </p>
            <button
              onClick={() => handleNavClick('subscription')}
              className="w-full h-[28px] bg-white hover:bg-slate-50 text-[#2563EB] text-[11px] font-semibold rounded-[6px] transition-transform active:scale-[0.98] cursor-pointer shadow-xs flex items-center justify-center"
            >
              See plans
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
