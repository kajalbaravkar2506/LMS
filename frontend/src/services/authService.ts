import api from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User; redirect_url: string }> => {
    const res = await api.post<ApiResponse<{ token: string; user: User; redirect_url: string }>>('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (payload: {
    full_name: string;
    email: string;
    password: string;
    department?: string;
    year?: number;
    semester?: number;
    phone?: string;
  }): Promise<{ token: string; user: User; redirect_url: string }> => {
    const res = await api.post<ApiResponse<{ token: string; user: User; redirect_url: string }>>('/auth/register', payload);
    return res.data.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (payload: Partial<User> & Record<string, any>): Promise<User> => {
    const res = await api.put<ApiResponse<User>>('/auth/profile', payload);
    return res.data.data;
  },

  changePassword: async (old_password: string, new_password: string): Promise<void> => {
    await api.post<ApiResponse<null>>('/auth/change-password', { old_password, new_password });
  },

  logout: async (): Promise<void> => {
    try {
      await api.post<ApiResponse<null>>('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
  }
};
