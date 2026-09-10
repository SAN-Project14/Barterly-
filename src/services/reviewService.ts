import { Review } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface CreateReviewPayload {
  tradeId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  tags: string[];
}

export const reviewService = {
  async getReviewsForUser(userId: string): Promise<Review[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Review[]>(`/users/${userId}/reviews`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.reviews.filter(r => r.revieweeId === userId);
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    return this.getReviewsForUser(userId);
  },

  async submitReview(payload: CreateReviewPayload): Promise<Review> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Review>('/reviews', payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to submit review');
      return res.data;
    }

    const state = mockStorage.getState();
    const reviewer = state.users.find(u => u.id === payload.reviewerId);
    if (!reviewer) throw new Error('Reviewer not found');

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      tradeId: payload.tradeId,
      reviewerId: payload.reviewerId,
      reviewer,
      revieweeId: payload.revieweeId,
      rating: payload.rating,
      comment: payload.comment,
      tags: payload.tags,
      createdAt: new Date().toISOString(),
    };

    mockStorage.updateState(prev => {
      // Re-calculate user average rating
      const userReviews = [...prev.reviews.filter(r => r.revieweeId === payload.revieweeId), newReview];
      const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;

      const users = prev.users.map(u => {
        if (u.id === payload.revieweeId) {
          return {
            ...u,
            rating: Number(avg.toFixed(1)),
            reviewCount: userReviews.length,
          };
        }
        return u;
      });

      return {
        reviews: [newReview, ...prev.reviews],
        users,
      };
    });

    return newReview;
  }
};
