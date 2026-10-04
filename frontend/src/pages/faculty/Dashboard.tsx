import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileCheck,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { assignmentService } from '../../services/assignmentService';
import { DashboardStats, Submission } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick grading modal
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeMarks, setGradeMarks] = useState<string>('');
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [grading, setGrading] = useState(false);

  const { success, error } = useToast();

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

  useEffect(() => {
    loadStats();
  }, []);

  const handleOpenGradeModal = (sub: Submission) => {
    setSelectedSub(sub);
    setGradeMarks(sub.marks !== null && sub.marks !== undefined ? String(sub.marks) : '');
    setGradeFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setGrading(true);
    try {
      await assignmentService.gradeSubmission(selectedSub.id, {
        marks: parseFloat(gradeMarks),
        feedback: gradeFeedback
      });
      success('Grade saved successfully!');
      setSelectedSub(null);
      loadStats();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full uppercase tracking-wider border border-indigo-400/20">
            Faculty Teaching Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome, {user?.full_name}! 🎓
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            You are managing <strong>{summary.courses_count || 0} active courses</strong> with <strong>{summary.pending_grading_count || 0} pending submissions</strong> waiting for evaluation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/faculty/assignments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
            >
              <FileCheck className="w-4 h-4" /> Manage Assignments
            </Link>
            <Link
              to="/faculty/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition border border-slate-700"
            >
              Take Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Courses Taught"
          value={summary.courses_count || 0}
          subtitle="Assigned academic subjects"
          icon={<BookOpen className="w-5 h-5" />}
          colorScheme="indigo"
        />
        <StatCard
          title="Total Students"
          value={summary.total_students_count || 0}
          subtitle="Enrolled learners"
          icon={<Users className="w-5 h-5" />}
          colorScheme="emerald"
        />
        <StatCard
          title="Pending Grading"
          value={summary.pending_grading_count || 0}
          subtitle="Unmarked student papers"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          colorScheme={summary.pending_grading_count > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Quizzes Published"
          value={summary.total_quizzes_count || 0}
          subtitle="Online assessments"
          icon={<HelpCircle className="w-5 h-5" />}
          colorScheme="purple"
        />
      </div>

      {/* Pending Grading Queue */}
      <Card>
        <CardHeader
          title="Recent Submissions & Grading Queue"
          subtitle="Review and grade student assignment submissions"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          action={
            <Link to="/faculty/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All Courses
            </Link>
          }
        />

        {!stats?.recent_submissions || stats.recent_submissions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No student submissions submitted yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course & Assignment</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sub.student?.full_name || 'Student'}</div>
                      <div className="text-[11px] text-slate-400">{sub.student?.student_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{sub.assignment_title}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">{sub.course_code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateTime(sub.submitted_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'graded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.status === 'graded' ? `Graded (${sub.marks} pts)` : 'Needs Grading'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                          >
                            View File
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenGradeModal(sub)}
                        >
                          {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grade Modal */}
      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Grade Submission - ${selectedSub.student?.full_name}`}
          subtitle={`Assignment: ${selectedSub.assignment_title} (Max: ${selectedSub.max_marks || 100} Marks)`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            {selectedSub.file_url && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Submitted Deliverable:</span>
                <a
                  href={selectedSub.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Download / Open File
                </a>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Marks Awarded (Max: {selectedSub.max_marks || 100}) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max={selectedSub.max_marks || 100}
                value={gradeMarks}
                onChange={(e) => setGradeMarks(e.target.value)}
                placeholder="e.g. 45.0"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Professor Feedback / Comments
              </label>
              <textarea
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Detailed remarks on code quality, schema design, and areas of improvement..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedSub(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={grading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Save Grade & Notify
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
