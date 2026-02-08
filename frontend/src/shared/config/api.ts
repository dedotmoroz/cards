/**
 * Конфигурация API для разных окружений
 */

// Определяем базовый URL в зависимости от окружения
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000');

// Google OAuth Client ID для Sign-in
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Дополнительные настройки API
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
};

