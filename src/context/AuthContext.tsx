import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials, RegisterData } from '../services/authService';
import { mockStorage } from '../services/storage';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot_password') => void;
  closeAuthModal: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  requireAuth: (action: () => void) => void;
  allPersonas: User[];
  switchPersona: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allPersonas, setAllPersonas] = useState<User[]>(() => {
    try {
      const state = mockStorage.getState();
      return state?.users || [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const { showToast } = useToast();

  const loadUserData = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      const state = mockStorage.getState();
      if (state && Array.isArray(state.users)) {
        setAllPersonas(state.users);
      }
    } catch (e) {
      console.error('Failed to load user auth', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    const unsubscribe = mockStorage.subscribe(() => {
      loadUserData();
    });
    return unsubscribe;
  }, []);

  const openAuthModal = (mode: 'login' | 'register' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user } = await authService.login(credentials);
      setCurrentUser(user);
      setAuthModalOpen(false);
      showToast('Welcome back!', `Signed in as ${user.name}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      showToast('Login Failed', msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { user } = await authService.register(data);
      setCurrentUser(user);
      setAuthModalOpen(false);
      showToast('Account Created!', `Welcome to Barterly, ${user.name}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      showToast('Registration Error', msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    showToast('Signed Out', 'You have been signed out of your session', 'info');
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    try {
      const updated = await authService.updateProfile(currentUser.id, updates);
      setCurrentUser(updated);
      showToast('Profile Updated', 'Your profile details have been saved', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      showToast('Update Failed', msg, 'error');
    }
  };

  const requireAuth = (action: () => void) => {
    if (currentUser) {
      action();
    } else {
      openAuthModal('login');
      showToast('Sign In Required', 'Please sign in or create an account to proceed with this action.', 'warning');
    }
  };

  const switchPersona = async (userId: string) => {
    try {
      const state = mockStorage.getState();
      const target = (state?.users || []).find(u => u.id === userId);
      if (!target) return;
      mockStorage.updateState(() => ({ currentUserId: target.id }));
      setCurrentUser(target);
      showToast('Persona Switched', `Active user is now ${target.name}`, 'info');
    } catch (e) {
      console.error('Failed to switch persona', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        isLoading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateUserProfile,
        requireAuth,
        allPersonas,
        switchPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
