import { Trade, TradeMeeting, TradeStatus } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface UpdateMeetingPayload {
  tradeId: string;
  meeting: Partial<TradeMeeting>;
  agreedByRole: 'owner' | 'requester';
}

export const tradeService = {
  async getTrades(userId: string): Promise<Trade[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Trade[]>(`/trades?userId=${userId}`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.trades.filter(t => t.owner.id === userId || t.requester.id === userId);
  },

  async getUserTrades(userId: string): Promise<Trade[]> {
    return this.getTrades(userId);
  },

  async getTrade(id: string): Promise<Trade | null> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Trade>(`/trades/${id}`);
      return res.data || null;
    }

    const state = mockStorage.getState();
    return state.trades.find(t => t.id === id) || null;
  },

  async updateMeeting(payload: UpdateMeetingPayload): Promise<Trade> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.put<Trade>(`/trades/${payload.tradeId}/meeting`, payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update trade meeting');
      return res.data;
    }

    let updatedTrade: Trade | null = null;
    mockStorage.updateState(prev => {
      const trades = prev.trades.map(t => {
        if (t.id === payload.tradeId) {
          const currentMeeting = t.meeting || {
            method: 'in_person' as const,
            locationName: 'Public Exchange Point',
            agreedByOwner: false,
            agreedByRequester: false,
          };

          const newMeeting: TradeMeeting = {
            ...currentMeeting,
            ...payload.meeting,
            agreedByOwner: payload.agreedByRole === 'owner' ? true : currentMeeting.agreedByOwner,
            agreedByRequester: payload.agreedByRole === 'requester' ? true : currentMeeting.agreedByRequester,
          };

          const bothAgreed = newMeeting.agreedByOwner && newMeeting.agreedByRequester;
          const status: TradeStatus = bothAgreed ? 'trade_arranged' : t.status;

          updatedTrade = {
            ...t,
            meeting: newMeeting,
            status,
          };
          return updatedTrade;
        }
        return t;
      });

      return { trades };
    });

    if (!updatedTrade) throw new Error('Trade not found');
    return updatedTrade;
  },

  async advanceTradeStatus(tradeId: string, status: TradeStatus): Promise<Trade> {
    let updatedTrade: Trade | null = null;
    mockStorage.updateState(prev => {
      const trades = prev.trades.map(t => {
        if (t.id === tradeId) {
          updatedTrade = { ...t, status };
          return updatedTrade;
        }
        return t;
      });
      return { trades };
    });
    if (!updatedTrade) throw new Error('Trade not found');
    return updatedTrade;
  },

  async confirmReceived(tradeId: string, userId: string): Promise<Trade> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Trade>(`/trades/${tradeId}/confirm-received`, { userId });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to confirm receipt');
      return res.data;
    }

    let updatedTrade: Trade | null = null;
    mockStorage.updateState(prev => {
      const trades = prev.trades.map(t => {
        if (t.id === tradeId) {
          const isOwner = t.owner.id === userId;
          const isRequester = t.requester.id === userId;

          const ownerConfirmed = isOwner ? true : t.ownerConfirmedReceived;
          const requesterConfirmed = isRequester ? true : t.requesterConfirmedReceived;

          const bothConfirmed = ownerConfirmed && requesterConfirmed;
          const newStatus: TradeStatus = bothConfirmed ? 'completed' : 'in_progress';

          updatedTrade = {
            ...t,
            ownerConfirmedReceived: ownerConfirmed,
            requesterConfirmedReceived: requesterConfirmed,
            status: newStatus,
            completedAt: bothConfirmed ? new Date().toISOString() : undefined,
          };
          return updatedTrade;
        }
        return t;
      });

      // If completed, update listing to 'traded' and increment user completed trades count
      let listings = prev.listings;
      let users = prev.users;
      let notifications = prev.notifications;

      if (updatedTrade && updatedTrade.status === 'completed') {
        listings = prev.listings.map(l => {
          if (l.id === updatedTrade!.listing.id) {
            return { ...l, status: 'traded' as const };
          }
          return l;
        });

        users = prev.users.map(u => {
          if (u.id === updatedTrade!.owner.id || u.id === updatedTrade!.requester.id) {
            return { ...u, completedTradesCount: u.completedTradesCount + 1 };
          }
          return u;
        });

        notifications = [
          {
            id: `notif_${Date.now()}_1`,
            userId: updatedTrade.owner.id,
            type: 'trade_completed' as const,
            title: 'Trade Completed!',
            message: `Congratulations! Your barter trade for "${updatedTrade.listing.title}" is officially completed. Don't forget to leave a review.`,
            linkRoute: 'trades',
            linkId: updatedTrade.id,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: `notif_${Date.now()}_2`,
            userId: updatedTrade.requester.id,
            type: 'trade_completed' as const,
            title: 'Trade Completed!',
            message: `Congratulations! Your trade with ${updatedTrade.owner.name} is complete. Rate your trading partner.`,
            linkRoute: 'trades',
            linkId: updatedTrade.id,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.notifications
        ];
      }

      return { trades, listings, users, notifications };
    });

    if (!updatedTrade) throw new Error('Trade not found');
    return updatedTrade;
  },

  async openDispute(tradeId: string, userId: string, reason: string): Promise<Trade> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Trade>(`/trades/${tradeId}/dispute`, { userId, reason });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to open dispute');
      return res.data;
    }

    let updatedTrade: Trade | null = null;
    mockStorage.updateState(prev => {
      const trades = prev.trades.map(t => {
        if (t.id === tradeId) {
          updatedTrade = {
            ...t,
            status: 'disputed' as TradeStatus,
            disputeReason: reason,
            disputeStatus: 'opened',
          };
          return updatedTrade;
        }
        return t;
      });

      const notifications = updatedTrade ? [
        {
          id: `notif_${Date.now()}`,
          userId: updatedTrade.owner.id === userId ? updatedTrade.requester.id : updatedTrade.owner.id,
          type: 'trade_disputed' as const,
          title: 'Dispute Notice',
          message: `A dispute was submitted on Trade #${tradeId.slice(-6)}. Barterly moderators have been alerted.`,
          linkRoute: 'trades',
          linkId: tradeId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ] : prev.notifications;

      return { trades, notifications };
    });

    if (!updatedTrade) throw new Error('Trade not found');
    return updatedTrade;
  }
};
