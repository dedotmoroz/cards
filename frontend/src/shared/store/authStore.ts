import { create } from 'zustand';
import type { User } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth operations
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register({ username, email, password });
      
      // Получаем полную информацию о пользователе
      const user = await authApi.getMe();
      
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.login({ email, password });
      
      // Получаем полную информацию о пользователе
      const user = await authApi.getMe();
      
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  checkAuth: async () => {
    const currentState = get();
    
    // Если пользователь уже аутентифицирован, не делаем запрос
    if (currentState.isAuthenticated && currentState.user) {
      return;
    }
    
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      set({ 
        user, 
        isAuthenticated: true 
      });
    } catch (error) {
      // Пользователь не аутентифицирован или токен недействителен
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));
