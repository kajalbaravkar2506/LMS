import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Unauthorized } from './pages/auth/Unauthorized';
import { UserProfile } from './pages/student/Profile';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { MyCourses } from './pages/student/MyCourses';
import { BrowseCourses } from './pages/student/BrowseCourses';
import { CourseDetails } from './pages/student/CourseDetails';
import { StudentAssignments } from './pages/student/Assignments';
import { StudentQuizzes } from './pages/student/Quizzes';
import { StudentQuizAttempt } from './pages/student/QuizAttempt';
import { StudentGrades } from './pages/student/Grades';
import { StudentAttendance } from './pages/student/Attendance';
import { StudentAnnouncements } from './pages/student/Announcements';
import { StudentNotifications } from './pages/student/Notifications';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/Dashboard';
import { FacultyCourses } from './pages/faculty/MyCourses';
import { FacultyAssignments } from './pages/faculty/AssignmentManager';
import { SubmissionsGrade } from './pages/faculty/SubmissionsGrade';
import { FacultyQuizzes } from './pages/faculty/QuizManager';
import { FacultyAttendance } from './pages/faculty/AttendanceManager';
import { FacultyStudentPerformance } from './pages/faculty/StudentPerformance';
import { FacultyAnnouncements } from './pages/faculty/Announcements';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/UserManagement';
import { AdminCourses } from './pages/admin/CourseManagement';
import { AdminEnrollments } from './pages/admin/EnrollmentManagement';
import { AdminReports } from './pages/admin/Reports';

const RoleGuard: React.FC<{ allowedRoles: string[]; children: React.ReactElement }> = ({
  allowedRoles,
  children,
}) => {
  const { role, loading, isAuthenticated } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth Layout & Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Unauthorized */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Protected Portal */}
            <Route
              path="/student"
              element={
                <RoleGuard allowedRoles={['student']}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="browse-courses" element={<BrowseCourses />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="quizzes/:id/take" element={<StudentQuizAttempt />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Faculty Protected Portal */}
            <Route
              path="/faculty"
              element={
                <RoleGuard allowedRoles={['faculty']}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="my-courses" element={<FacultyCourses />} />
              <Route path="assignments" element={<FacultyAssignments />} />
              <Route path="submissions" element={<SubmissionsGrade />} />
              <Route path="quizzes" element={<FacultyQuizzes />} />
              <Route path="attendance" element={<FacultyAttendance />} />
              <Route path="students" element={<FacultyStudentPerformance />} />
              <Route path="announcements" element={<FacultyAnnouncements />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Admin Protected Portal */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};
