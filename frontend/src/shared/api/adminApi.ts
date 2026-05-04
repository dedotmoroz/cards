import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  isGuest: boolean;
  isAdmin: boolean;
  foldersCount: number;
  cardsCount: number;
}

export interface AdminUserListResponse {
  rows: AdminUserListItem[];
  total: number;
}

export interface AdminUserStats {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  isGuest: boolean;
  isAdmin: boolean;
  language: string | null;
  oauthProvider: string | null;
  foldersCount: number;
  cardsCount: number;
  learnedCardsCount: number;
}

export interface AdminListUsersParams {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: 'createdAt' | 'lastLoginAt' | 'email';
  sortDirection?: 'asc' | 'desc';
}

export const adminApi = {
  listUsers: async (params: AdminListUsersParams = {}): Promise<AdminUserListResponse> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  getUserStats: async (id: string): Promise<AdminUserStats> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${id}/stats`, {
      withCredentials: true,
    });
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
      withCredentials: true,
    });
  },

  impersonate: async (id: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/users/${id}/impersonate`, {}, {
      withCredentials: true,
    });
  },

  stopImpersonation: async (): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/impersonate/stop`, {}, {
      withCredentials: true,
    });
  },
};
