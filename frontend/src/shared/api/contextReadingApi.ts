import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

export type ContextReadingCard = {
  id: string;
  question: string;
  answer: string;
  isLearned: boolean;
  folderId: string;
};

export type ContextReadingNextResponse = {
  cards: ContextReadingCard[];
  progress: {
    used: number;
    total: number;
  };
  completed: boolean;
};

export type ContextReadingGenerateRequest = {
  cardIds: string[];
  lang: string;
  level?: string;
};

export type ContextReadingGenerateResponse = {
  jobId: string;
};

export type ContextReadingGenerateStatusResponse = {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused' | 'not_found';
  progress: number;
  result: {
    text: string;
    translation: string;
  } | null;
  error?: string;
  queueType?: 'generate' | 'context';
};

export const contextReadingApi = {
  /**
   * Получить следующие карточки для контекстного чтения
   */
  getNextCards: async (folderId: string, limit?: number): Promise<ContextReadingNextResponse> => {
    const response = await axios.post(`${API_BASE_URL}/context-reading/next`, {
      folderId,
      limit: limit ?? 3,
    });
    return response.data;
  },

  /**
   * Сбросить прогресс контекстного чтения
   */
  resetProgress: async (folderId: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/context-reading/reset`, {
      folderId,
    });
  },

  /**
   * Запустить генерацию текста для карточек
   */
  generateText: async (data: ContextReadingGenerateRequest): Promise<ContextReadingGenerateResponse> => {
    const response = await axios.post(`${API_BASE_URL}/context-reading/generate`, data);
    return response.data;
  },

  /**
   * Получить статус генерации текста
   */
  getGenerateStatus: async (jobId: string): Promise<ContextReadingGenerateStatusResponse> => {
    const response = await axios.get(`${API_BASE_URL}/context-reading/generate-status`, {
      params: { jobId },
    });
    return response.data;
  },
};

