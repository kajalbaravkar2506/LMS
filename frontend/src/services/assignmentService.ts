import api from './api';
import { ApiResponse, Assignment, Submission } from '../types';

export const assignmentService = {
  getAssignments: async (params?: { course_id?: number; status?: string }): Promise<Assignment[]> => {
    const res = await api.get<ApiResponse<Assignment[]>>('/assignments', { params });
    return res.data.data;
  },

  getAssignmentById: async (id: number): Promise<Assignment> => {
    const res = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    return res.data.data;
  },

  createAssignment: async (assignmentData: {
    course_id: number;
    title: string;
    description: string;
    due_date: string;
    max_marks: number;
  }): Promise<Assignment> => {
    const res = await api.post<ApiResponse<Assignment>>('/assignments', assignmentData);
    return res.data.data;
  },

  updateAssignment: async (id: number, assignmentData: Partial<Assignment>): Promise<Assignment> => {
    const res = await api.put<ApiResponse<Assignment>>(`/assignments/${id}`, assignmentData);
    return res.data.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/assignments/${id}`);
  },

  getAssignmentSubmissions: async (assignmentId: number): Promise<Submission[]> => {
    const res = await api.get<ApiResponse<Submission[]>>(`/assignments/${assignmentId}/submissions`);
    return res.data.data;
  },

  submitAssignment: async (formData: FormData): Promise<Submission> => {
    const res = await api.post<ApiResponse<Submission>>('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  gradeSubmission: async (submissionId: number, payload: { marks: number; feedback?: string }): Promise<Submission> => {
    const res = await api.put<ApiResponse<Submission>>(`/submissions/${submissionId}/grade`, payload);
    return res.data.data;
  }
};
