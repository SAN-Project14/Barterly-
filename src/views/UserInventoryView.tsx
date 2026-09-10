import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Repeat, 
  ArrowLeftRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  MessageSquare, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Compass, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Listing, Trade, Offer, Conversation } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { listingService } from '../services/listingService';
import { tradeService } from '../services/tradeService';
import { offerService } from '../services/offerService';
import { messageService } from '../services/messageService';
import { mockStorage } from '../services/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CreateListingModal } from '../components/listing/CreateListingModal';
import { EmptyState } from '../components/common/EmptyState';

interface UserInventoryViewProps {
  onSelectListing: (listing: Listing) => void;
}

type InventoryTab = 'active' | 'in_trade' | 'completed';

export function UserInventoryView({ onSelectListing }: UserInventoryViewProps) {
  const { currentUser } = useAuth();
  const { navigate, setShowCreateListing } = useNavigation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<InventoryTab>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states for edit and delete
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = useCallback(() => {
    if (!currentUser) return;
    setIsLoading(true);

    Promise.all([
      listingService.getUserListings(currentUser.id),
      tradeService.getUserTrades(currentUser.id),
      offerService.getReceivedOffers(currentUser.id),
      messageService.getConversations(currentUser.id),
    ])
      .then(([listings, trades, offers, convs]) => {
        // Enforce strict ownership filtering
        const ownedListings = listings.filter(l => l.ownerId === currentUser.id);
        setUserListings(ownedListings);
        setUserTrades(trades);
        setReceivedOffers(offers);
        setConversations(convs);
      })
      .catch((err) => {
        console.error('Error loading inventory data', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    loadData();

    // Subscribe to real-time storage state updates
    const unsubscribe = mockStorage.subscribe(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // 1. ACTIVE LISTINGS: User-owned listings that are 'published' or 'draft'
  // AND not currently locked in an active trade process.
  const activeListings = useMemo(() => {
    // Collect listing IDs that are in an active in-progress trade
    const inProgressTradeListingIds = new Set(
      userTrades
        .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
        .map(t => t.listing.id)
    );

    return userListings.filter(l => {
      const isAvailableStatus = l.status === 'published' || l.status === 'draft';
      const isNotInActiveTrade = !inProgressTradeListingIds.has(l.id) && l.status !== 'reserved' && l.status !== 'traded';
      return isAvailableStatus && isNotInActiveTrade;
    });
  }, [userListings, userTrades]);

  // 2. IN TRADE / RESERVED LISTINGS:
  // Items marked as 'reserved' or currently part of an active trade.
  const inTradeItems = useMemo(() => {
    // Trades that are currently ongoing
    const activeTrades = userTrades.filter(t => t.status !== 'completed' && t.status !== 'cancelled');

    // Also include any owned listings that have status 'reserved' even if trade record was loaded separately
    const tradeListingIds = new Set(activeTrades.map(t => t.listing.id));
    const reservedListingsWithoutTrade = userListings.filter(
      l => l.status === 'reserved' && !tradeListingIds.has(l.id)
    );

    return {
      activeTrades,
      reservedListings: reservedListingsWithoutTrade,
      totalCount: activeTrades.length + reservedListingsWithoutTrade.length,
    };
  }, [userListings, userTrades]);

  // 3. COMPLETED SWAPS:
  // Trades with status 'completed' or owned listings with status 'traded'
  const completedSwaps = useMemo(() => {
    const completedTradeList = userTrades.filter(t => t.status === 'completed');
    const completedTradeListingIds = new Set(completedTradeList.map(t => t.listing.id));

    // Also check for user listings marked 'traded'
    const tradedListings = userListings.filter(
      l => l.status === 'traded' && !completedTradeListingIds.has(l.id)
    );

    return {
      completedTrades: completedTradeList,
      tradedListings,
      totalCount: completedTradeList.length + tradedListings.length,
    };
  }, [userListings, userTrades]);

  // Filter listings by optional search keyword
  const filteredActiveListings = useMemo(() => {
    if (!searchQuery.trim()) return activeListings;
    const q = searchQuery.toLowerCase();
    return activeListings.filter(
      l => l.title.toLowerCase().includes(q) || 
           l.category.toLowerCase().includes(q) ||
           l.desiredExchange.toLowerCase().includes(q)
    );
  }, [activeListings, searchQuery]);

  // Handle Listing Deletion with strict ownership check
  const handleConfirmDelete = async () => {
    if (!deletingListing || !currentUser) return;

    if (deletingListing.ownerId !== currentUser.id) {
      showToast('Permission Denied', 'You do not have permission to delete this listing.', 'error');
      setDeletingListing(null);
      return;
    }

    setIsDeleting(true);
    try {
      await listingService.deleteListing(deletingListing.id);
      showToast('Listing Removed', `"${deletingListing.title}" has been deleted from your inventory.`, 'success');
      setDeletingListing(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      showToast('Error', msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Find associated conversation for a trade
  const findConversationForTrade = (trade: Trade): Conversation | undefined => {
    const partnerId = trade.owner.id === currentUser?.id ? trade.requester.id : trade.owner.id;
    return conversations.find(c => 
      (c.listingId === trade.listing.id || c.tradeId === trade.id) ||
      c.participants.some(p => p.id === partnerId)
    );
  };

  const getConditionBadgeStyle = (condition: string) => {
    switch (condition) {
      case 'brand_new':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'like_new':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'fair':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const formatConditionLabel = (condition: string) => {
    switch (condition) {
      case 'brand_new': return 'Brand New';
      case 'like_new': return 'Like New';
      case 'good': return 'Good Condition';
      case 'fair': return 'Fair Condition';
      default: return condition;
    }
  };

  const getTradeStatusBadge = (status: string) => {
    switch (status) {
      case 'offer_accepted':
        return { label: 'Offer Accepted', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'trade_arranged':
        return { label: 'Meeting Scheduled', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'in_progress':
        return { label: 'Exchange in Progress', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'disputed':
        return { label: 'Dispute Under Review', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'completed':
        return { label: 'Swap Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: status, color: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-20 text-neutral-900">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1">
            <button 
              onClick={() => navigate('/browse')}
              className="hover:text-neutral-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-900">My Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            My Listings & Inventory
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your personal items offered for barter, track active trade agreements, and review completed swaps.
          </p>
        </div>

        {/* Primary Action: Add / Create Listing */}
        <div className="flex items-center gap-2.5">
          <button
            id="inventory-create-listing-btn"
            onClick={() => setShowCreateListing(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>List an Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation with Live Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Active Tab */}
          <button
            id="inventory-tab-active"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Active Listings</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-200 text-neutral-700'
            }`}>
              {activeListings.length}
            </span>
          </button>

          {/* In Trade / Reserved Tab */}
          <button
            id="inventory-tab-in-trade"
            onClick={() => setActiveTab('in_trade')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'in_trade'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>In Trade / Reserved</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'in_trade'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-200 text-neutral-700'
            }`}>
              {inTradeItems.totalCount}
            </span>
          </button>

          {/* Completed Swaps Tab */}
          <button
            id="inventory-tab-completed"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed Swaps</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-200 text-neutral-700'
            }`}>
              {completedSwaps.totalCount}
            </span>
          </button>
        </div>

        {/* Quick Search within Active Tab */}
        {activeTab === 'active' && activeListings.length > 3 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter your active items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-neutral-200 animate-pulse space-y-3">
              <div className="aspect-16/10 bg-neutral-100 rounded-xl w-full" />
              <div className="h-4 bg-neutral-100 rounded-md w-3/4" />
              <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
              <div className="h-8 bg-neutral-100 rounded-xl w-full pt-2" />
            </div>
          ))}
        </div>
      ) : null}

      {/* TAB 1: ACTIVE LISTINGS */}
      {!isLoading && activeTab === 'active' && (
        <div className="space-y-4">
          {filteredActiveListings.length === 0 ? (
            <EmptyState
              icon={Package}
              title={searchQuery ? 'No Matching Items' : 'No Active Listings Yet'}
              description={
                searchQuery
                  ? `No items in your active inventory matched "${searchQuery}". Try a different keyword.`
                  : "You haven't listed any items for barter yet. Add items from your studio, closet, or workbench to start receiving barter offers."
              }
              action={
                searchQuery
                  ? { label: 'Clear Filter', onClick: () => setSearchQuery('') }
                  : { label: 'List Your First Item', onClick: () => setShowCreateListing(true) }
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActiveListings.map((listing) => {
                // Check if there are incoming offers on this specific listing
                const pendingOffersOnItem = receivedOffers.filter(
                  o => o.listingId === listing.id && (o.status === 'pending' || o.status === 'countered')
                );

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Upper Section */}
                    <div>
                      {/* Image Banner */}
                      <div className="relative aspect-16/10 w-full bg-neutral-100 overflow-hidden">
                        <img
                          src={listing.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'}
                          alt={listing.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                        />
                        
                        {/* Status badge: Published vs Draft */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs ${
                            listing.status === 'published'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-800 text-neutral-200'
                          }`}>
                            {listing.status === 'published' ? 'Active / Published' : 'Draft'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs ${getConditionBadgeStyle(listing.condition)}`}>
                            {formatConditionLabel(listing.condition)}
                          </span>
                        </div>

                        {/* Estimated Value Pill */}
                        {listing.estimatedValue !== undefined && (
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                            ~${listing.estimatedValue} Est.
                          </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-2.5">
                        {/* Category & Location */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                          <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                            {listing.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {listing.location?.city || 'Local'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 
                          onClick={() => onSelectListing(listing)}
                          className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          {listing.title}
                        </h3>

                        {/* Seeking Barter Callout */}
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-700">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-0.5">
                            <Repeat className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Desired Barter:</span>
                          </div>
                          <p className="line-clamp-2 text-neutral-600 text-[11px]">
                            {listing.desiredExchange || 'Open to fair trade proposals'}
                          </p>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                          <div className="flex items-center gap-3">
                            <span title="Marketplace Views">👁️ {listing.viewsCount || 0} views</span>
                            <span title="User Favorites">❤️ {listing.favoritesCount || 0} saves</span>
                          </div>
                          <span className="text-[10px]">
                            Listed {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Pending Offers Alert Pill */}
                        {pendingOffersOnItem.length > 0 && (
                          <button
                            onClick={() => navigate('/app/offers')}
                            className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Repeat className="w-3.5 h-3.5 text-amber-600" />
                              <span>{pendingOffersOnItem.length} Pending {pendingOffersOnItem.length === 1 ? 'Offer' : 'Offers'}</span>
                            </span>
                            <span className="text-[10px] text-amber-700 underline font-semibold">Review &rarr;</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Toolbar */}
                    <div className="p-3 pt-2 border-t border-neutral-100 bg-neutral-50/70 grid grid-cols-4 gap-1.5">
                      {/* View Action */}
                      <button
                        onClick={() => onSelectListing(listing)}
                        className="py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                        title="View Listing Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => setEditingListing(listing)}
                        className="py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                        title="Edit Item Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Offers Action */}
                      <button
                        onClick={() => navigate('/app/offers')}
                        className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px] ${
                          pendingOffersOnItem.length > 0
                            ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900 font-bold'
                            : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        }`}
                        title="Review Barter Offers"
                      >
                        <Repeat className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="hidden sm:inline">Offers</span>
                        {pendingOffersOnItem.length > 0 && (
                          <span className="text-[10px] bg-amber-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {pendingOffersOnItem.length}
                          </span>
                        )}
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => setDeletingListing(listing)}
                        className="py-2 rounded-xl bg-white hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 text-rose-600 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IN TRADE / RESERVED */}
      {!isLoading && activeTab === 'in_trade' && (
        <div className="space-y-4">
          {inTradeItems.totalCount === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="No Items Currently in Trade"
              description="When you accept a barter proposal or have your offer accepted on another item, the listing automatically transitions here while exchange logistics are coordinated."
              action={{ label: 'Explore Active Marketplace', onClick: () => navigate('/browse') }}
            />
          ) : (
            <div className="space-y-4">
              {/* Active Trade Rooms */}
              {inTradeItems.activeTrades.map((trade) => {
                const isOwner = trade.owner.id === currentUser.id;
                const partner = isOwner ? trade.requester : trade.owner;
                const badge = getTradeStatusBadge(trade.status);
                const conversation = findConversationForTrade(trade);

                return (
                  <div
                    key={trade.id}
                    className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-4 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-neutral-500">
                          Trade #{trade.id.slice(-6)} • Initiated {new Date(trade.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Trade Partner Pill */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-500">Trading with:</span>
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-200"
                        />
                        <strong className="text-neutral-900 font-bold">{partner.name}</strong>
                        <span className="text-amber-600 font-semibold">★ {partner.rating ?? 5.0}</span>
                      </div>
                    </div>

                    {/* Exchanged Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Left: Your Item */}
                      <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3.5">
                        <img
                          src={trade.listing.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'}
                          alt={trade.listing.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-200"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            {isOwner ? 'Your Item (Reserved)' : "Partner's Listing"}
                          </span>
                          <h4 className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1">
                            {trade.listing.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {trade.listing.category} • {formatConditionLabel(trade.listing.condition)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Partner's Offering */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-lg bg-emerald-100/80 flex items-center justify-center shrink-0 border border-emerald-200">
                          <Layers className="w-7 h-7 text-emerald-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {isOwner ? "Partner's Offered Exchange" : 'Your Offered Items'}
                          </span>
                          <h4 className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1">
                            {trade.exchangedItems.fromRequester.map(i => i.title).join(', ') || 'Barter Exchange Items'}
                          </h4>
                          {trade.exchangedItems.cashAdjustment ? (
                            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                              + ${trade.exchangedItems.cashAdjustment} cash adjustment
                            </p>
                          ) : (
                            <p className="text-[11px] text-neutral-500 mt-0.5">Direct item-for-item exchange</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meeting Logistics Bar */}
                    {trade.meeting && (
                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 text-neutral-700">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Exchange Location: <strong>{trade.meeting.locationName}</strong>
                          </span>
                        </div>
                        {trade.meeting.scheduledDate && (
                          <div className="flex items-center gap-1.5 text-neutral-500">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{new Date(trade.meeting.scheduledDate).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => onSelectListing(trade.listing)}
                        className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold underline cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Original Listing</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {conversation && (
                          <button
                            onClick={() => navigate('/app/messages', conversation.id)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Trade Chat</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate('/app/trades', trade.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Open Trade Room</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Any standalone reserved listings without an active trade object */}
              {inTradeItems.reservedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        Reserved for Trade
                      </span>
                      <h4 className="font-bold text-neutral-900 text-sm mt-1">{listing.title}</h4>
                      <p className="text-xs text-neutral-500">{listing.category} • ~${listing.estimatedValue || 0} Est.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectListing(listing)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/app/trades')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer"
                    >
                      Trade Rooms
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED SWAPS */}
      {!isLoading && activeTab === 'completed' && (
        <div className="space-y-4">
          {completedSwaps.totalCount === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Completed Swaps Yet"
              description="Once an in-person exchange or shipping transfer is completed and both parties verify receipt, your completed swaps are permanently archived here."
              action={{ label: 'Explore Items to Trade', onClick: () => navigate('/browse') }}
            />
          ) : (
            <div className="space-y-3">
              {completedSwaps.completedTrades.map((trade) => {
                const isOwner = trade.owner.id === currentUser.id;
                const partner = isOwner ? trade.requester : trade.owner;

                return (
                  <div
                    key={trade.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={trade.listing.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'}
                        alt={trade.listing.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Successfully Exchanged</span>
                          </span>
                          <span className="text-xs text-neutral-400">
                            Completed {trade.completedAt ? new Date(trade.completedAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <h4 className="font-bold text-neutral-900 text-sm mt-1">
                          {trade.listing.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Traded with <strong className="text-neutral-800">{partner.name}</strong> for{' '}
                          <span className="italic">{trade.exchangedItems.fromRequester.map(i => i.title).join(', ') || 'agreed items'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectListing(trade.listing)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer"
                      >
                        View Item
                      </button>
                      <button
                        onClick={() => navigate('/app/trades', trade.id)}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                      >
                        Trade Summary
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Traded listings without direct trade record */}
              {completedSwaps.tradedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase">
                        Traded
                      </span>
                      <h4 className="font-bold text-neutral-900 text-sm mt-1">{listing.title}</h4>
                      <p className="text-xs text-neutral-500">{listing.category}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectListing(listing)}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingListing && (
        <CreateListingModal
          isOpen={!!editingListing}
          initialListing={editingListing}
          onClose={() => setEditingListing(null)}
          onCreated={() => {
            setEditingListing(null);
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation Safeguard Dialog */}
      <ConfirmDialog
        isOpen={!!deletingListing}
        title={`Delete "${deletingListing?.title}"?`}
        description="Are you sure you want to delete this listing? This action cannot be undone and will permanently remove the item from barter discovery and withdraw any open proposals."
        confirmLabel="Delete Listing"
        cancelLabel="Keep Listing"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingListing(null)}
      />
    </div>
  );
}
