import { Offer, OfferItem, OfferStatus, Trade } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface CreateOfferPayload {
  listingId: string;
  requesterId: string;
  offeredItems: OfferItem[];
  cashAdjustment?: number;
  note?: string;
}

export interface CounterOfferPayload {
  offerId: string;
  senderId: string;
  senderName: string;
  itemsOffered: OfferItem[];
  cashAdjustment?: number;
  note?: string;
}

export const offerService = {
  async getOffers(userId: string, filter: 'all' | 'received' | 'sent' = 'all'): Promise<Offer[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Offer[]>(`/offers?userId=${userId}&type=${filter}`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.offers.filter(o => {
      if (filter === 'received') return o.ownerId === userId;
      if (filter === 'sent') return o.requesterId === userId;
      return o.ownerId === userId || o.requesterId === userId;
    });
  },

  async getReceivedOffers(userId: string): Promise<Offer[]> {
    return this.getOffers(userId, 'received');
  },

  async getSentOffers(userId: string): Promise<Offer[]> {
    return this.getOffers(userId, 'sent');
  },

  async getOffer(id: string): Promise<Offer | null> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Offer>(`/offers/${id}`);
      return res.data || null;
    }

    const state = mockStorage.getState();
    return state.offers.find(o => o.id === id) || null;
  },

  async createOffer(payload: CreateOfferPayload): Promise<Offer> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Offer>('/offers', payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create offer');
      return res.data;
    }

    const state = mockStorage.getState();
    const listing = state.listings.find(l => l.id === payload.listingId);
    const requester = state.users.find(u => u.id === payload.requesterId);
    if (!listing) throw new Error('Listing does not exist');
    if (!requester) throw new Error('Requester user does not exist');

    const newOffer: Offer = {
      id: `off_${Date.now()}`,
      listingId: listing.id,
      listing,
      requesterId: requester.id,
      requester,
      ownerId: listing.ownerId,
      owner: listing.owner,
      offeredItems: payload.offeredItems,
      cashAdjustment: payload.cashAdjustment || 0,
      note: payload.note || '',
      status: 'pending',
      history: [
        {
          id: `hist_${Date.now()}`,
          offerId: `off_${Date.now()}`,
          senderId: requester.id,
          senderName: requester.name,
          itemsOffered: payload.offeredItems,
          note: payload.note || 'Initial barter offer submitted.',
          cashAdjustment: payload.cashAdjustment || 0,
          createdAt: new Date().toISOString(),
          type: 'initial',
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add notification for listing owner
    const notification = {
      id: `notif_${Date.now()}`,
      userId: listing.ownerId,
      type: 'new_offer' as const,
      title: 'New Barter Offer Received',
      message: `${requester.name} made an offer on "${listing.title}".`,
      linkRoute: 'offers',
      linkId: newOffer.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    mockStorage.updateState(prev => ({
      offers: [newOffer, ...prev.offers],
      notifications: [notification, ...prev.notifications],
    }));

    return newOffer;
  },

  async counterOffer(payload: CounterOfferPayload): Promise<Offer> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Offer>(`/offers/${payload.offerId}/counter`, payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to send counter offer');
      return res.data;
    }

    let updatedOffer: Offer | null = null;
    mockStorage.updateState(prev => {
      const offers = prev.offers.map(o => {
        if (o.id === payload.offerId) {
          const counterEntry = {
            id: `hist_${Date.now()}`,
            offerId: o.id,
            senderId: payload.senderId,
            senderName: payload.senderName,
            itemsOffered: payload.itemsOffered,
            note: payload.note,
            cashAdjustment: payload.cashAdjustment || 0,
            createdAt: new Date().toISOString(),
            type: 'counter' as const,
          };
          updatedOffer = {
            ...o,
            offeredItems: payload.itemsOffered,
            cashAdjustment: payload.cashAdjustment ?? o.cashAdjustment,
            note: payload.note || o.note,
            status: 'countered',
            history: [...o.history, counterEntry],
            updatedAt: new Date().toISOString(),
          };
          return updatedOffer;
        }
        return o;
      });

      // Target user to notify is the other party
      const targetUserId = updatedOffer?.requesterId === payload.senderId ? updatedOffer?.ownerId : updatedOffer?.requesterId;
      const notifications = targetUserId ? [
        {
          id: `notif_${Date.now()}`,
          userId: targetUserId,
          type: 'offer_countered' as const,
          title: 'Counter-Offer Received',
          message: `${payload.senderName} sent a counter-proposal on "${updatedOffer?.listing.title}".`,
          linkRoute: 'offers',
          linkId: payload.offerId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ] : prev.notifications;

      return { offers, notifications };
    });

    if (!updatedOffer) throw new Error('Offer not found');
    return updatedOffer;
  },

  async acceptOffer(offerId: string): Promise<{ offer: Offer; trade: Trade }> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<{ offer: Offer; trade: Trade }>(`/offers/${offerId}/accept`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to accept offer');
      return res.data;
    }

    let targetOffer: Offer | null = null;
    let newTrade: Trade | null = null;

    mockStorage.updateState(prev => {
      const offers = prev.offers.map(o => {
        if (o.id === offerId) {
          targetOffer = { ...o, status: 'accepted' as OfferStatus, updatedAt: new Date().toISOString() };
          return targetOffer;
        }
        return o;
      });

      if (!targetOffer) return {};

      // Mark listing as reserved
      const listings = prev.listings.map(l => {
        if (l.id === targetOffer!.listingId) {
          return { ...l, status: 'reserved' as const };
        }
        return l;
      });

      // Create new active Trade
      newTrade = {
        id: `trade_${Date.now()}`,
        offerId: targetOffer.id,
        listing: targetOffer.listing,
        owner: targetOffer.owner,
        requester: targetOffer.requester,
        exchangedItems: {
          fromOwner: targetOffer.listing,
          fromRequester: targetOffer.offeredItems,
          cashAdjustment: targetOffer.cashAdjustment,
        },
        status: 'offer_accepted',
        meeting: {
          method: 'in_person',
          locationName: `${targetOffer.listing?.location?.city || 'Local'} Public Meetup Point`,
          scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          notes: 'Standard safe marketplace meeting place.',
          agreedByOwner: true,
          agreedByRequester: false,
        },
        ownerConfirmedReceived: false,
        requesterConfirmedReceived: false,
        createdAt: new Date().toISOString(),
      };

      const notifications = [
        {
          id: `notif_${Date.now()}`,
          userId: targetOffer.requesterId,
          type: 'offer_accepted' as const,
          title: 'Barter Offer Accepted!',
          message: `${targetOffer.owner.name} accepted your offer for "${targetOffer.listing.title}". Trade workflow is now active!`,
          linkRoute: 'trades',
          linkId: newTrade.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ];

      return {
        offers,
        listings,
        trades: [newTrade, ...prev.trades],
        notifications,
      };
    });

    if (!targetOffer || !newTrade) throw new Error('Offer acceptance could not complete');
    return { offer: targetOffer, trade: newTrade };
  },

  async rejectOffer(offerId: string): Promise<Offer> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Offer>(`/offers/${offerId}/reject`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to reject offer');
      return res.data;
    }

    let updatedOffer: Offer | null = null;
    mockStorage.updateState(prev => {
      const offers = prev.offers.map(o => {
        if (o.id === offerId) {
          updatedOffer = { ...o, status: 'rejected' as OfferStatus, updatedAt: new Date().toISOString() };
          return updatedOffer;
        }
        return o;
      });

      const notifications = updatedOffer ? [
        {
          id: `notif_${Date.now()}`,
          userId: updatedOffer.requesterId,
          type: 'offer_declined' as const,
          title: 'Offer Declined',
          message: `Your barter offer on "${updatedOffer.listing.title}" was declined.`,
          linkRoute: 'offers',
          linkId: updatedOffer.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ] : prev.notifications;

      return { offers, notifications };
    });

    if (!updatedOffer) throw new Error('Offer not found');
    return updatedOffer;
  },

  async withdrawOffer(offerId: string): Promise<Offer> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Offer>(`/offers/${offerId}/withdraw`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to withdraw offer');
      return res.data;
    }

    let updatedOffer: Offer | null = null;
    mockStorage.updateState(prev => {
      const offers = prev.offers.map(o => {
        if (o.id === offerId) {
          updatedOffer = { ...o, status: 'withdrawn' as OfferStatus, updatedAt: new Date().toISOString() };
          return updatedOffer;
        }
        return o;
      });
      return { offers };
    });

    if (!updatedOffer) throw new Error('Offer not found');
    return updatedOffer;
  }
};
