import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Search, Filter, Trash2, CheckCircle2, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import { Enrollment, Course } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const AdminEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Drop dialog
  const [dropEnrollmentId, setDropEnrollmentId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [eData, cData] = await Promise.all([
        adminService.getEnrollments({
          course_id: selectedCourseId ? Number(selectedCourseId) : undefined,
          status: statusFilter || undefined
        }),
        courseService.getCourses()
      ]);
      setEnrollments(eData);
      setCourses(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId, statusFilter]);

  const handleDrop = async () => {
    if (!dropEnrollmentId) return;
    try {
      await adminService.dropEnrollment(dropEnrollmentId);
      success('Student enrollment status changed to dropped');
      setDropEnrollmentId(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to drop enrollment');
    }
  };

  const filtered = enrollments.filter((e) => {
    const sName = e.student?.full_name?.toLowerCase() || '';
    const sNum = e.student?.student_number?.toLowerCase() || '';
    const cName = e.course?.course_name?.toLowerCase() || '';
    const cCode = e.course?.course_code?.toLowerCase() || '';
    const q = search.toLowerCase();
    return sName.includes(q) || sNum.includes(q) || cName.includes(q) || cCode.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Enrollment Register</h1>
          <p className="text-xs text-slate-500 mt-1">Audit student course registrations, statuses, and seat allocations.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} - {c.course_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="dropped">Dropped</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Enrollments Found"
            description="No student registration records found matching the specified filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{enr.student?.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{enr.student?.student_number} • {enr.student?.department}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] mr-2">
                        {enr.course?.course_code}
                      </span>
                      <strong className="text-slate-800">{enr.course?.course_name}</strong>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(enr.enrolled_at)}
                    </td>

                    <td className="py-3 px-4">
                      <Badge statusValue={enr.status}>
                        {enr.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {enr.status === 'active' && (
                        <button
                          onClick={() => setDropEnrollmentId(enr.id)}
                          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition"
                        >
                          Drop Course
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drop Dialog */}
      <ConfirmDialog
        isOpen={!!dropEnrollmentId}
        onClose={() => setDropEnrollmentId(null)}
        onConfirm={handleDrop}
        title="Drop Student Enrollment"
        message="Are you sure you want to drop this student's course enrollment? Their submission and attendance history will be archived."
        confirmText="Drop Student"
        isDangerous={true}
      />
    </div>
  );
};
