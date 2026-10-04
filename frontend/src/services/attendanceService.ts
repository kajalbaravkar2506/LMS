import api from './api';
import { ApiResponse, StudentAttendanceSummary, CourseAttendanceSheet } from '../types';

export const attendanceService = {
  getAttendanceOverview: async (courseId?: number): Promise<StudentAttendanceSummary[] | any> => {
    const res = await api.get<ApiResponse<StudentAttendanceSummary[] | any>>('/attendance', {
      params: { course_id: courseId }
    });
    return res.data.data;
  },

  getCourseRosterSheet: async (courseId: number, dateStr?: string): Promise<CourseAttendanceSheet> => {
    const res = await api.get<ApiResponse<CourseAttendanceSheet>>(`/attendance/course/${courseId}`, {
      params: { date: dateStr }
    });
    return res.data.data;
  },

  markAttendanceBatch: async (courseId: number, dateStr: string, records: { student_id: number; status: 'present' | 'absent' }[]): Promise<void> => {
    await api.post<ApiResponse<null>>('/attendance/mark', {
      course_id: courseId,
      date: dateStr,
      records
    });
  }
};
