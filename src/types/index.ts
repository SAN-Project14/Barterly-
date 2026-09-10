export type ListingCondition = 'brand_new' | 'like_new' | 'good' | 'fair';

export type ListingStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'published' 
  | 'reserved' 
  | 'traded' 
  | 'archived' 
  | 'rejected' 
  | 'hidden'
  | 'removed'
  | 'reported';

export interface LocationInfo {
  city: string;
  region: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  location: LocationInfo;
  rating: number;
  reviewCount: number;
  completedTradesCount: number;
  bio?: string;
  joinedDate: string;
  role: 'user' | 'admin';
  status: 'active' | 'warned' | 'suspended' | 'banned';
  verifiedEmail: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: ListingCondition;
  conditionDetails?: string;
  location: LocationInfo;
  images: string[];
  ownerId: string;
  owner: User;
  desiredExchange: string;
  estimatedValue?: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  favoritesCount: number;
  isFeatured?: boolean;
  tags?: string[];
}

export interface OfferItem {
  id: string;
  title: string;
  condition: ListingCondition;
  category: string;
  image: string;
  estimatedValue?: number;
  description?: string;
}

export type OfferStatus = 
  | 'sent' 
  | 'pending' 
  | 'countered' 
  | 'accepted' 
  | 'rejected' 
  | 'withdrawn' 
  | 'expired' 
  | 'cancelled';

export interface OfferHistoryEntry {
  id: string;
  offerId: string;
  senderId: string;
  senderName: string;
  itemsOffered: OfferItem[];
  note?: string;
  cashAdjustment?: number;
  createdAt: string;
  type: 'initial' | 'counter';
}

export interface Offer {
  id: string;
  listingId: string;
  listing: Listing;
  requesterId: string;
  requester: User;
  ownerId: string;
  owner: User;
  offeredItems: OfferItem[];
  cashAdjustment?: number;
  note?: string;
  status: OfferStatus;
  history: OfferHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type TradeStatus = 
  | 'offer_accepted' 
  | 'trade_arranged' 
  | 'in_progress' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled';

export interface TradeMeeting {
  method: 'in_person' | 'shipping' | 'dropoff_locker';
  locationName: string;
  scheduledDate?: string;
  notes?: string;
  agreedByOwner: boolean;
  agreedByRequester: boolean;
}

export interface Trade {
  id: string;
  offerId: string;
  listing: Listing;
  owner: User;
  requester: User;
  exchangedItems: {
    fromOwner: Listing;
    fromRequester: OfferItem[];
    cashAdjustment?: number;
  };
  status: TradeStatus;
  meeting?: TradeMeeting;
  ownerConfirmedReceived: boolean;
  requesterConfirmedReceived: boolean;
  disputeReason?: string;
  disputeStatus?: 'opened' | 'under_review' | 'resolved' | 'dismissed';
  disputeResolutionNote?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  systemNotice?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  listingId?: string;
  listing?: Listing;
  tradeId?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export type NotificationType =
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_declined'
  | 'offer_countered'
  | 'offer_withdrawn'
  | 'new_message'
  | 'trade_updated'
  | 'trade_completed'
  | 'trade_disputed'
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_reported'
  | 'moderation_update'
  | 'account_security'
  | 'security_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkRoute: string;
  linkId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  tradeId: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  rating: number; // 1 - 5
  comment: string;
  tags: string[];
  createdAt: string;
}

export type ReportReason = 
  | 'suspicious' 
  | 'scam' 
  | 'fake_item' 
  | 'prohibited_item' 
  | 'inappropriate' 
  | 'harassment' 
  | 'spam' 
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'listing' | 'user';
  targetId: string;
  targetTitle: string;
  reason: ReportReason;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolutionNote?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetResource: string;
  details: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  tradeId: string;
  trade?: Trade;
  initiatorId: string;
  initiatorName: string;
  respondentId: string;
  respondentName: string;
  reason: string;
  description: string;
  status: 'opened' | 'under_review' | 'resolved' | 'dismissed';
  evidenceUrls?: string[];
  resolution?: string;
  resolvedAt?: string;
  resolvedByAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  searchQuery?: string;
  category?: string;
  condition?: ListingCondition | 'all';
  locationCity?: string;
  desiredExchange?: string;
  sortBy?: 'newest' | 'popular' | 'rating';
  minEstimatedValue?: number;
  maxEstimatedValue?: number;
}
