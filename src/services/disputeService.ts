import { Dispute, AdminAuditLog } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface CreateDisputePayload {
  tradeId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}

// Initial mock disputes seeded for operations console testing
const SEED_DISPUTES: Dispute[] = [
  {
    id: 'disp_1',
    tradeId: 'trade_demo_1',
    initiatorId: 'user_1',
    initiatorName: 'Alex Rivera',
    respondentId: 'user_2',
    respondentName: 'Sarah Chen',
    reason: 'Condition disparity / missing accessory',
    description: 'Item power supply was not included during physical handoff despite being listed in description.',
    status: 'opened',
    evidenceUrls: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'disp_2',
    tradeId: 'trade_demo_2',
    initiatorId: 'user_4',
    initiatorName: 'Mia Torres',
    respondentId: 'user_3',
    respondentName: 'Dave Miller',
    reason: 'No-show at designated safe spot',
    description: 'Waited at Ayala Malls Vertis North security lobby for 45 minutes; respondent did not arrive or reply to chat.',
    status: 'under_review',
    evidenceUrls: [],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

let localDisputes: Dispute[] = [...SEED_DISPUTES];

export const disputeService = {
  async getDisputes(filters?: { status?: string }): Promise<Dispute[]> {
    if (!apiClient.isMockMode) {
      const query = filters?.status ? `?status=${filters.status}` : '';
      const res = await apiClient.get<Dispute[]>(`/disputes${query}`);
      return res.data || [];
    }

    if (filters?.status && filters.status !== 'all') {
      return localDisputes.filter(d => d.status === filters.status);
    }
    return localDisputes;
  },

  async getDisputeById(id: string): Promise<Dispute | null> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Dispute>(`/disputes/${id}`);
      return res.data || null;
    }
    return localDisputes.find(d => d.id === id) || null;
  },

  async createDispute(payload: CreateDisputePayload, initiatorName = 'Current User', respondentId = 'user_2', respondentName = 'Partner'): Promise<Dispute> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Dispute>('/disputes', payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to open dispute');
      return res.data;
    }

    const newDispute: Dispute = {
      id: `disp_${Date.now()}`,
      tradeId: payload.tradeId,
      initiatorId: mockStorage.getState().currentUserId || 'user_1',
      initiatorName,
      respondentId,
      respondentName,
      reason: payload.reason,
      description: payload.description,
      status: 'opened',
      evidenceUrls: payload.evidenceUrls || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localDisputes = [newDispute, ...localDisputes];
    return newDispute;
  },

  async resolveDispute(
    id: string, 
    status: 'resolved' | 'dismissed', 
    resolutionNote: string,
    adminId = 'admin_1',
    adminName = 'Platform Admin'
  ): Promise<Dispute> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.put<Dispute>(`/admin/disputes/${id}/resolve`, {
        status,
        resolutionNote,
      });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to resolve dispute');
      return res.data;
    }

    let updated: Dispute | null = null;
    localDisputes = localDisputes.map(d => {
      if (d.id === id) {
        updated = {
          ...d,
          status,
          resolution: resolutionNote,
          resolvedAt: new Date().toISOString(),
          resolvedByAdminId: adminId,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return d;
    });

    if (!updated) throw new Error('Dispute not found');

    // Add audit log
    const auditLog: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId,
      adminName,
      action: `Resolved Dispute #${id} (${status.toUpperCase()})`,
      targetResource: `Dispute #${id} on Trade #${(updated as Dispute).tradeId}`,
      details: resolutionNote,
      timestamp: new Date().toISOString(),
    };

    mockStorage.updateState(prev => ({
      auditLogs: [auditLog, ...prev.auditLogs],
    }));

    return updated;
  },
};
