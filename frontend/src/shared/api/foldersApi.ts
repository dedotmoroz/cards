import axios from 'axios';
import type { Folder, CreateFolderData, UpdateFolderData } from '../types/folders.ts';
import { useAuthStore } from '../store/authStore';

// Настраиваем axios для работы с httpOnly cookies
axios.defaults.withCredentials = true;

const API_BASE_URL = 'http://localhost:3000';

// Получаем ID пользователя из authStore
const getUserId = () => {
    const state = useAuthStore.getState();
    return state.user?.id || null;
};

export const foldersApi = {
    /**
     * Получение всех папок пользователя
     */
    getFolders: async (): Promise<Folder[]> => {
        const userId = getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const response = await axios.get(`${API_BASE_URL}/folders/${userId}`);
        return response.data;
    },

    /**
     * Создание новой папки
     */
    createFolder: async (data: CreateFolderData): Promise<Folder> => {
        const userId = getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const response = await axios.post(`${API_BASE_URL}/folders`, {
            ...data,
            userId
        });
        return response.data;
    },

    /**
     * Обновление названия папки
     */
    updateFolder: async (id: string, data: UpdateFolderData): Promise<Folder> => {
        const response = await axios.patch(`${API_BASE_URL}/folders/${id}`, data);
        return response.data;
    },

    /**
     * Удаление папки
     */
    deleteFolder: async (id: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/folders/${id}`);
    },
};
