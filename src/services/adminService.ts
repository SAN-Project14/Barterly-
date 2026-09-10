import { AdminAuditLog, Listing, Report, Trade, User } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  activeListings: number;
  pendingListings: number;
  activeTrades: number;
  completedTrades: number;
  openReports: number;
  openDisputes: number;
}

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<AdminMetrics>('/admin/metrics');
      if (res.data) return res.data;
    }

    const state = mockStorage.getState();
    return {
      totalUsers: state.users.length,
      activeUsers: state.users.filter(u => u.status === 'active').length,
      activeListings: state.listings.filter(l => l.status === 'published').length,
      pendingListings: state.listings.filter(l => l.status === 'pending_review').length,
      activeTrades: state.trades.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
      completedTrades: state.trades.filter(t => t.status === 'completed').length,
      openReports: state.reports.filter(r => r.status === 'open' || r.status === 'investigating').length,
      openDisputes: state.trades.filter(t => t.status === 'disputed').length,
    };
  },

  async getUsers(): Promise<User[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<User[]>('/admin/users');
      return res.data || [];
    }
    return mockStorage.getState().users;
  },

  async updateUserStatus(
    userId: string, 
    status: 'active' | 'warned' | 'suspended' | 'banned', 
    reason: string, 
    adminName = 'Marcus Vance'
  ): Promise<User> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.put<User>(`/admin/users/${userId}/status`, { status, reason });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update user status');
      return res.data;
    }

    let updatedUser: User | null = null;
    mockStorage.updateState(prev => {
      const users = prev.users.map(u => {
        if (u.id === userId) {
          updatedUser = { ...u, status };
          return updatedUser;
        }
        return u;
      });

      const auditLog: AdminAuditLog = {
        id: `audit_${Date.now()}`,
        adminId: 'admin_1',
        adminName,
        action: `Updated User Status to ${status.toUpperCase()}`,
        targetResource: `User #${userId} (${updatedUser?.name || ''})`,
        details: reason || 'Administrative action executed via console.',
        timestamp: new Date().toISOString(),
      };

      const notifications = updatedUser ? [
        {
          id: `notif_${Date.now()}`,
          userId,
          type: 'moderation_update' as const,
          title: 'Account Status Update',
          message: `Your account status has been updated to ${status}. Reason: ${reason}`,
          linkRoute: 'profile',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ] : prev.notifications;

      return {
        users,
        auditLogs: [auditLog, ...prev.auditLogs],
        notifications,
      };
    });

    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  },

  async getListings(): Promise<Listing[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Listing[]>('/admin/listings');
      return res.data || [];
    }
    return mockStorage.getState().listings;
  },

  async getModerationListings(): Promise<Listing[]> {
    return this.getListings();
  },

  async moderateListing(
    listingId: string, 
    action: 'approve' | 'reject' | 'hide' | 'remove', 
    note: string, 
    adminName = 'Marcus Vance'
  ): Promise<Listing> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Listing>(`/admin/listings/${listingId}/moderate`, { action, note });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to moderate listing');
      return res.data;
    }

    let updatedListing: Listing | null = null;
    mockStorage.updateState(prev => {
      let nextStatus = 'published';
      if (action === 'approve') nextStatus = 'published';
      if (action === 'reject') nextStatus = 'rejected';
      if (action === 'hide') nextStatus = 'hidden';
      if (action === 'remove') nextStatus = 'archived';

      const listings = prev.listings.map(l => {
        if (l.id === listingId) {
          updatedListing = { ...l, status: nextStatus as any };
          return updatedListing;
        }
        return l;
      });

      const auditLog: AdminAuditLog = {
        id: `audit_${Date.now()}`,
        adminId: 'admin_1',
        adminName,
        action: `Listing Moderation: ${action.toUpperCase()}`,
        targetResource: `Listing #${listingId} (${updatedListing?.title || ''})`,
        details: note || 'Moderation decision recorded.',
        timestamp: new Date().toISOString(),
      };

      const notifications = updatedListing ? [
        {
          id: `notif_${Date.now()}`,
          userId: updatedListing.ownerId,
          type: (action === 'approve' ? 'listing_approved' : 'listing_rejected') as any,
          title: action === 'approve' ? 'Listing Approved' : 'Listing Status Notice',
          message: action === 'approve'
            ? `Your listing "${updatedListing.title}" is live on Barterly.`
            : `Action on "${updatedListing.title}": ${action}. Note: ${note}`,
          linkRoute: 'listings',
          linkId: listingId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ] : prev.notifications;

      return {
        listings,
        auditLogs: [auditLog, ...prev.auditLogs],
        notifications,
      };
    });

    if (!updatedListing) throw new Error('Listing not found');
    return updatedListing;
  },

  async getReports(): Promise<Report[]> {
    return mockStorage.getState().reports;
  },

  async updateReportStatus(
    reportId: string, 
    status: 'investigating' | 'resolved' | 'dismissed', 
    resolutionNote: string,
    adminName = 'Marcus Vance'
  ): Promise<Report> {
    let updatedReport: Report | null = null;
    mockStorage.updateState(prev => {
      const reports = prev.reports.map(r => {
        if (r.id === reportId) {
          updatedReport = { ...r, status, resolutionNote };
          return updatedReport;
        }
        return r;
      });

      const auditLog: AdminAuditLog = {
        id: `audit_${Date.now()}`,
        adminId: 'admin_1',
        adminName,
        action: `Report Updated: ${status.toUpperCase()}`,
        targetResource: `Report #${reportId} (${updatedReport?.targetTitle || ''})`,
        details: resolutionNote || `Status changed to ${status}.`,
        timestamp: new Date().toISOString(),
      };

      return {
        reports,
        auditLogs: [auditLog, ...prev.auditLogs],
      };
    });

    if (!updatedReport) throw new Error('Report not found');
    return updatedReport;
  },

  async getTrades(): Promise<Trade[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Trade[]>('/admin/trades');
      return res.data || [];
    }
    return mockStorage.getState().trades;
  },

  async getDisputes(): Promise<Trade[]> {
    return mockStorage.getState().trades.filter(t => t.status === 'disputed');
  },

  async resolveDispute(
    tradeId: string, 
    resolution: 'resolved' | 'dismissed', 
    resolutionNote: string,
    adminName = 'Marcus Vance'
  ): Promise<Trade> {
    let updatedTrade: Trade | null = null;
    mockStorage.updateState(prev => {
      const trades = prev.trades.map(t => {
        if (t.id === tradeId) {
          updatedTrade = {
            ...t,
            disputeStatus: resolution,
            disputeResolutionNote: resolutionNote,
            status: resolution === 'resolved' ? 'completed' : 'in_progress',
          };
          return updatedTrade;
        }
        return t;
      });

      const auditLog: AdminAuditLog = {
        id: `audit_${Date.now()}`,
        adminId: 'admin_1',
        adminName,
        action: `Resolved Dispute for Trade #${tradeId}`,
        targetResource: `Trade #${tradeId}`,
        details: resolutionNote,
        timestamp: new Date().toISOString(),
      };

      return {
        trades,
        auditLogs: [auditLog, ...prev.auditLogs],
      };
    });

    if (!updatedTrade) throw new Error('Trade not found');
    return updatedTrade;
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<AdminAuditLog[]>('/admin/audit-logs');
      return res.data || [];
    }
    return mockStorage.getState().auditLogs;
  }
};
