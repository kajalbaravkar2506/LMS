import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  CheckCheck,
  Menu,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch {
      // Silently fail if not logged in
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md uppercase tracking-wider">Admin</span>;
      case 'faculty':
        return <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase tracking-wider">Faculty</span>;
      case 'student':
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md uppercase tracking-wider">Student</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, assignments, syllabus..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      className={`p-3.5 text-left transition hover:bg-slate-50 flex items-start gap-3 cursor-pointer ${
                        !notif.is_read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.is_read ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(notif.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to={`/${role}/notifications`}
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 focus:outline-none transition"
          >
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.full_name || 'User'}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none">{user?.full_name}</span>
              <span className="text-[10px] text-slate-500 mt-1">{user?.email}</span>
            </div>
            <div className="hidden md:block ml-1">{getRoleBadge()}</div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2">{getRoleBadge()}</div>
              </div>
              <div className="p-1">
                <Link
                  to={`/${role}/profile`}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
