import axios from 'axios';
import type { RegisterData, LoginData, User, UpdateProfileData, ChangePasswordData } from '../types/auth';
import { API_BASE_URL } from '../config/api';

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

export const authApi = {
  /**
   * Регистрация нового пользователя
   */
  register: async (data: RegisterData): Promise<void> => {
    await axios.post(`${API_BASE_URL}/auth/register`, data, {
      withCredentials: true
    });
  },

  /**
   * Обновление профиля пользователя
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await axios.patch(`${API_BASE_URL}/auth/profile`, data, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Смена пароля пользователя
   */
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await axios.post(`${API_BASE_URL}/auth/change-password`, data, {
      withCredentials: true
    });
  },

  /**
   * Вход в систему
   */
  login: async (data: LoginData): Promise<void> => {
    await axios.post(`${API_BASE_URL}/auth/login`, data, {
      withCredentials: true
    });
  },

  /**
   * Получение информации о текущем пользователе
   */
  getMe: async (): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Выход из системы
   */
  logout: async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      // Игнорируем ошибки logout, так как cookie может быть уже очищен
      console.warn('Logout error:', error);
    }
  }
};
