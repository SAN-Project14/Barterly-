import { User, Listing, Review } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  bio?: string;
  location?: {
    city: string;
    region: string;
  };
  avatar?: string;
}

export const userService = {
  async getUserById(id: string): Promise<User | null> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<User>(`/users/${id}`);
      return res.data || null;
    }
    const state = mockStorage.getState();
    return state.users.find(u => u.id === id) || null;
  },

  async updateUser(id: string, updates: UpdateUserPayload): Promise<User> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.put<User>(`/users/${id}`, updates);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update user profile');
      return res.data;
    }

    let updatedUser: User | null = null;
    mockStorage.updateState(prev => {
      const users = prev.users.map(u => {
        if (u.id === id) {
          updatedUser = {
            ...u,
            ...updates,
            location: updates.location ? { ...u.location, ...updates.location } : u.location,
          };
          return updatedUser;
        }
        return u;
      });
      return { users };
    });

    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  },

  async getUserListings(userId: string): Promise<Listing[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Listing[]>(`/users/${userId}/listings`);
      return res.data || [];
    }
    const state = mockStorage.getState();
    return state.listings.filter(l => l.ownerId === userId);
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Review[]>(`/users/${userId}/reviews`);
      return res.data || [];
    }
    const state = mockStorage.getState();
    return state.reviews.filter(r => r.revieweeId === userId);
  },

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<{ success: boolean; message: string }>(`/users/${userId}/change-password`, {
        currentPassword: currentPass,
        newPassword: newPass,
      });
      if (!res.success) throw new Error(res.error || 'Failed to change password');
      return res.data || { success: true, message: 'Password updated successfully' };
    }
    // Isolated Mock
    return { success: true, message: 'Password updated successfully (mock response)' };
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}`);
      if (!res.success) throw new Error(res.error || 'Failed to delete account');
      return res.data || { success: true, message: 'Account scheduled for deletion' };
    }

    mockStorage.updateState(prev => ({
      users: prev.users.filter(u => u.id !== userId),
      currentUserId: '',
    }));

    return { success: true, message: 'Your account has been deleted' };
  },
};
