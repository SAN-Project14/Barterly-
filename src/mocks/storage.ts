import { 
  User, 
  Listing, 
  Offer, 
  Trade, 
  Conversation, 
  Message, 
  Notification, 
  Review, 
  Report, 
  AdminAuditLog 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_LISTINGS, 
  INITIAL_OFFERS, 
  INITIAL_TRADES, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REVIEWS, 
  INITIAL_REPORTS, 
  INITIAL_AUDIT_LOGS 
} from './mockData';

interface BarterlyStorageState {
  users: User[];
  listings: Listing[];
  offers: Offer[];
  trades: Trade[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  notifications: Notification[];
  favorites: Record<string, string[]>; // userId -> listingIds
  reviews: Review[];
  reports: Report[];
  auditLogs: AdminAuditLog[];
  currentUserId: string;
}

const STORAGE_KEY = 'barterly_state_v2';
const LEGACY_STORAGE_KEY = 'barterly_state_v1';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

class StorageManager {
  private state: BarterlyStorageState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private sanitizeUser(u: Partial<User> | undefined, fallback: User): User {
    if (!u) return { ...fallback };
    return {
      ...fallback,
      ...u,
      avatar: u.avatar || fallback.avatar || DEFAULT_AVATAR,
      name: u.name || fallback.name,
      username: u.username || fallback.username,
      rating: u.rating ?? fallback.rating ?? 5.0,
      completedTradesCount: u.completedTradesCount ?? fallback.completedTradesCount ?? 0,
      location: {
        city: u.location?.city || fallback.location?.city || 'Quezon City',
        region: u.location?.region || fallback.location?.region || 'Metro Manila',
      },
    };
  }

  private sanitizeState(raw: Partial<BarterlyStorageState>): BarterlyStorageState {
    const rawUsers = Array.isArray(raw.users) && raw.users.length > 0 ? raw.users : INITIAL_USERS;
    const usersMap = new Map<string, User>();

    const users = rawUsers.map((u, idx) => {
      const fallback = INITIAL_USERS[idx % INITIAL_USERS.length];
      const sanitized = this.sanitizeUser(u, fallback);
      usersMap.set(sanitized.id, sanitized);
      return sanitized;
    });

    // Ensure all INITIAL_USERS exist in usersMap
    INITIAL_USERS.forEach(iu => {
      if (!usersMap.has(iu.id)) {
        usersMap.set(iu.id, iu);
        users.push(iu);
      }
    });

    const defaultOwner = users[0] || INITIAL_USERS[0];

    const rawListings = Array.isArray(raw.listings) && raw.listings.length > 0 ? raw.listings : INITIAL_LISTINGS;
    const listings = rawListings.map((l, idx) => {
      const fallbackListing = INITIAL_LISTINGS[idx % INITIAL_LISTINGS.length];
      const owner = (l.ownerId ? usersMap.get(l.ownerId) : null) || 
                    (l.owner ? this.sanitizeUser(l.owner, defaultOwner) : defaultOwner);
      return {
        ...fallbackListing,
        ...l,
        ownerId: owner.id,
        owner,
        location: {
          city: l.location?.city || owner.location?.city || 'Quezon City',
          region: l.location?.region || owner.location?.region || 'Metro Manila',
        },
      };
    });

    const listingsMap = new Map<string, Listing>();
    listings.forEach(l => listingsMap.set(l.id, l));

    const defaultListing = listings[0] || INITIAL_LISTINGS[0];

    const rawOffers = Array.isArray(raw.offers) && raw.offers.length > 0 ? raw.offers : INITIAL_OFFERS;
    const offers = rawOffers.map((o, idx) => {
      const fallbackOffer = INITIAL_OFFERS[idx % INITIAL_OFFERS.length];
      const listing = (o.listingId ? listingsMap.get(o.listingId) : null) || 
                      o.listing || defaultListing;
      const owner = (o.ownerId ? usersMap.get(o.ownerId) : null) || 
                    (o.owner ? this.sanitizeUser(o.owner, defaultOwner) : defaultOwner);
      const requester = (o.requesterId ? usersMap.get(o.requesterId) : null) || 
                        (o.requester ? this.sanitizeUser(o.requester, users[1] || defaultOwner) : (users[1] || defaultOwner));
      return {
        ...fallbackOffer,
        ...o,
        listing,
        owner,
        requester,
      };
    });

    const rawTrades = Array.isArray(raw.trades) && raw.trades.length > 0 ? raw.trades : INITIAL_TRADES;
    const trades = rawTrades.map((t, idx) => {
      const fallbackTrade = INITIAL_TRADES[idx % INITIAL_TRADES.length];
      const listing = (t.listing?.id ? listingsMap.get(t.listing.id) : null) || 
                      t.listing || defaultListing;
      const owner = (t.owner?.id ? usersMap.get(t.owner.id) : null) || 
                    (t.owner ? this.sanitizeUser(t.owner, defaultOwner) : defaultOwner);
      const requester = (t.requester?.id ? usersMap.get(t.requester.id) : null) || 
                        (t.requester ? this.sanitizeUser(t.requester, users[1] || defaultOwner) : (users[1] || defaultOwner));
      return {
        ...fallbackTrade,
        ...t,
        listing,
        owner,
        requester,
      };
    });

    return {
      users,
      listings,
      offers,
      trades,
      conversations: Array.isArray(raw.conversations) ? raw.conversations : INITIAL_CONVERSATIONS,
      messages: raw.messages && typeof raw.messages === 'object' ? raw.messages : INITIAL_MESSAGES,
      notifications: Array.isArray(raw.notifications) ? raw.notifications : INITIAL_NOTIFICATIONS,
      favorites: raw.favorites && typeof raw.favorites === 'object' ? raw.favorites : { 'user_1': ['list_2', 'list_4'] },
      reviews: Array.isArray(raw.reviews) ? raw.reviews : INITIAL_REVIEWS,
      reports: Array.isArray(raw.reports) ? raw.reports : INITIAL_REPORTS,
      auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs : INITIAL_AUDIT_LOGS,
      currentUserId: raw.currentUserId === '' 
        ? '' 
        : (raw.currentUserId && usersMap.has(raw.currentUserId) 
            ? raw.currentUserId 
            : (raw.currentUserId === undefined ? 'user_1' : '')),
    };
  }

  private loadInitialState(): BarterlyStorageState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = this.sanitizeState(parsed);
        this.saveState(sanitized);
        return sanitized;
      }
    } catch {
      // Fallback if parsing fails
    }

    const defaultState: BarterlyStorageState = this.sanitizeState({
      users: INITIAL_USERS,
      listings: INITIAL_LISTINGS,
      offers: INITIAL_OFFERS,
      trades: INITIAL_TRADES,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      notifications: INITIAL_NOTIFICATIONS,
      favorites: {
        'user_1': ['list_2', 'list_4'],
      },
      reviews: INITIAL_REVIEWS,
      reports: INITIAL_REPORTS,
      auditLogs: INITIAL_AUDIT_LOGS,
      currentUserId: 'user_1',
    });

    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: BarterlyStorageState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  public getState(): BarterlyStorageState {
    return this.state;
  }

  public updateState(updater: (prev: BarterlyStorageState) => Partial<BarterlyStorageState>) {
    const changes = updater(this.state);
    this.state = {
      ...this.state,
      ...changes,
    };
    this.saveState(this.state);
    this.notify();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public saveUser(user: User) {
    this.updateState(prev => ({
      users: prev.users.map(u => u.id === user.id ? user : u),
    }));
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadInitialState();
    this.notify();
  }
}

export const mockStorage = new StorageManager();
