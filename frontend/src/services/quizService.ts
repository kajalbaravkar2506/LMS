import api from './api';
import { ApiResponse, Quiz, QuizAttempt } from '../types';

export const quizService = {
  getQuizzes: async (params?: { course_id?: number }): Promise<Quiz[]> => {
    const res = await api.get<ApiResponse<Quiz[]>>('/quizzes', { params });
    return res.data.data;
  },

  getQuizById: async (id: number): Promise<Quiz> => {
    const res = await api.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    return res.data.data;
  },

  createQuiz: async (quizData: {
    course_id: number;
    title: string;
    description?: string;
    duration_minutes: number;
    questions: any[];
  }): Promise<Quiz> => {
    const res = await api.post<ApiResponse<Quiz>>('/quizzes', quizData);
    return res.data.data;
  },

  updateQuiz: async (id: number, quizData: Partial<Quiz>): Promise<Quiz> => {
    const res = await api.put<ApiResponse<Quiz>>(`/quizzes/${id}`, quizData);
    return res.data.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/quizzes/${id}`);
  },

  startQuizAttempt: async (quizId: number): Promise<QuizAttempt> => {
    const res = await api.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/start`);
    return res.data.data;
  },

  submitQuiz: async (quizId: number, answers: { question_id: number; selected_option_id: number | null }[]): Promise<any> => {
    const res = await api.post<ApiResponse<any>>(`/quizzes/${quizId}/submit`, { answers });
    return res.data.data;
  },

  getQuizResults: async (quizId: number): Promise<QuizAttempt | QuizAttempt[]> => {
    const res = await api.get<ApiResponse<QuizAttempt | QuizAttempt[]>>(`/quizzes/${quizId}/results`);
    return res.data.data;
  }
};
