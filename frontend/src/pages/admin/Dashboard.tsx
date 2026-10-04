import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  School,
  FileCheck,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { DepartmentDistributionChart } from '../../components/charts/DepartmentDistributionChart';
import { GradeProgressChart } from '../../components/charts/GradeProgressChart';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full uppercase tracking-wider border border-purple-400/20">
            System Administrator
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Campus Administration Console
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Managing <strong>{summary.total_students || 0} active students</strong>, <strong>{summary.total_faculty || 0} faculty professors</strong>, and <strong>{summary.total_courses || 0} curriculum courses</strong>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition shadow-sm"
            >
              <Users className="w-4 h-4" /> Manage Users
            </Link>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition border border-slate-700"
            >
              <BarChart3 className="w-4 h-4 text-purple-300" /> Analytical DBMS Reports
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Total Students"
          value={summary.total_students || 0}
          subtitle="Enrolled undergraduate / graduate"
          icon={<GraduationCap className="w-5 h-5" />}
          colorScheme="indigo"
        />
        <StatCard
          title="Faculty Members"
          value={summary.total_faculty || 0}
          subtitle="Department instructors"
          icon={<School className="w-5 h-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="Curriculum Courses"
          value={summary.total_courses || 0}
          subtitle="Approved degree programs"
          icon={<BookOpen className="w-5 h-5" />}
          colorScheme="blue"
        />
        <StatCard
          title="Active Enrollments"
          value={summary.total_active_enrollments || 0}
          subtitle="Class seats occupied"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Assignments"
          value={summary.total_assignments || 0}
          subtitle="Across all departments"
          icon={<FileCheck className="w-5 h-5" />}
          colorScheme="amber"
        />
        <StatCard
          title="Online Quizzes"
          value={summary.total_quizzes || 0}
          subtitle="Active assessment pools"
          icon={<HelpCircle className="w-5 h-5" />}
          colorScheme="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Student Department Distribution"
            subtitle="Student enrollment breakdown by academic department"
            icon={<Users className="w-5 h-5" />}
          />
          <DepartmentDistributionChart data={stats?.department_distribution || []} />
        </Card>

        <Card>
          <CardHeader
            title="Course Enrollment Statistics"
            subtitle="Current student load per subject"
            icon={<BookOpen className="w-5 h-5" />}
          />
          <div className="space-y-3">
            {!stats?.course_enrollment_chart || stats.course_enrollment_chart.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No enrollment records</p>
            ) : (
              stats.course_enrollment_chart.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{c.course_code}</span>
                    <span className="text-slate-500 ml-2">{c.course_name}</span>
                  </div>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                    {c.students_count} Students
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
