import React, { useEffect, useState } from 'react';
import { Users, Search, Award, CalendarCheck, BookOpen, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const FacultyStudentPerformance: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        adminService.getPerformanceReport({ course_id: selectedCourseId ? Number(selectedCourseId) : undefined }),
        courseService.getCourses({ my_courses: true })
      ]);
      setPerformanceData(pData);
      setCourses(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId]);

  const filtered = performanceData.filter((item) => {
    const name = item.student_name?.toLowerCase() || '';
    const num = item.student_number?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || num.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Performance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor student assignment submissions, quiz results, and attendance records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Taught Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} - {c.course_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">Students: {filtered.length}</span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Student Records Found"
            description="Enroll students into your courses to view composite performance."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Assignments Avg</th>
                  <th className="py-3 px-4">Quiz Avg</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.student_number} • {item.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {item.course_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.assignment_avg_percentage !== null ? `${item.assignment_avg_percentage}%` : '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.quiz_avg_percentage !== null ? `${item.quiz_avg_percentage}%` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          item.attendance_percentage < 75 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {item.attendance_percentage !== null ? `${item.attendance_percentage}%` : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-extrabold text-indigo-600">
                        {item.overall_score !== null ? `${item.overall_score}%` : 'N/A'}
                      </span>
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
