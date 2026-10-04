import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, Award, FileText, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDateTime } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { success } = useToast();

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
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
      success('All notifications marked as read');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for grades, assignments, quizzes, and campus updates.</p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-indigo-600" />}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You are all caught up! New alerts will show up here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all duration-150 flex items-start gap-4 cursor-pointer ${
                !notif.is_read
                  ? 'bg-indigo-50/40 border-indigo-200 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl flex-shrink-0 ${
                  notif.type === 'grade'
                    ? 'bg-emerald-100 text-emerald-700'
                    : notif.type === 'quiz'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400">{formatDateTime(notif.created_at)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
