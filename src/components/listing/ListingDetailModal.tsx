import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Repeat, 
  Heart, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  Flag, 
  Calendar, 
  Share2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Listing } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { favoriteService } from '../../services/favoriteService';
import { messageService } from '../../services/messageService';
import { listingService } from '../../services/listingService';
import { useToast } from '../../context/ToastContext';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onMakeOffer: (listing: Listing) => void;
  onReportListing: (listing: Listing) => void;
}

export function ListingDetailModal({
  listing,
  isOpen,
  onClose,
  onMakeOffer,
  onReportListing,
}: ListingDetailModalProps) {
  const { currentUser, requireAuth } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [activeListing, setActiveListing] = useState<Listing | null>(listing);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);

  useEffect(() => {
    setActiveListing(listing);
  }, [listing]);

  useEffect(() => {
    if (activeListing) {
      setActiveImageIdx(0);
      listingService.incrementViews(activeListing.id);
      if (currentUser) {
        favoriteService.isFavorite(currentUser.id, activeListing.id).then(setIsFavorited);
      }
      // Load related items in same category
      listingService.getListings({ category: activeListing.category }).then((items) => {
        setRelatedListings(items.filter((item) => item.id !== activeListing.id).slice(0, 4));
      }).catch(() => {});
    }
  }, [activeListing, currentUser]);

  if (!isOpen || !activeListing) return null;

  const currentItem = activeListing;
  const isOwner = currentUser?.id === currentItem.ownerId;
  const isAvailable = currentItem.status === 'published';

  const handleFavoriteToggle = () => {
    requireAuth(async () => {
      if (!currentUser) return;
      const next = await favoriteService.toggleFavorite(currentUser.id, currentItem.id);
      setIsFavorited(next);
      showToast(next ? 'Saved to Favorites' : 'Removed from Favorites', currentItem.title, 'info');
    });
  };

  const handleMessageOwner = async () => {
    requireAuth(async () => {
      if (!currentUser) return;
      if (isOwner) {
        showToast('Info', 'You are the owner of this listing', 'info');
        return;
      }
      try {
        const conv = await messageService.startOrGetConversation(currentUser.id, currentItem.ownerId, currentItem.id);
        onClose();
        navigate('/app/messages', conv.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not open chat';
        showToast('Chat Error', msg, 'error');
      }
    });
  };

  const handleMakeOfferClick = () => {
    requireAuth(() => {
      if (isOwner) {
        showToast('Notice', 'You cannot make an offer on your own listing.', 'warning');
        return;
      }
      if (!isAvailable) {
        showToast('Item Unavailable', 'This item is already reserved or traded.', 'error');
        return;
      }
      onMakeOffer(currentItem);
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link Copied', 'Listing URL copied to clipboard', 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full sm:max-w-4xl h-[92vh] sm:h-auto max-h-[92vh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden text-neutral-900 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 mb-0.5 shrink-0 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {listing.category}
            </span>
            <Badge value={listing.condition} />
            {listing.status !== 'published' && <Badge value={listing.status} />}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Share Listing"
              aria-label="Share Listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center ${
                isFavorited
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-neutral-500 hover:text-rose-600 hover:bg-neutral-100'
              }`}
              title="Save to Favorites"
              aria-label="Save to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6 flex-1 space-y-6 pb-28 sm:pb-6 touch-scroll">
          {/* Concurrent Trade UX Warning banner if unavailable */}
          {!isAvailable && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Item Currently Unavailable</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  {currentItem.status === 'reserved'
                    ? 'This item is currently reserved in an active barter agreement. Another trader has submitted an accepted offer.'
                    : 'This item has already been successfully traded and completed.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-4/3 w-full bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
                <img
                  src={currentItem.images[activeImageIdx] || currentItem.images[0]}
                  alt={currentItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {currentItem.estimatedValue && (
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md text-xs font-semibold text-white">
                    Estimated Value: ~${currentItem.estimatedValue}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {currentItem.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {currentItem.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIdx === idx
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Tags */}
              {currentItem.tags && currentItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentItem.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-600 font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Listing Details & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Title & Location */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                    {currentItem.title}
                  </h1>
                  <div className="flex items-center gap-2.5 mt-2 text-xs text-neutral-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {currentItem.location?.city || 'Local'}, {currentItem.location?.region || ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Listed {new Date(currentItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Desired Barter Callout (Crucial for Barterly) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <Repeat className="w-4 h-4 text-emerald-700" />
                    <span>Owner's Barter Wishlist</span>
                  </div>
                  <p className="text-emerald-950 font-medium text-xs sm:text-sm leading-relaxed">
                    {currentItem.desiredExchange}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Description</h4>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                    {currentItem.description}
                  </p>
                </div>

                {/* Condition Details */}
                {currentItem.conditionDetails && (
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 space-y-1">
                    <span className="font-semibold text-neutral-800">Condition Notes:</span>
                    <p>{currentItem.conditionDetails}</p>
                  </div>
                )}

                {/* Owner Profile Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentItem.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                        alt={currentItem.owner?.name || 'Owner'}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-1 ring-neutral-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-neutral-900">{currentItem.owner?.name || 'Barterly Member'}</h4>
                          {currentItem.owner?.verifiedEmail && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Email" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">@{currentItem.owner?.username || 'member'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600">★ {currentItem.owner?.rating ?? '5.0'}</div>
                      <div className="text-[10px] text-neutral-400">{currentItem.owner?.completedTradesCount ?? 0} trades</div>
                    </div>
                  </div>
                  {currentItem.owner?.bio && (
                    <p className="text-xs text-neutral-500 italic line-clamp-2">"{currentItem.owner.bio}"</p>
                  )}
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden sm:block space-y-2 pt-4 border-t border-neutral-100">
                <button
                  id="listing-make-offer-btn"
                  onClick={handleMakeOfferClick}
                  disabled={!isAvailable || isOwner}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !isAvailable || isOwner
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                  }`}
                >
                  <Repeat className="w-4 h-4 stroke-[2.2]" />
                  <span>{isOwner ? 'Your Listing' : 'Make Barter Offer'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleMessageOwner}
                    disabled={isOwner}
                    className={`py-2.5 px-3 rounded-xl border border-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isOwner ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Owner</span>
                  </button>

                  <button
                    onClick={() => onReportListing(currentItem)}
                    className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report Item</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Listings / More in this Category */}
          {relatedListings.length > 0 && (
            <div className="pt-6 border-t border-neutral-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-neutral-900">More in {currentItem.category}</h3>
                <span className="text-xs text-neutral-400">Tap to view</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedListings.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setActiveListing(rel);
                      setActiveImageIdx(0);
                    }}
                    className="group flex flex-col bg-neutral-50 hover:bg-white rounded-xl border border-neutral-200/80 p-2 cursor-pointer transition-all"
                  >
                    <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-neutral-200 mb-1.5">
                      <img
                        src={rel.images[0]}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-bold text-neutral-900 line-clamp-1 group-hover:text-emerald-600">
                      {rel.title}
                    </p>
                    <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                      Seeking: {rel.desiredExchange}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="sm:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2.5 safe-area-pb flex items-center gap-2">
          <button
            onClick={handleMessageOwner}
            disabled={isOwner}
            className="p-3 rounded-2xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer disabled:opacity-40"
            title="Message Owner"
            aria-label="Message Owner"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => onReportListing(currentItem)}
            className="p-3 rounded-2xl border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
            title="Report Item"
            aria-label="Report Item"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            id="mobile-listing-make-offer-btn"
            onClick={handleMakeOfferClick}
            disabled={!isAvailable || isOwner}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 min-h-[44px] cursor-pointer transition-all ${
              !isAvailable || isOwner
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-emerald-600 active:bg-emerald-700 text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>{isOwner ? 'Your Listing' : 'Make Barter Offer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
