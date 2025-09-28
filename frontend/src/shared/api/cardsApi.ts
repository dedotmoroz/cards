import axios from 'axios';
import type { Card, CreateCardData, UpdateCardData, UpdateCardLearnStatusData } from '../types/cards';

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

const API_BASE_URL = 'http://localhost:3000';

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
  }
};
