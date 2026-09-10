import { User } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password?: string;
  city: string;
  region: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

/**
 * Barterly Authentication Service
 * 
 * Pre-wired client service interface intended for Barterly Backend /api/v1/auth.
 * When VITE_API_URL is configured, all calls dispatch real HTTP REST requests.
 * In development mock mode, isolated mock responses are returned without simulating passwords.
 */
export const authService = {
  /**
   * Fetch current authenticated user session (GET /api/v1/auth/me)
   */
  async getCurrentUser(): Promise<User | null> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<User>('/auth/me');
      return res.data || null;
    }
    const state = mockStorage.getState();
    if (!state.currentUserId) {
      return null;
    }
    const user = state.users.find(u => u.id === state.currentUserId);
    return user || null;
  },

  /**
   * Login user (POST /api/v1/auth/login)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
      if (!res.success || !res.data) throw new Error(res.error || 'Login failed');
      return res.data;
    }

    // Isolated mock response for development UI verification
    const state = mockStorage.getState();
    const user = state.users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    mockStorage.updateState(() => ({ currentUserId: user.id }));
    return { user };
  },

  /**
   * Register new user (POST /api/v1/auth/register)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<AuthResponse>('/auth/register', data);
      if (!res.success || !res.data) throw new Error(res.error || 'Registration failed');
      return res.data;
    }

    const state = mockStorage.getState();
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      username: data.username.toLowerCase().replace(/\s+/g, ''),
      email: data.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      location: { city: data.city || 'Metro Manila', region: data.region || 'NCR' },
      rating: 5.0,
      reviewCount: 0,
      completedTradesCount: 0,
      bio: 'Barterly trader ready for fair item exchanges.',
      joinedDate: 'September 2026',
      role: 'user',
      status: 'active',
      verifiedEmail: false,
    };

    mockStorage.updateState(prev => ({
      users: [...prev.users, newUser],
      currentUserId: newUser.id,
    }));

    return { user: newUser };
  },

  /**
   * Logout user (POST /api/v1/auth/logout)
   */
  async logout(): Promise<void> {
    if (!apiClient.isMockMode) {
      await apiClient.post('/auth/logout', {});
      return;
    }
    mockStorage.updateState(() => ({ currentUserId: '' }));
  },

  /**
   * Request password reset link (POST /api/v1/auth/forgot-password)
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      if (!res.success) throw new Error(res.error || 'Password reset request failed');
      return res.data || { message: 'Reset link sent if email exists' };
    }
    return { message: `If an account exists for ${email}, a reset link has been dispatched.` };
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.requestPasswordReset(email);
  },

  /**
   * Reset password with token (POST /api/v1/auth/reset-password)
   */
  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
        token,
        password,
      });
      if (!res.success) throw new Error(res.error || 'Password reset failed');
      return res.data || { success: true, message: 'Password has been reset' };
    }
    return { success: true, message: 'Password has been reset successfully.' };
  },

  /**
   * Verify email address with token (POST /api/v1/auth/verify-email)
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<{ success: boolean; message: string }>('/auth/verify-email', { token });
      if (!res.success) throw new Error(res.error || 'Email verification failed');
      return res.data || { success: true, message: 'Email verified' };
    }

    // In mock mode, update current user's verified status
    const state = mockStorage.getState();
    if (state.currentUserId) {
      mockStorage.updateState(prev => ({
        users: prev.users.map(u => u.id === prev.currentUserId ? { ...u, verifiedEmail: true } : u),
      }));
    }
    return { success: true, message: 'Your email address has been verified.' };
  },

  /**
   * Update profile (PUT /api/v1/users/:id)
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.put<User>(`/users/${userId}`, updates);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update profile');
      return res.data;
    }

    let updatedUser: User | null = null;
    mockStorage.updateState(prev => {
      const users = prev.users.map(u => {
        if (u.id === userId) {
          updatedUser = { ...u, ...updates };
          return updatedUser;
        }
        return u;
      });
      return { users };
    });

    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  },
};
