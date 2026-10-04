import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  FileCheck,
  HelpCircle,
  Award,
  CalendarCheck,
  Megaphone,
  Bell,
  User,
  LogOut,
  Users,
  BarChart3,
  GraduationCap,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/student/my-courses', icon: BookOpen },
    { name: 'Browse Courses', path: '/student/browse-courses', icon: Compass },
    { name: 'Assignments', path: '/student/assignments', icon: FileCheck },
    { name: 'Quizzes', path: '/student/quizzes', icon: HelpCircle },
    { name: 'Grades', path: '/student/grades', icon: Award },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Announcements', path: '/student/announcements', icon: Megaphone },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const facultyLinks = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/faculty/my-courses', icon: BookOpen },
    { name: 'Assignments', path: '/faculty/assignments', icon: FileCheck },
    { name: 'Submissions', path: '/faculty/submissions', icon: FileSpreadsheet },
    { name: 'Quizzes', path: '/faculty/quizzes', icon: HelpCircle },
    { name: 'Attendance', path: '/faculty/attendance', icon: CalendarCheck },
    { name: 'Students', path: '/faculty/students', icon: Users },
    { name: 'Announcements', path: '/faculty/announcements', icon: Megaphone },
    { name: 'Profile', path: '/faculty/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Enrollments', path: '/admin/enrollments', icon: FileSpreadsheet },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Profile', path: '/admin/profile', icon: User },
  ];

  const links = role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-900/50">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">EduVerse</h1>
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
                {role || 'University'} LMS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 group select-none ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 mb-2 flex items-center gap-3">
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.full_name || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
