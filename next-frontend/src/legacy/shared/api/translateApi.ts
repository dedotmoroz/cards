import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

export const translateApi = {
  /**
   * Перевести текст
   */
  translate: async (data: TranslateRequest): Promise<TranslateResponse> => {
    const response = await axios.post<TranslateResponse>(
      `${API_BASE_URL}/translate`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },
};
