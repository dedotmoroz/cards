import { create } from 'zustand';
import type { ChangePasswordData, UpdateProfileData, User } from '../types/auth';
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
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
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
    set({ error: null });
    try {
      await authApi.register({ name: username, email, password });
      
      // Получаем полную информацию о пользователе
      const userData = await authApi.getMe();
      // Маппим name из API в username для типа User
      const user: User = {
        ...userData,
        username: (userData as any).name || userData.username
      };
      
      set({ 
        user, 
        isAuthenticated: true,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage});
      throw new Error(errorMessage);
    }
  },

  login: async (email: string, password: string) => {
    set({ error: null });
    try {
      await authApi.login({ email, password });
      
      // Получаем полную информацию о пользователе
      const userData = await authApi.getMe();
      // Маппим name из API в username для типа User
      const user: User = {
        ...userData,
        username: (userData as any).name || userData.username
      };
      
      set({ 
        user, 
        isAuthenticated: true
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ error: null });
    try {
      await authApi.logout();
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false,
      });
    }
  },

  checkAuth: async () => {
    const currentState = get();
    
    // Если пользователь уже аутентифицирован, не делаем запрос
    if (currentState.isAuthenticated && currentState.user) {
      return;
    }

    try {
      const userData = await authApi.getMe();
      // Маппим name из API в username для типа User
      const user: User = {
        ...userData,
        username: (userData as any).name || userData.username
      };
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
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    const currentUser = get().user;
    if (!currentUser) {
      return;
    }

    set({ error: null });
    try {
      const updatedUserData = await authApi.updateProfile(data);
      // Маппим name из API в username для типа User
      const updatedUser: User = {
        ...updatedUserData,
        username: (updatedUserData as any).name || updatedUserData.username
      };
      const mergedUser = { ...currentUser, ...updatedUser } as User;

      if (typeof data.language === 'string') {
        mergedUser.language = data.language;
      }

      set({
        user: mergedUser,
        isAuthenticated: true,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage});
      throw new Error(errorMessage);
    }
  },

  changePassword: async (data: ChangePasswordData) => {
    set({ error: null });
    try {
      await authApi.changePassword(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage});
      throw new Error(errorMessage);
    }
  }
}));
