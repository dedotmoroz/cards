/**
 * Конфигурация API для разных окружений
 */

// Определяем базовый URL в зависимости от окружения
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000');

// Дополнительные настройки API
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
};

