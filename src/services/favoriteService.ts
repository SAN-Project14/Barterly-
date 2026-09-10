import { Listing } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export const favoriteService = {
  async getFavorites(userId: string): Promise<Listing[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Listing[]>(`/favorites?userId=${userId}`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    const favIds = state.favorites[userId] || [];
    return state.listings.filter(l => favIds.includes(l.id));
  },

  async getUserFavorites(userId: string): Promise<Listing[]> {
    return this.getFavorites(userId);
  },

  async getFavoriteIds(userId: string): Promise<string[]> {
    const state = mockStorage.getState();
    return state.favorites[userId] || [];
  },

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const state = mockStorage.getState();
    const favIds = state.favorites[userId] || [];
    return favIds.includes(listingId);
  },

  async toggleFavorite(userId: string, listingId: string): Promise<boolean> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<{ isFavorite: boolean }>(`/favorites/toggle`, { userId, listingId });
      return res.data?.isFavorite ?? false;
    }

    let isFav = false;
    mockStorage.updateState(prev => {
      const current = prev.favorites[userId] || [];
      const exists = current.includes(listingId);
      isFav = !exists;

      const nextFavs = exists
        ? current.filter(id => id !== listingId)
        : [...current, listingId];

      const listings = prev.listings.map(l => {
        if (l.id === listingId) {
          return {
            ...l,
            favoritesCount: Math.max(0, l.favoritesCount + (isFav ? 1 : -1)),
          };
        }
        return l;
      });

      return {
        favorites: {
          ...prev.favorites,
          [userId]: nextFavs,
        },
        listings,
      };
    });

    return isFav;
  }
};
