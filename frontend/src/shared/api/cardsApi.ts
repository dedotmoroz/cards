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

  /**
   * Экспорт карточек папки в Excel
   */
  exportCardsToExcel: async (folderId: string): Promise<void> => {
    const response = await axios.get(`${API_BASE_URL}/cards/folder/${folderId}/export`, {
      responseType: 'blob',
    });
    
    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Получаем имя файла из заголовка Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `cards_${folderId}.xlsx`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Импорт карточек из Excel файла
   */
  importCardsFromExcel: async (folderId: string, file: File): Promise<{
    message: string;
    successCount: number;
    errorCount: number;
    errors?: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/cards/folder/${folderId}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Статус подключения Google Sheets
   */
  getGoogleSheetsStatus: async (): Promise<{ connected: boolean }> => {
    const response = await axios.get(`${API_BASE_URL}/auth/google/sheets/status`);
    return response.data;
  },

  /**
   * Импорт карточек из Google Sheets
   */
  importFromGoogleSheets: async (
    folderId: string,
    params: { spreadsheetId: string; sheetName?: string }
  ): Promise<{ message: string; successCount: number; errorCount: number; errors?: string[] }> => {
    const response = await axios.post(
      `${API_BASE_URL}/cards/folder/${folderId}/import/google`,
      params
    );
    return response.data;
  },

  /**
   * Экспорт карточек в Google Sheets
   */
  exportToGoogleSheets: async (
    folderId: string,
    params?: { title?: string }
  ): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/cards/folder/${folderId}/export/google`,
      params ?? {}
    );
    return response.data;
  },
};
