import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Repeat, 
  ArrowLeftRight, 
  CheckCircle2, 
  Plus, 
  Clock, 
  AlertCircle,
  Eye,
  ChevronRight,
  MessageSquare,
  Bell,
  Heart,
  Compass,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Listing, Offer, Trade, Notification } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { listingService } from '../services/listingService';
import { offerService } from '../services/offerService';
import { tradeService } from '../services/tradeService';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import { favoriteService } from '../services/favoriteService';
import { Badge } from '../components/common/Badge';

interface DashboardViewProps {
  onSelectListing: (listing: Listing) => void;
  onOpenCounterModal: (offer: Offer) => void;
}

export function DashboardView({ onSelectListing, onOpenCounterModal }: DashboardViewProps) {
  const { currentUser } = useAuth();
  const { navigate, setShowCreateListing } = useNavigation();

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [sentOffers, setSentOffers] = useState<Offer[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        listingService.getUserListings(currentUser.id),
        offerService.getReceivedOffers(currentUser.id),
        offerService.getSentOffers(currentUser.id),
        tradeService.getUserTrades(currentUser.id),
        messageService.getConversations(currentUser.id),
        notificationService.getNotifications(currentUser.id),
        favoriteService.getFavoriteIds(currentUser.id),
      ]).then(([listings, received, sent, trades, convs, notifs, favs]) => {
        setMyListings(listings);
        setReceivedOffers(received);
        setSentOffers(sent);
        setActiveTrades(trades);
        
        const unreadMsgs = convs.reduce((acc, c) => acc + c.unreadCount, 0);
        setUnreadMessagesCount(unreadMsgs);

        const unreadNotifs = notifs.filter(n => !n.isRead).length;
        setUnreadNotificationsCount(unreadNotifs);
        setRecentNotifications(notifs.slice(0, 4));

        setFavoritesCount(favs.length);
        setIsLoading(false);
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const pendingReceived = receivedOffers.filter(o => o.status === 'pending' || o.status === 'countered');
  const publishedCount = myListings.filter(l => l.status === 'published').length;
  const inProgressTrades = activeTrades.filter(t => t.status !== 'completed' && t.status !== 'cancelled');

  return (
    <div className="space-y-8 pb-20 text-neutral-900">
      {/* Welcome & Trader Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Trader Profile: <strong className="text-neutral-800">@{currentUser.username}</strong> • {currentUser.location?.city || 'Local'} • ★ {currentUser.rating ?? 5.0} ({currentUser.completedTradesCount ?? 0} completed trades)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dash-list-item-btn"
            onClick={() => setShowCreateListing(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List an Item</span>
          </button>
        </div>
      </div>

      {/* Primary Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/app/listings')}
          className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>My Active Items</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {publishedCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {myListings.length} total listed inventory
          </div>
        </div>

        <div 
          onClick={() => navigate('/app/offers')}
          className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Pending Offers</span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {pendingReceived.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {receivedOffers.length} total received
          </div>
        </div>

        <div 
          onClick={() => navigate('/app/trades')}
          className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Active Trades</span>
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">
            {inProgressTrades.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            In-person / locker exchanges
          </div>
        </div>

        <div 
          onClick={() => navigate('/app/messages')}
          className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Unread Messages</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {unreadMessagesCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Across active trade chats
          </div>
        </div>
      </div>

      {/* Useful Quick Actions Toolbar (Requirement 8) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-neutral-800">Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateListing(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-emerald-500 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>List an Item</span>
          </button>

          <button
            onClick={() => navigate('/browse')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-neutral-500" />
            <span>Browse Items</span>
          </button>

          <button
            onClick={() => navigate('/app/offers')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Repeat className="w-3.5 h-3.5 text-neutral-500" />
            <span>Review Offers ({pendingReceived.length})</span>
          </button>

          <button
            onClick={() => navigate('/app/messages')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
            <span>Open Messages</span>
          </button>

          <button
            onClick={() => navigate('/app/favorites')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Saved Favorites ({favoritesCount})</span>
          </button>
        </div>
      </div>

      {/* Active Trades Notice if any */}
      {inProgressTrades.length > 0 && (
        <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="font-bold text-sm text-white">Active Barter Agreements In Progress</h3>
            </div>
            <button
              onClick={() => navigate('/app/trades')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Open Trade Rooms →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inProgressTrades.map((t) => {
              const other = currentUser.id === t.owner?.id ? t.requester : t.owner;
              const ownerItemTitle = t.exchangedItems?.fromOwner?.title || t.listing?.title || 'Trade item';
              const requesterItemTitles = t.exchangedItems?.fromRequester?.map(i => i.title).join(', ') || 'Barter items';
              return (
                <div
                  key={t.id}
                  onClick={() => navigate('/app/trades', t.id)}
                  className="p-4 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-between gap-3 hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{ownerItemTitle}</span>
                      <span className="text-neutral-400 text-xs">⇄</span>
                      <span className="font-bold text-xs text-white truncate">{requesterItemTitles}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Trading partner: <strong>{other?.name || 'Trader'}</strong> • {t.meeting ? t.meeting.locationName : 'Arranging safe spot'}
                    </p>
                  </div>
                  <Badge value={t.status} variant="trade" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-Column Section: Pending Offers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Offers Needing Attention */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-600" />
              <span>Pending Barter Offers ({pendingReceived.length})</span>
            </h3>
            <button
              onClick={() => navigate('/app/offers')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          {pendingReceived.length > 0 ? (
            <div className="space-y-3">
              {pendingReceived.slice(0, 3).map((offer) => {
                const requester = offer.requester;
                const offeredTitle = offer.offeredItems?.map(i => i.title).join(', ') || 'Offered Item(s)';
                const targetTitle = offer.listing?.title || 'Your Listing';
                return (
                  <div
                    key={offer.id}
                    className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={requester?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                          alt={requester?.name || 'Trader'}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{requester?.name || 'Trader'}</p>
                          <p className="text-[10px] text-neutral-400">★ {requester?.rating ?? '5.0'} • {requester?.completedTradesCount ?? 0} trades</p>
                        </div>
                      </div>
                      <Badge value={offer.status} variant="offer" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-neutral-800 truncate">{offeredTitle}</span>
                      <span className="text-neutral-400 font-bold shrink-0">⇄ For ⇄</span>
                      <span className="font-semibold text-neutral-800 truncate">{targetTitle}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-neutral-400">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => navigate('/app/offers', offer.id)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Review Offer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-center space-y-2">
              <p className="text-xs text-neutral-500">No incoming offers awaiting your response right now.</p>
              <button
                onClick={() => navigate('/browse')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Items to Trade</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity & Notifications */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-500" />
              <span>Recent Activity & Updates</span>
            </h3>
            <button
              onClick={() => navigate('/app/notifications')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              All Notifications ({unreadNotificationsCount} unread)
            </button>
          </div>

          {recentNotifications.length > 0 ? (
            <div className="space-y-2.5">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.linkRoute && navigate(notif.linkRoute)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    notif.isRead ? 'bg-white border-neutral-200/80' : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-neutral-900">{notif.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{notif.message}</p>
                    <span className="text-[10px] text-neutral-400 block pt-0.5">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-xs text-neutral-500">
              No recent notifications to report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
