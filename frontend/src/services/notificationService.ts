import api from './api';
import { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<{ notifications: NotificationItem[]; unread_count: number }> => {
    const response = await api.get<ApiResponse<{ notifications: NotificationItem[]; unread_count: number }>>('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};
