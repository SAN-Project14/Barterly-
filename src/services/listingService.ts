import { Listing, FilterOptions, ListingStatus } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export const listingService = {
  async getListings(filters?: FilterOptions): Promise<Listing[]> {
    if (!apiClient.isMockMode) {
      const queryParams = new URLSearchParams();
      if (filters?.searchQuery) queryParams.set('q', filters.searchQuery);
      if (filters?.category && filters.category !== 'All Categories') queryParams.set('category', filters.category);
      if (filters?.condition && filters.condition !== 'all') queryParams.set('condition', filters.condition);
      if (filters?.sortBy) queryParams.set('sortBy', filters.sortBy);
      const res = await apiClient.get<Listing[]>(`/listings?${queryParams.toString()}`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    let result = state.listings.filter(l => l.status === 'published' || l.status === 'reserved');

    if (filters) {
      if (filters.searchQuery?.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        result = result.filter(l => 
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.desiredExchange.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.tags?.some(t => t.toLowerCase().includes(q))
        );
      }

      if (filters.category && filters.category !== 'All Categories') {
        result = result.filter(l => l.category === filters.category);
      }

      if (filters.condition && filters.condition !== 'all') {
        result = result.filter(l => l.condition === filters.condition);
      }

      if (filters.locationCity?.trim()) {
        const loc = filters.locationCity.toLowerCase().trim();
        result = result.filter(l => 
          (l.location?.city?.toLowerCase() || '').includes(loc) ||
          (l.location?.region?.toLowerCase() || '').includes(loc)
        );
      }

      if (filters.sortBy === 'popular') {
        result.sort((a, b) => ((b.viewsCount || 0) + (b.favoritesCount || 0) * 3) - ((a.viewsCount || 0) + (a.favoritesCount || 0) * 3));
      } else if (filters.sortBy === 'rating') {
        result.sort((a, b) => (b.owner?.rating ?? 5) - (a.owner?.rating ?? 5));
      } else {
        // default newest
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return result;
  },

  async getListing(id: string): Promise<Listing | null> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Listing>(`/listings/${id}`);
      return res.data || null;
    }

    const state = mockStorage.getState();
    const item = state.listings.find(l => l.id === id);
    return item || null;
  },

  async getListingById(id: string): Promise<Listing | null> {
    return this.getListing(id);
  },

  async createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount'>): Promise<Listing> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Listing>('/listings', data);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create listing');
      return res.data;
    }

    const newListing: Listing = {
      ...data,
      id: `list_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 1,
      favoritesCount: 0,
      status: data.status || 'published',
    };

    mockStorage.updateState(prev => ({
      listings: [newListing, ...prev.listings],
    }));

    return newListing;
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.put<Listing>(`/listings/${id}`, updates);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update listing');
      return res.data;
    }

    let updated: Listing | null = null;
    mockStorage.updateState(prev => {
      const listings = prev.listings.map(item => {
        if (item.id === id) {
          updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
          return updated;
        }
        return item;
      });
      return { listings };
    });

    if (!updated) throw new Error('Listing not found');
    return updated;
  },

  async updateListingStatus(id: string, status: ListingStatus): Promise<Listing> {
    return this.updateListing(id, { status });
  },

  async deleteListing(id: string): Promise<void> {
    if (!apiClient.isMockMode) {
      await apiClient.delete(`/listings/${id}`);
      return;
    }

    mockStorage.updateState(prev => ({
      listings: prev.listings.filter(l => l.id !== id),
    }));
  },

  async getUserListings(userId: string): Promise<Listing[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Listing[]>(`/users/${userId}/listings`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.listings.filter(l => l.ownerId === userId);
  },

  async incrementViews(id: string): Promise<void> {
    mockStorage.updateState(prev => ({
      listings: prev.listings.map(l => l.id === id ? { ...l, viewsCount: l.viewsCount + 1 } : l)
    }));
  }
};
