import axios from 'axios';
import type {
  Card,
  CreateCardData,
  UpdateCardData,
  UpdateCardLearnStatusData,
  CardGenerationRequest,
  CardGenerationTriggerResponse,
  CardGenerationStatusResponse,
} from '../types/cards';
import { API_BASE_URL } from '../config/api';

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

export const cardsApi = {
  /**
   * Создание новой карточки
   */
  createCard: async (data: CreateCardData): Promise<Card> => {
    const response = await axios.post(`${API_BASE_URL}/cards`, data);
    return response.data;
  },

  /**
   * Получение карточек папки
   */
  getCards: async (folderId: string): Promise<Card[]> => {
    const response = await axios.get(`${API_BASE_URL}/cards/folder/${folderId}`);
    return response.data;
  },

  /**
   * Обновление карточки
   */
  updateCard: async (id: string, data: UpdateCardData): Promise<Card> => {
    const response = await axios.patch(`${API_BASE_URL}/cards/${id}`, data);
    return response.data;
  },

  /**
   * Обновление статуса изучения карточки
   */
  updateCardLearnStatus: async (id: string, data: UpdateCardLearnStatusData): Promise<Card> => {
    const response = await axios.patch(`${API_BASE_URL}/cards/${id}/learn-status`, data);
    return response.data;
  },

  /**
   * Удаление карточки
   */
  deleteCard: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/cards/${id}`);
  },

  /**
   * Запуск генерации предложений для карточки
   */
  generateCardSentences: async (
    id: string,
    data: CardGenerationRequest = {},
  ): Promise<CardGenerationTriggerResponse> => {
    const response = await axios.post(`${API_BASE_URL}/cards/${id}/generate`, data);
    return response.data;
  },

  /**
   * Получение статуса генерации предложений
   */
  getCardGenerationStatus: async (
    id: string,
    params: { jobId: string },
  ): Promise<CardGenerationStatusResponse> => {
    const response = await axios.get(`${API_BASE_URL}/cards/${id}/generate-status`, {
      params,
    });
    return response.data;
  },
};
