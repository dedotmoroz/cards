import axios from 'axios';
import type { RegisterData, LoginData, User, UpdateProfileData, ChangePasswordData, GuestData, RegisterGuestData } from '../types/auth';
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
    await axios.patch(`${API_BASE_URL}/auth/password`, data, {
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
  },

  /**
   * Обновление языка пользователя
   */
  updateLanguage: async (language: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/auth/language`, { language }, {
      withCredentials: true
    });
  },

  /**
   * Создание гостевого пользователя
   */
  createGuest: async (data: GuestData): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/auth/guests`, data, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Регистрация гостевого пользователя в постоянный профиль
   */
  registerGuest: async (guestId: string, data: RegisterGuestData): Promise<User> => {
    const response = await axios.patch(`${API_BASE_URL}/auth/guests/${guestId}`, data, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Получение JWT токена по clientId и авторизационной куке
   */
  getToken: async (clientId: string): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/auth/token`, { clientId }, {
      withCredentials: true
    });
    return response.data.token;
  },

  /**
   * Привязка Telegram аккаунта к пользователю
   */
  bindTelegram: async (nonce: string): Promise<{ ok: boolean }> => {
    const response = await axios.post(
      `${API_BASE_URL}/telegram/auth/bind`,
      { nonce },
      { withCredentials: true }
    );
    return response.data;
  }
};
