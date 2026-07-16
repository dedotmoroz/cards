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
  lang?: string;
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
    hasAudio?: boolean;
  } | null;
  error?: string;
  queueType?: 'generate' | 'context';
};

export type ContextReadingArtifact = {
  id: string;
  folderId: string;
  jobId: string;
  cardIds: string[];
  cardsSnapshot: Array<{ question: string; answer: string }>;
  text: string;
  translation: string;
  level: string;
  hasAudio: boolean;
  createdAt: string;
};

export type ContextReadingAudioExistsResponse = {
  hasAudio: boolean;
};

export type ContextReadingAudioGenerateResponse = {
  ok: boolean;
  hasAudio: boolean;
};

export type ContextReadingPersistRequest = {
  jobId: string;
  folderId: string;
  cardIds: string[];
  level?: string;
};

export function getContextAudioUrl(params: { jobId?: string; artifactId?: string }): string {
  const search = new URLSearchParams();
  if (params.artifactId) {
    search.set('artifactId', params.artifactId);
  } else if (params.jobId) {
    search.set('jobId', params.jobId);
  }
  return `${API_BASE_URL}/context-reading/audio?${search.toString()}`;
}

export const contextReadingApi = {
  /**
   * Получить следующие карточки для контекстного чтения
   */
  getNextCards: async (
    folderId: string,
    limit?: number,
    onlyUnlearned?: boolean,
  ): Promise<ContextReadingNextResponse> => {
    const response = await axios.post(`${API_BASE_URL}/context-reading/next`, {
      folderId,
      limit: limit ?? 3,
      ...(onlyUnlearned !== undefined ? { onlyUnlearned } : {}),
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

  getAudioExists: async (params: { jobId?: string; artifactId?: string }): Promise<ContextReadingAudioExistsResponse> => {
    const search = new URLSearchParams();
    if (params.jobId) search.set('jobId', params.jobId);
    if (params.artifactId) search.set('artifactId', params.artifactId);

    const response = await axios.get(`${API_BASE_URL}/context-reading/audio/exists?${search.toString()}`);
    return response.data;
  },

  generateAudio: async (data: { jobId: string; artifactId?: string | null }): Promise<ContextReadingAudioGenerateResponse> => {
    const response = await axios.post(`${API_BASE_URL}/context-reading/audio/generate`, {
      jobId: data.jobId,
      ...(data.artifactId ? { artifactId: data.artifactId } : {}),
    });
    return response.data;
  },

  getHistory: async (folderId: string): Promise<ContextReadingArtifact[]> => {
    const response = await axios.get(`${API_BASE_URL}/context-reading/history`, {
      params: { folderId },
    });
    return response.data.artifacts ?? [];
  },

  persist: async (data: ContextReadingPersistRequest): Promise<ContextReadingArtifact> => {
    const response = await axios.post(`${API_BASE_URL}/context-reading/persist`, data);
    return response.data;
  },
};
