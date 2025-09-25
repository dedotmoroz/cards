import { create } from 'zustand';
import axios from 'axios';

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

interface User {
  id: string;
  username: string;
  email: string;
}

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
      const response = await axios.post('http://localhost:3000/auth/register', {
        username,
        email,
        password
      }, {
        withCredentials: true // Важно для получения httpOnly cookies
      });
      
      const { user } = response.data;
      
      // Получаем полную информацию о пользователе через /auth/me
      const meResponse = await axios.get('http://localhost:3000/auth/me', {
        withCredentials: true
      });
      
      // Синхронно обновляем состояние с полной информацией пользователя
      set({ 
        user: meResponse.data, 
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
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      }, {
        withCredentials: true // Важно для получения httpOnly cookies
      });
      
      const { user } = response.data;
      
      // Получаем полную информацию о пользователе через /auth/me
      const meResponse = await axios.get('http://localhost:3000/auth/me', {
        withCredentials: true
      });
      
      // Синхронно обновляем состояние с полной информацией пользователя
      set({ 
        user: meResponse.data, 
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
      // Вызываем logout на сервере для очистки httpOnly cookie
      await axios.post('http://localhost:3000/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      // Игнорируем ошибки logout, так как cookie может быть уже очищен
      console.warn('Logout error:', error);
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
      // Проверяем аутентификацию через защищенный эндпоинт
      // httpOnly cookie автоматически отправляется с запросом
      const response = await axios.get('http://localhost:3000/auth/me', {
        withCredentials: true
      });
      set({ 
        user: response.data, 
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
