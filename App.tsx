import React, { useState } from 'react';
import './admin.css';
import { AdminProvider, useAdminBridge } from './useAdminBridge';
import { AdminHeader } from './AdminHeader';
import { AdminDrawer } from './AdminDrawer';
import { Nav } from './Nav';
import { LockScreen } from './LockScreen';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { ProductsManager } from './ProductsManager';
import { AdminOffersManager } from './AdminOffersManager';
import { SubscribersList } from './SubscribersList';
import { OrdersManager } from './OrdersManager';
import { ProductFormSheet } from './ProductFormSheet';
import { SettingsView } from './SettingsView';
import { AdminSizesView } from './AdminSizesView';
import { AdminSocialView } from './AdminSocialView';
import { AdminControlsView } from './AdminControlsView';
import { AdminBackupView } from './AdminBackupView';
import { AdminSecurityView } from './AdminSecurityView';
import { AdminBannersView } from './AdminBannersView';
import { AdminWelcomeModalView } from './AdminWelcomeModalView';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminAppProps {
  onClose?: () => void;
}

function MainLayout({ onClose }: AdminAppProps) {
  const { activeView, lang, setIsOfferModalOpen } = useAdminBridge();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGlobalProductSheetOpen, setIsGlobalProductSheetOpen] = useState(false);

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Lock Screen Component */}
      <LockScreen />

      {/* Mobile Drawer */}
      <AdminDrawer onClose={onClose} />

      {/* Global Product Form Sheet */}
      <ProductFormSheet
        isOpen={isGlobalProductSheetOpen}
        onClose={() => setIsGlobalProductSheetOpen(false)}
      />

      {/* Desktop App Layout */}
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-${
            isAr ? 'l' : 'r'
          } border-slate-800 bg-slate-900/95 sticky top-0 h-screen transition-all duration-300 z-20 shrink-0 ${
            isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          <div className="flex-1 overflow-hidden flex flex-col">
            <Nav collapsed={isSidebarCollapsed} onCloseAdmin={onClose} />
          </div>

          {/* Collapse Toggle Footer */}
          <div className="p-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer w-full flex items-center justify-center"
              title={isSidebarCollapsed ? (isAr ? 'توسيع القائمة' : 'Expand Sidebar') : isAr ? 'طي القائمة' : 'Collapse Sidebar'}
            >
              {isAr ? (
                isSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            onOpenProductSheet={() => setIsGlobalProductSheetOpen(true)}
            onOpenOfferSheet={() => setIsOfferModalOpen(true)}
            onCloseAdmin={onClose}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full min-w-0 overflow-y-auto">
            {activeView === 'dashboard' && <AdminAnalyticsDashboard />}
            {activeView === 'orders' && <OrdersManager />}
            {activeView === 'products' && <ProductsManager />}
            {activeView === 'sizes' && <AdminSizesView />}
            {activeView === 'offers' && <AdminOffersManager />}
            {activeView === 'banners' && <AdminBannersView />}
            {activeView === 'welcome_modal' && <AdminWelcomeModalView />}
            {activeView === 'subscribers' && <SubscribersList />}
            {activeView === 'controls' && <AdminControlsView />}
            {activeView === 'social' && <AdminSocialView />}
            {activeView === 'backup' && <AdminBackupView />}
            {activeView === 'settings' && <SettingsView />}
            {activeView === 'security' && <AdminSecurityView />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App({ onClose }: AdminAppProps) {
  return (
    <AdminProvider>
      <MainLayout onClose={onClose} />
    </AdminProvider>
  );
}
