/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Common Layout Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { BrandIntro } from './components/common/BrandIntro';
import { ProhibitedItemsModal } from './components/common/ProhibitedItemsModal';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { CreateListingModal } from './components/listing/CreateListingModal';
import { ListingDetailModal } from './components/listing/ListingDetailModal';
import { ReportModal } from './components/listing/ReportModal';
import { MakeOfferModal } from './components/offer/MakeOfferModal';
import { CounterOfferModal } from './components/offer/CounterOfferModal';
import { ReviewModal } from './components/review/ReviewModal';

// Views
import { HomeView } from './views/HomeView';
import { BrowseView } from './views/BrowseView';
import { DashboardView } from './views/DashboardView';
import { UserInventoryView } from './views/UserInventoryView';
import { OffersView } from './views/OffersView';
import { TradesView } from './views/TradesView';
import { MessagesView } from './views/MessagesView';
import { NotificationsView } from './views/NotificationsView';
import { FavoritesView } from './views/FavoritesView';
import { UserProfileView } from './views/UserProfileView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { PublicInfoView, PublicPageType } from './views/PublicInfoView';

// Icons & Types
import { ShieldAlert, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Listing, Offer, Trade, User } from './types';
import { listingService } from './services/listingService';

function MainAppContent() {
  const { 
    currentRoute, 
    routeParam, 
    navigate, 
    showCreateListing, 
    setShowCreateListing, 
    showProhibitedModal, 
    setShowProhibitedModal,
    showBrandIntro,
    setShowBrandIntro,
  } = useNavigation();

  const { currentUser, isAuthenticated, isAdmin, openAuthModal, switchPersona } = useAuth();

  const handleDismissBrandIntro = () => {
    sessionStorage.setItem('barterly_intro_seen', 'true');
    setShowBrandIntro(false);
  };

  // Active modal targets
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [makeOfferTarget, setMakeOfferTarget] = useState<Listing | null>(null);
  const [counterOfferTarget, setCounterOfferTarget] = useState<Offer | null>(null);
  const [reportListingTarget, setReportListingTarget] = useState<Listing | null>(null);
  const [reportUserTarget, setReportUserTarget] = useState<User | null>(null);
  const [reviewTradeTarget, setReviewTradeTarget] = useState<Trade | null>(null);

  // If URL route is `/listing` with a param, load that listing
  useEffect(() => {
    if (currentRoute === '/listing' && routeParam) {
      listingService.getListing(routeParam).then((item) => {
        if (item) {
          setSelectedListing(item);
        }
      });
    }
  }, [currentRoute, routeParam]);

  // Handle `/app/listings/new` route
  useEffect(() => {
    if (currentRoute === '/app/listings/new') {
      setShowCreateListing(true);
    }
  }, [currentRoute, setShowCreateListing]);

  const handleOpenListingDetail = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleStartMakeOffer = (listing: Listing) => {
    setSelectedListing(null);
    setMakeOfferTarget(listing);
  };

  const handleStartReportListing = (listing: Listing) => {
    setReportListingTarget(listing);
  };

  const handleStartReportUser = (user: User) => {
    setReportUserTarget(user);
  };

  const handleStartCounterOffer = (offer: Offer) => {
    setCounterOfferTarget(offer);
  };

  const handleStartReview = (trade: Trade) => {
    setReviewTradeTarget(trade);
  };

  // Determine current Admin tab if on /admin route
  const getAdminTab = () => {
    if (currentRoute.startsWith('/admin/users')) return 'users';
    if (currentRoute.startsWith('/admin/listings')) return 'listings';
    if (currentRoute.startsWith('/admin/reports')) return 'reports';
    if (currentRoute.startsWith('/admin/trades')) return 'trades';
    if (currentRoute.startsWith('/admin/disputes')) return 'disputes';
    if (currentRoute.startsWith('/admin/audit-logs')) return 'audit-logs';
    if (currentRoute.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  // Route categorization
  const isPublicInfoRoute = [
    '/safety',
    '/terms',
    '/privacy',
    '/prohibited-items',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ].includes(currentRoute);

  const isUserRoute = currentRoute.startsWith('/app');
  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-500 selection:text-white w-full overflow-x-hidden">
      {/* Brand Intro splash */}
      {showBrandIntro && <BrandIntro onComplete={handleDismissBrandIntro} />}

      {/* Sticky Top Header */}
      <Header />

      {/* Main Routed View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12 min-w-0">
        {/* PUBLIC ROUTES */}
        {currentRoute === '/' && (
          <HomeView onSelectListing={handleOpenListingDetail} />
        )}

        {currentRoute === '/browse' && (
          <BrowseView 
            initialSearch={routeParam || ''} 
            onSelectListing={handleOpenListingDetail} 
          />
        )}

        {currentRoute === '/listing' && (
          <BrowseView 
            initialSearch="" 
            onSelectListing={handleOpenListingDetail} 
          />
        )}

        {isPublicInfoRoute && (
          <PublicInfoView page={currentRoute.replace('/', '') as PublicPageType} />
        )}

        {/* USER ROUTES GUARDED (/app/*) */}
        {isUserRoute && !isAuthenticated && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900">Sign In Required</h2>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                You must be signed in to an authenticated Barterly account to access the Trader Dashboard, manage item inventory, and review trade agreements.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Sign In to My Account
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Continue Browsing Items
              </button>
            </div>
          </div>
        )}

        {isUserRoute && isAuthenticated && (
          <>
            {currentRoute === '/app' && (
              <DashboardView 
                onSelectListing={handleOpenListingDetail} 
                onOpenCounterModal={handleStartCounterOffer} 
              />
            )}

            {(currentRoute === '/app/listings' || currentRoute === '/app/listings/new') && (
              <UserInventoryView 
                onSelectListing={handleOpenListingDetail} 
              />
            )}

            {currentRoute === '/app/offers' && (
              <OffersView onOpenCounterModal={handleStartCounterOffer} />
            )}

            {currentRoute === '/app/trades' && (
              <TradesView 
                initialTradeId={routeParam} 
                onOpenReviewModal={handleStartReview} 
              />
            )}

            {currentRoute === '/app/messages' && (
              <MessagesView initialConversationId={routeParam} />
            )}

            {currentRoute === '/app/notifications' && (
              <NotificationsView />
            )}

            {currentRoute === '/app/favorites' && (
              <FavoritesView onSelectListing={handleOpenListingDetail} />
            )}

            {currentRoute === '/app/profile' && (
              <UserProfileView 
                userId={routeParam || currentUser?.id} 
                onSelectListing={handleOpenListingDetail}
                onReportUser={handleStartReportUser}
              />
            )}

            {(currentRoute === '/app/settings' || currentRoute === '/app/settings/security') && (
              <SettingsView />
            )}
          </>
        )}

        {/* ADMIN ROUTES GUARDED (/admin/*) */}
        {isAdminRoute && !isAuthenticated && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Administrator Access Required</h2>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                The Barterly Operations & Moderation Console requires authenticated administrative credentials.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Sign In as Administrator
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Back to Public Marketplace
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-left text-xs text-neutral-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300 text-[11px]">Development Admin:</span>
                <button
                  type="button"
                  onClick={() => switchPersona('admin_1')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  Quick Sign-In (@marcus_admin)
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Email: <span className="text-indigo-300">marcus.vance@barterly.internal</span>
              </p>
            </div>
          </div>
        )}

        {isAdminRoute && isAuthenticated && !isAdmin && (
          <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                403 Forbidden
              </span>
              <h2 className="text-xl font-black text-neutral-900 mt-2">Access Denied</h2>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Your account (<strong className="text-neutral-800">@{currentUser?.username}</strong>) has the role 
                <span className="font-mono font-bold text-neutral-700"> "{currentUser?.role}"</span>. 
                Access to the Operations Console is restricted to accounts with the <span className="font-mono font-bold text-indigo-600">"admin"</span> role.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 text-[11px] text-neutral-600 border border-neutral-200/80 leading-relaxed text-left">
              <strong>Notice on Security Architecture:</strong> Frontend route checks provide a clean UX redirect. The Barterly backend enforces role validation independently on all <code className="text-neutral-900 font-mono">/api/v1/admin/*</code> endpoints.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate('/app')}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs cursor-pointer"
              >
                Return to Trader Dashboard
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
              >
                Browse Items
              </button>
            </div>
          </div>
        )}

        {isAdminRoute && isAuthenticated && isAdmin && (
          <AdminView 
            initialTab={getAdminTab()} 
            initialSelectedId={routeParam || undefined} 
          />
        )}
      </main>

      {/* Bottom Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Modals */}
      <AuthModal />

      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onCreated={() => {
          setShowCreateListing(false);
          navigate('/app/listings');
        }}
      />

      <ListingDetailModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onMakeOffer={handleStartMakeOffer}
        onReportListing={handleStartReportListing}
      />

      <MakeOfferModal
        targetListing={makeOfferTarget}
        isOpen={!!makeOfferTarget}
        onClose={() => setMakeOfferTarget(null)}
        onSuccess={() => navigate('/app/offers')}
      />

      <CounterOfferModal
        offer={counterOfferTarget}
        isOpen={!!counterOfferTarget}
        onClose={() => setCounterOfferTarget(null)}
        onSuccess={() => navigate('/app/offers')}
      />

      <ReportModal
        isOpen={!!reportListingTarget || !!reportUserTarget}
        targetListing={reportListingTarget}
        targetUser={reportUserTarget}
        onClose={() => {
          setReportListingTarget(null);
          setReportUserTarget(null);
        }}
      />

      <ReviewModal
        trade={reviewTradeTarget}
        isOpen={!!reviewTradeTarget}
        onClose={() => setReviewTradeTarget(null)}
      />

      <ProhibitedItemsModal
        isOpen={showProhibitedModal}
        onClose={() => setShowProhibitedModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <MainAppContent />
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
