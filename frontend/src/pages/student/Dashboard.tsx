import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileCheck,
  Award,
  CalendarCheck,
  Clock,
  Megaphone,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { GradeProgressChart } from '../../components/charts/GradeProgressChart';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full uppercase tracking-wider border border-indigo-400/20">
            Fall Semester 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-sm text-indigo-200/90 mt-2 leading-relaxed">
            You have <strong className="text-white">{summary.pending_assignments_count || 0} pending assignments</strong> due soon. Keep up the academic momentum!
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/student/assignments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-indigo-600" />
              View Assignments
            </Link>
            <Link
              to="/student/my-courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-800/60 text-white text-xs font-bold hover:bg-indigo-800 border border-indigo-700/50 transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              My Courses
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Enrolled Courses"
          value={summary.enrolled_courses_count || 0}
          subtitle="Active course registrations"
          icon={<BookOpen className="w-5 h-5" />}
          colorScheme="indigo"
        />
        <StatCard
          title="Pending Tasks"
          value={summary.pending_assignments_count || 0}
          subtitle="Assignments due soon"
          icon={<FileCheck className="w-5 h-5" />}
          colorScheme="amber"
        />
        <StatCard
          title="Average Grade"
          value={`${summary.average_grade_percentage || 0}%`}
          subtitle="Overall assignment score"
          icon={<Award className="w-5 h-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="Overall Attendance"
          value={`${summary.attendance_percentage || 0}%`}
          subtitle={summary.attendance_percentage < 75 ? "Warning: Shortage below 75%" : "Good standing"}
          icon={<CalendarCheck className="w-5 h-5" />}
          colorScheme={summary.attendance_percentage < 75 ? "rose" : "emerald"}
        />
      </div>

      {/* Performance Analytics & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Course Academic Progress"
            subtitle="Comparison of assignment scores and attendance percentages across your courses"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <GradeProgressChart data={stats?.course_progress_charts || []} />
        </Card>

        {/* Upcoming Deadlines Widget */}
        <Card>
          <CardHeader
            title="Upcoming Deadlines"
            subtitle="Stay on track with assignments"
            icon={<Clock className="w-5 h-5" />}
            action={
              <Link to="/student/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                View all
              </Link>
            }
          />
          <div className="space-y-3">
            {!stats?.upcoming_deadlines || stats.upcoming_deadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming deadlines 🎉</p>
            ) : (
              stats.upcoming_deadlines.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {item.course_code}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Due: {formatDate(item.due_date)}</p>
                  </div>
                  <Link
                    to="/student/assignments"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Announcements Feed */}
      <Card>
        <CardHeader
          title="Recent Announcements"
          subtitle="Updates from professors and university administration"
          icon={<Megaphone className="w-5 h-5" />}
          action={
            <Link to="/student/announcements" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              All Bulletins
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!stats?.recent_announcements || stats.recent_announcements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center col-span-2">No announcements posted yet</p>
          ) : (
            stats.recent_announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-subtle transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ann.course_code || 'GLOBAL'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(ann.created_at)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-3">Posted by {ann.creator_name || 'Faculty'}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
