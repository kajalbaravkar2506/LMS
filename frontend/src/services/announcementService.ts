import api from './api';
import { ApiResponse, Announcement } from '../types';

export const announcementService = {
  getAnnouncements: async (params?: { course_id?: number; is_global?: boolean }): Promise<Announcement[]> => {
    const response = await api.get<ApiResponse<Announcement[]>>('/announcements', { params });
    return response.data.data;
  },

  createAnnouncement: async (payload: {
    course_id?: number | null;
    title: string;
    content: string;
    is_global?: boolean;
  }): Promise<Announcement> => {
    const response = await api.post<ApiResponse<Announcement>>('/announcements', payload);
    return response.data.data;
  },

  deleteAnnouncement: async (id: number): Promise<void> => {
    await api.delete(`/announcements/${id}`);
  },
};
