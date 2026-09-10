import { Notification } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Notification[]>(`/notifications?userId=${userId}`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.getNotifications(userId);
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!apiClient.isMockMode) {
      await apiClient.put(`/notifications/${notificationId}/read`, {});
      return;
    }

    mockStorage.updateState(prev => ({
      notifications: prev.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    }));
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!apiClient.isMockMode) {
      await apiClient.put(`/notifications/read-all?userId=${userId}`, {});
      return;
    }

    mockStorage.updateState(prev => ({
      notifications: prev.notifications.map(n => 
        n.userId === userId ? { ...n, isRead: true } : n
      )
    }));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const notifs = await this.getNotifications(userId);
    return notifs.filter(n => !n.isRead).length;
  }
};
