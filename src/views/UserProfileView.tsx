import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Star, 
  MessageSquare, 
  Flag, 
  Package, 
  CheckCircle2 
} from 'lucide-react';
import { User, Listing, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { listingService } from '../services/listingService';
import { reviewService } from '../services/reviewService';
import { messageService } from '../services/messageService';
import { ListingGrid } from '../components/listing/ListingGrid';
import { useToast } from '../context/ToastContext';

interface UserProfileViewProps {
  userId?: string;
  onSelectListing: (listing: Listing) => void;
  onReportUser: (user: User) => void;
}

export function UserProfileView({ userId, onSelectListing, onReportUser }: UserProfileViewProps) {
  const { currentUser, allPersonas = [], requireAuth } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const profileId = userId || currentUser?.id;
    if (profileId) {
      const found = (allPersonas || []).find(p => p.id === profileId) || currentUser;
      setTargetUser(found || null);

      Promise.all([
        listingService.getUserListings(profileId),
        reviewService.getUserReviews(profileId),
      ]).then(([listings, reviews]) => {
        setUserListings(listings);
        setUserReviews(reviews);
        setIsLoading(false);
      });
    }
  }, [userId, currentUser, allPersonas]);

  if (!targetUser) return null;

  const isMe = currentUser?.id === targetUser.id;

  const handleMessage = async () => {
    requireAuth(async () => {
      if (!currentUser || isMe) return;
      try {
        const conv = await messageService.startOrGetConversation(currentUser.id, targetUser.id);
        navigate('/app/messages', conv.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not open chat';
        showToast('Error', msg, 'error');
      }
    });
  };

  return (
    <div className="space-y-8 pb-16 text-neutral-900">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={targetUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
              alt={targetUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-neutral-200 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {targetUser.name}
                </h1>
                {targetUser.verifiedEmail && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Verified Trader
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">@{targetUser.username}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {targetUser.rating} ({targetUser.completedTradesCount} completed barters)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {targetUser.location?.city || 'Local'}, {targetUser.location?.region || ''}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Member since {targetUser.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {!isMe && (
              <>
                <button
                  onClick={handleMessage}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => onReportUser(targetUser)}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Report User"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </>
            )}
            {isMe && (
              <button
                onClick={() => navigate('/app/settings')}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {targetUser.bio && (
          <p className="mt-6 pt-6 border-t border-neutral-100 text-xs text-neutral-600 leading-relaxed max-w-2xl">
            {targetUser.bio}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Listed Items ({userListings.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Reputation & Reviews ({userReviews.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'listings' ? (
        <ListingGrid
          listings={userListings}
          isLoading={isLoading}
          onSelectListing={onSelectListing}
          emptyTitle="No Items Listed"
          emptyDescription="This trader does not have any active items available right now."
        />
      ) : (
        <div className="space-y-3">
          {userReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-neutral-900">
                    Trader Review
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed italic">
                "{rev.comment}"
              </p>

              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rev.tags.map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {userReviews.length === 0 && (
            <div className="p-8 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-xs text-neutral-500">
              No written reviews recorded yet. Reviews are posted following completed trades.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
