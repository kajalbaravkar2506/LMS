// =============================================================================
// EDUVERSE LMS - TYPESCRIPT DEFINITIONS
// =============================================================================

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profile_image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  student_profile?: StudentProfile;
  faculty_profile?: FacultyProfile;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  student_number: string;
  department: string;
  year: number;
  semester: number;
  full_name?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  is_active?: boolean;
}

export interface FacultyProfile {
  id: number;
  user_id: number;
  faculty_number: string;
  department: string;
  designation: string;
  full_name?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  is_active?: boolean;
}

export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  description: string;
  syllabus?: string;
  credits: number;
  semester: number;
  department: string;
  faculty_id: number;
  faculty?: FacultyProfile;
  created_at?: string;
  updated_at?: string;
  is_enrolled?: boolean;
  enrollment_status?: 'active' | 'completed' | 'dropped';
  enrolled_students_count?: number;
  assignments_count?: number;
  quizzes_count?: number;
  materials_count?: number;
  materials?: CourseMaterial[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrollment_date: string;
  enrolled_at?: string;
  status: 'active' | 'completed' | 'dropped';
  student?: StudentProfile;
  course?: Course;
}

export interface CourseMaterial {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  file_url: string;
  material_type: string;
  uploaded_by: number;
  uploader_name?: string;
  created_at: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  course_code?: string;
  course_name?: string;
  title: string;
  description?: string;
  due_date: string;
  max_marks: number;
  created_by: number;
  creator_name?: string;
  created_at?: string;
  updated_at?: string;
  total_submissions?: number;
  graded_submissions?: number;
  submission?: Submission | null;
  is_submitted?: boolean;
  is_graded?: boolean;
}

export interface Submission {
  id: number;
  assignment_id: number;
  assignment_title?: string;
  course_code?: string;
  course_name?: string;
  max_marks?: number;
  student_id: number;
  file_url?: string;
  submitted_at: string;
  marks?: number | null;
  feedback?: string | null;
  status: 'submitted' | 'late' | 'graded';
  graded_at?: string | null;
  student?: StudentProfile;
}

export interface Quiz {
  id: number;
  course_id: number;
  course_code?: string;
  course_name?: string;
  title: string;
  description?: string;
  duration_minutes: number;
  max_marks: number;
  created_by: number;
  creator_name?: string;
  questions_count?: number;
  created_at?: string;
  questions?: Question[];
  attempt?: QuizAttempt | null;
  is_attempted?: boolean;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  marks: number;
  options: Option[];
}

export interface Option {
  id?: number;
  question_id?: number;
  option_text: string;
  is_correct?: boolean;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  quiz_title?: string;
  max_marks?: number;
  duration_minutes?: number;
  course_code?: string;
  course_name?: string;
  student_id: number;
  student_name?: string;
  student_number?: string;
  started_at: string;
  submitted_at?: string | null;
  score?: number | null;
  status?: 'in_progress' | 'completed';
  answers?: Answer[];
}

export interface Answer {
  id: number;
  attempt_id: number;
  question_id: number;
  question_text?: string;
  selected_option_id?: number | null;
  selected_option_text?: string | null;
  is_correct?: boolean;
  marks_awarded?: number;
}

export interface AttendanceRecord {
  id: number;
  course_id: number;
  course_code?: string;
  course_name?: string;
  student_id: number;
  student_number?: string;
  student_name?: string;
  date: string;
  status: 'present' | 'absent';
  marked_by?: number;
  marker_name?: string;
  created_at?: string;
}

export interface StudentAttendanceSummary {
  course_id: number;
  course_code: string;
  course_name: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  percentage: number;
  is_low_attendance: boolean;
  history: AttendanceRecord[];
}

export interface CourseAttendanceSheet {
  course_id: number;
  course_code: string;
  date: string;
  roster: {
    student_id: number;
    student_number: string;
    student_name: string;
    status: 'present' | 'absent';
    marked: boolean;
  }[];
}

export interface Announcement {
  id: number;
  course_id?: number | null;
  course_code?: string;
  course_name?: string;
  title: string;
  content: string;
  created_by: number;
  creator_name?: string;
  is_global: boolean;
  created_at: string;
  updated_at?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  role: UserRole;
  summary: Record<string, any>;
  upcoming_deadlines?: {
    id: number;
    title: string;
    course_code: string;
    due_date: string;
    type: string;
  }[];
  recent_announcements?: Announcement[];
  course_progress_charts?: {
    course_code: string;
    course_name: string;
    grade_percentage: number;
    attendance_percentage: number;
  }[];
  recent_submissions?: Submission[];
  course_analytics?: {
    course_code: string;
    course_name: string;
    enrolled_students: number;
    total_submissions: number;
    graded_submissions: number;
  }[];
  department_distribution?: {
    department: string;
    students_count: number;
  }[];
  course_enrollment_chart?: {
    course_code: string;
    course_name: string;
    students_count: number;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}
