import { Report, ReportReason } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface CreateReportPayload {
  reporterId: string;
  reporterName: string;
  targetType: 'listing' | 'user';
  targetId: string;
  targetTitle: string;
  reason: ReportReason;
  details: string;
}

export const reportService = {
  async submitReport(payload: CreateReportPayload): Promise<Report> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Report>('/reports', payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to submit report');
      return res.data;
    }

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      ...payload,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    mockStorage.updateState(prev => ({
      reports: [newReport, ...prev.reports],
    }));

    return newReport;
  },

  async getReports(): Promise<Report[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Report[]>('/reports');
      return res.data || [];
    }

    return mockStorage.getState().reports;
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed', resolutionNote?: string): Promise<Report> {
    let updatedReport: Report | null = null;
    mockStorage.updateState(prev => {
      const reports = prev.reports.map(r => {
        if (r.id === reportId) {
          updatedReport = { ...r, status, resolutionNote };
          return updatedReport;
        }
        return r;
      });
      return { reports };
    });
    if (!updatedReport) throw new Error('Report not found');
    return updatedReport;
  }
};
