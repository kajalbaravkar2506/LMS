import api from './api';
import { ApiResponse, Course, CourseMaterial, Enrollment } from '../types';

export const courseService = {
  getCourses: async (params?: { search?: string; department?: string; my_courses?: boolean; faculty_id?: number }): Promise<Course[]> => {
    const res = await api.get<ApiResponse<Course[]>>('/courses', { params });
    return res.data.data;
  },

  getCourseById: async (id: number): Promise<Course> => {
    const res = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data.data;
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    const res = await api.post<ApiResponse<Course>>('/courses', courseData);
    return res.data.data;
  },

  updateCourse: async (id: number, courseData: Partial<Course>): Promise<Course> => {
    const res = await api.put<ApiResponse<Course>>(`/courses/${id}`, courseData);
    return res.data.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/courses/${id}`);
  },

  getCourseMaterials: async (courseId: number): Promise<CourseMaterial[]> => {
    const res = await api.get<ApiResponse<CourseMaterial[]>>(`/courses/${courseId}/materials`);
    return res.data.data;
  },

  uploadMaterial: async (courseId: number, formData: FormData): Promise<CourseMaterial> => {
    const res = await api.post<ApiResponse<CourseMaterial>>(`/courses/${courseId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  deleteMaterial: async (materialId: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/courses/materials/${materialId}`);
  },

  getEnrolledStudents: async (courseId: number): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>(`/courses/${courseId}/students`);
    return res.data.data;
  },

  enrollInCourse: async (courseId: number): Promise<Enrollment> => {
    const res = await api.post<ApiResponse<Enrollment>>('/enrollments', { course_id: courseId });
    return res.data.data;
  },

  dropCourse: async (enrollmentId: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/enrollments/${enrollmentId}`);
  }
};
