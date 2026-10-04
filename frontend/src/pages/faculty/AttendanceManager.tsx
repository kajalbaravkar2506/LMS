import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Save,
  Users,
  CheckCheck
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { attendanceService } from '../../services/attendanceService';
import { Course, CourseAttendanceSheet } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../hooks/useToast';

export const FacultyAttendance: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState<{ student_id: number; student_number: string; student_name: string; status: 'present' | 'absent' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    const initCourses = async () => {
      try {
        const cList = await courseService.getCourses({ my_courses: true });
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initCourses();
  }, []);

  const loadRoster = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const sheet = await attendanceService.getCourseRosterSheet(selectedCourseId, selectedDate);
      setRoster(sheet.roster || []);
    } catch (err) {
      console.error(err);
      error('Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadRoster();
    }
  }, [selectedCourseId, selectedDate]);

  const handleStatusChange = (studentId: number, status: 'present' | 'absent') => {
    setRoster((prev) =>
      prev.map((item) => (item.student_id === studentId ? { ...item, status } : item))
    );
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      await attendanceService.markAttendanceBatch(
        selectedCourseId,
        selectedDate,
        roster.map((r) => ({ student_id: r.student_id, status: r.status }))
      );
      success(`Attendance saved for ${selectedDate}!`);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = roster.filter((r) => r.status === 'present').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Register</h1>
        <p className="text-xs text-slate-500 mt-1">
          Record class attendance rosters, mark presence/absence, and update academic logs.
        </p>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Course</label>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {roster.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarkAll('present')}
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
            >
              Mark All Present
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveAttendance}
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Register
            </Button>
          </div>
        )}
      </div>

      {/* Register Summary & Table */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Total Enrolled: {roster.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {presentCount} Present
            </span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {absentCount} Absent
            </span>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : roster.length === 0 ? (
          <EmptyState
            title="No Students Enrolled"
            description="There are no active student enrollments for this course."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((student, idx) => (
                  <tr key={student.student_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.student_name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{student.student_number}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-4">
                        <label className={`flex items-center gap-1.5 px-3 py-1 rounded-xl cursor-pointer font-bold transition select-none ${
                          student.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}>
                          <input
                            type="radio"
                            name={`status-${student.student_id}`}
                            checked={student.status === 'present'}
                            onChange={() => handleStatusChange(student.student_id, 'present')}
                            className="hidden"
                          />
                          <CheckCircle2 className="w-4 h-4" /> Present
                        </label>

                        <label className={`flex items-center gap-1.5 px-3 py-1 rounded-xl cursor-pointer font-bold transition select-none ${
                          student.status === 'absent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-sm'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}>
                          <input
                            type="radio"
                            name={`status-${student.student_id}`}
                            checked={student.status === 'absent'}
                            onChange={() => handleStatusChange(student.student_id, 'absent')}
                            className="hidden"
                          />
                          <XCircle className="w-4 h-4" /> Absent
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
