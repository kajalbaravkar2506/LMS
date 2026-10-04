import api from './api';
import { ApiResponse, Announcement, NotificationItem, DashboardStats, User, Enrollment } from '../types';

export const adminService = {
  getUsers: async (params?: { role?: string; search?: string; is_active?: boolean }): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data.data;
  },

  getFacultyDropdown: async (): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/users/faculty-list');
    return res.data.data;
  },

  createFacultyUser: async (payload: any): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users/faculty', payload);
    return res.data.data;
  },

  createStudentUser: async (payload: any): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users/student', payload);
    return res.data.data;
  },

  updateUser: async (userId: number, payload: any): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${userId}`, payload);
    return res.data.data;
  },

  toggleUserStatus: async (userId: number): Promise<{ is_active: boolean }> => {
    const res = await api.put<ApiResponse<{ is_active: boolean }>>(`/users/${userId}/status`);
    return res.data.data;
  },

  getEnrollments: async (params?: { course_id?: number; status?: string }): Promise<Enrollment[]> => {
    const res = await api.get<ApiResponse<Enrollment[]>>('/enrollments', { params });
    return res.data.data;
  },

  dropEnrollment: async (enrollmentId: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/enrollments/${enrollmentId}`);
  },

  getEnrollmentReport: async (department?: string): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/enrollments', {
      params: department ? { department } : undefined
    });
    return res.data.data;
  },

  getPerformanceReport: async (params?: { department?: string; course_id?: number }): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/performance', { params });
    return res.data.data;
  },

  getAttendanceReport: async (params?: { course_id?: number; shortage_only?: boolean; min_percentage?: number; max_percentage?: number }): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/attendance', { params });
    return res.data.data;
  },

  getSubmissionReport: async (courseId?: number): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/submissions', {
      params: courseId ? { course_id: courseId } : undefined
    });
    return res.data.data;
  }
};

export { announcementService } from './announcementService';
export { notificationService } from './notificationService';
export { dashboardService } from './dashboardService';
