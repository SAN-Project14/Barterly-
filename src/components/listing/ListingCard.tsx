import React, { useState, useMemo } from 'react';
import { Heart, MapPin, Repeat, Star, ImageIcon } from 'lucide-react';
import { Listing } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { favoriteService } from '../../services/favoriteService';
import { useToast } from '../../context/ToastContext';

interface ListingCardProps {
  key?: React.Key;
  listing: Listing;
  onSelect?: (listing: Listing) => void;
  isFavoritedInitially?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';

export function ListingCard({ listing, onSelect, isFavoritedInitially = false }: ListingCardProps) {
  const { currentUser, requireAuth } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();
  
  const [isFavorited, setIsFavorited] = useState<boolean>(isFavoritedInitially);
  const [isFavLoading, setIsFavLoading] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(listing.images?.[0] || FALLBACK_IMAGE);
  const [imageError, setImageError] = useState<boolean>(false);

  // Clean and format the requested exchange snippet
  const cleanDesiredExchange = useMemo(() => {
    if (!listing.desiredExchange || !listing.desiredExchange.trim()) {
      return 'Open to trade offers';
    }
    const cleaned = listing.desiredExchange
      .replace(/^(looking for|seeking|want|wanted|trade for|iso):?\s*/i, '')
      .trim();
    return cleaned || 'Open to trade offers';
  }, [listing.desiredExchange]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(async () => {
      if (!currentUser) return;
      setIsFavLoading(true);
      try {
        const nextState = await favoriteService.toggleFavorite(currentUser.id, listing.id);
        setIsFavorited(nextState);
        showToast(
          nextState ? 'Added to Favorites' : 'Removed from Favorites',
          listing.title,
          'info'
        );
      } catch {
        // Handled silently
      } finally {
        setIsFavLoading(false);
      }
    });
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(listing);
    } else {
      navigate('/listing', listing.id);
    }
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col h-full bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer text-neutral-900"
    >
      {/* 1. ITEM IMAGE AREA */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden shrink-0">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={listing.title}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 gap-1">
            <ImageIcon className="w-8 h-8 stroke-1" />
            <span className="text-[10px] font-medium text-neutral-500">Image unavailable</span>
          </div>
        )}

        {/* Condition & Status Badges (Top-Left) */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center gap-1 z-10 pointer-events-none">
          <Badge 
            value={listing.condition} 
            className="text-[10px] sm:text-[11px] px-2 py-0.5 font-bold shadow-2xs backdrop-blur-md bg-white/95 border border-neutral-200/90"
          />
          {listing.status && listing.status !== 'published' && (
            <Badge 
              value={listing.status}
              className="text-[10px] sm:text-[11px] px-2 py-0.5 font-bold shadow-2xs backdrop-blur-md bg-white/95"
            />
          )}
        </div>

        {/* Favorite Button (Top-Right) - Comfortable 40px/44px touch area */}
        <button
          id={`favorite-btn-${listing.id}`}
          type="button"
          onClick={handleFavoriteClick}
          disabled={isFavLoading}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer touch-manipulation z-20 shadow-2xs ${
            isFavorited
              ? 'bg-rose-50 text-rose-500 hover:bg-white'
              : 'bg-white/90 text-neutral-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
        </button>

        {/* Estimated Value Pill (Bottom-Right Reference Only) */}
        {listing.estimatedValue && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-neutral-950/75 backdrop-blur-xs text-[10px] sm:text-[11px] font-semibold text-neutral-200 pointer-events-none shadow-2xs">
            ~${listing.estimatedValue} Est.
          </div>
        )}
      </div>

      {/* 2. CARD CONTENT AREA */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3.5 justify-between min-w-0">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Category & Location Metadata */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-500 gap-1.5">
            <span className="font-bold text-emerald-700 tracking-wide uppercase truncate max-w-[55%]">
              {listing.category}
            </span>
            <span className="flex items-center gap-0.5 truncate max-w-[45%] text-neutral-500 shrink-0">
              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="truncate">{listing.location?.city || 'Local Area'}</span>
            </span>
          </div>

          {/* Item Title - Fixed 2-line height for visual consistency */}
          <h3 
            className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-snug break-words"
            title={listing.title}
          >
            {listing.title}
          </h3>

          {/* Seeking Barter Callout Box */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 text-neutral-800 min-h-[46px] sm:min-h-[50px] flex flex-col justify-center">
            <div className="flex items-center gap-1 text-emerald-800 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">
              <Repeat className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Seeking Barter:</span>
            </div>
            <p 
              className="text-[11px] sm:text-xs text-neutral-700 truncate font-medium mt-0.5"
              title={cleanDesiredExchange}
            >
              {cleanDesiredExchange}
            </p>
          </div>
        </div>

        {/* 3. FOOTER: OWNER INFO & VIEW/OFFER ACTION */}
        <div className="mt-2.5 pt-2 border-t border-neutral-100 space-y-2">
          {/* Owner Info & Rating */}
          <div className="flex items-center justify-between text-[11px] text-neutral-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={listing.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                alt={listing.owner?.name || 'Trader'}
                referrerPolicy="no-referrer"
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0 ring-1 ring-neutral-200"
              />
              <span className="truncate font-medium text-neutral-800 text-[10px] sm:text-xs">
                {listing.owner?.name ? listing.owner.name.split(' ')[0] : 'Trader'}
              </span>
            </div>
            <div className="flex items-center gap-0.5 font-bold text-amber-600 shrink-0 text-[10px] sm:text-xs">
              <Star className="w-3 h-3 fill-current" />
              <span>{listing.owner?.rating ? Number(listing.owner.rating).toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Primary View & Offer Button */}
          <div className="w-full pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="w-full py-1.5 sm:py-2 px-2.5 rounded-xl bg-neutral-100 group-hover:bg-emerald-600 group-hover:text-white text-neutral-800 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <Repeat className="w-3 h-3 shrink-0 group-hover:rotate-180 transition-transform duration-300" />
              <span>View & Offer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
