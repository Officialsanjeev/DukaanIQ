import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MarketingPage } from './components/MarketingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { PosTerminal } from './components/PosTerminal';
import { InventoryForecastView } from './components/InventoryForecastView';
import { AiStockManagerView } from './components/AiStockManagerView';
import { PurchasingView } from './components/PurchasingView';
import { DynamicPricingView } from './components/DynamicPricingView';
import { CustomerCrmView } from './components/CustomerCrmView';
import { FinancialGstView } from './components/FinancialGstView';
import { WorkforceShiftsView } from './components/WorkforceShiftsView';
import { AiHelperView } from './components/AiHelperView';
import { AiCopilotView } from './components/AiCopilotView';
import { ReportsView } from './components/ReportsView';
import { IntegrationsView } from './components/IntegrationsView';
import { ContactUsPage } from './components/ContactUsPage';
import { SignInPage } from './components/SignInPage';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { SubscriptionView } from './components/SubscriptionView';
import { HelpView } from './components/HelpView';
import { AuthModal } from './components/AuthModal';

interface DashboardMainContentProps {
  onToggleMobileSidebar?: () => void;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({ onToggleMobileSidebar }) => {
  const { activeView } = useApp();
  const isFullHeightView = activeView === 'pos';

  return (
    <main className={`flex-1 ${activeView === 'inventory' ? 'bg-[#F6F4EF]' : 'bg-[#F3F5F9]'} ${isFullHeightView ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      {activeView === 'dashboard' && <DashboardOverview />}
      {activeView === 'pos' && <PosTerminal onToggleMobileSidebar={onToggleMobileSidebar} />}
      {activeView === 'inventory' && <AiStockManagerView />}
      {activeView === 'purchasing' && <PurchasingView />}
      {activeView === 'pricing' && <DynamicPricingView />}
      {activeView === 'crm' && <CustomerCrmView />}
      {activeView === 'reports' && <ReportsView />}
      {activeView === 'integrations' && <IntegrationsView />}
      {activeView === 'finance' && <FinancialGstView />}
      {activeView === 'workforce' && <WorkforceShiftsView />}
      {(activeView === 'copilot' || activeView === 'ai-helper') && <AiHelperView />}
      {activeView === 'copilot-chat' && <AiCopilotView />}
      {activeView === 'settings' && <SettingsView />}
      {activeView === 'profile' && <ProfileView />}
      {activeView === 'subscription' && <SubscriptionView />}
      {activeView === 'help' && <HelpView />}

      {/* Fallback to Dashboard overview if in dashboard space but unknown view */}
      {![
        'dashboard',
        'pos',
        'inventory',
        'purchasing',
        'pricing',
        'crm',
        'reports',
        'integrations',
        'finance',
        'workforce',
        'copilot',
        'ai-helper',
        'copilot-chat',
        'settings',
        'profile',
        'subscription',
        'help',
      ].includes(activeView) && <DashboardOverview />}
    </main>
  );
};

const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeView } = useApp();

  return (
    <div className={`min-h-screen flex font-sans text-[#101828] ${activeView === 'inventory' ? 'bg-[#F6F4EF]' : 'bg-[#F3F5F9]'} antialiased selection:bg-blue-100 selection:text-blue-900`}>
      {/* Clean Dashboard Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {activeView !== 'pos' && (
          <Header onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        )}
        <DashboardMainContent onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
      </div>
    </div>
  );
};

const RootView: React.FC = () => {
  const { activeView, currentUser, authLoading } = useApp();

  // Show subtle loader while checking Firebase auth session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#667085]">Loading DukaanIQ...</p>
        </div>
      </div>
    );
  }

  // Contact Us full page
  if (activeView === 'contact') {
    return (
      <>
        <ContactUsPage />
        <AuthModal />
      </>
    );
  }

  // Dedicated Sign In / Sign Up page
  if (activeView === 'signin') {
    return (
      <>
        <SignInPage />
        <AuthModal />
      </>
    );
  }

  // Home / marketing landing page
  const isHomePage = activeView === 'home' || activeView === 'marketing';

  // Protect all dashboard views - if unauthenticated and trying to view dashboard, show SignInPage
  if (!currentUser && !isHomePage) {
    return (
      <>
        <SignInPage />
        <AuthModal />
      </>
    );
  }

  return (
    <>
      {isHomePage ? <MarketingPage /> : <DashboardLayout />}
      <AuthModal />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RootView />
    </AppProvider>
  );
}
