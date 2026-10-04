import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Users,
  BookOpen,
  CalendarCheck,
  FileCheck,
  AlertTriangle,
  Award,
  Database
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('enrollment');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [shortageOnly, setShortageOnly] = useState(false);

  // Data states
  const [enrollmentReport, setEnrollmentReport] = useState<any[]>([]);
  const [performanceReport, setPerformanceReport] = useState<any[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [submissionReport, setSubmissionReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getCourses().then(setCourses).catch(console.error);
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'enrollment') {
        const data = await adminService.getEnrollmentReport(selectedDept || undefined);
        setEnrollmentReport(data);
      } else if (activeTab === 'performance') {
        const data = await adminService.getPerformanceReport({
          course_id: selectedCourseId ? Number(selectedCourseId) : undefined,
          department: selectedDept || undefined
        });
        setPerformanceReport(data);
      } else if (activeTab === 'attendance') {
        const data = await adminService.getAttendanceReport({
          course_id: selectedCourseId ? Number(selectedCourseId) : undefined,
          shortage_only: shortageOnly
        });
        setAttendanceReport(data);
      } else if (activeTab === 'submissions') {
        const data = await adminService.getSubmissionReport(
          selectedCourseId ? Number(selectedCourseId) : undefined
        );
        setSubmissionReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab, selectedCourseId, selectedDept, shortageOnly]);

  const tabs = [
    { id: 'enrollment', label: 'Course Enrollment Report', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'performance', label: 'Student Performance Report', icon: <Award className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance Shortage Report', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'submissions', label: 'Assignment Analytics Report', icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Database className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">DBMS Analytical Reports</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Intelligence & SQL Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Multi-table relational reports generated using SQL aggregation, GROUP BY, HAVING filters, and correlated subqueries.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />

          {/* Department Filter */}
          {(activeTab === 'enrollment' || activeTab === 'performance') && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          )}

          {/* Course Filter */}
          {(activeTab === 'performance' || activeTab === 'attendance' || activeTab === 'submissions') && (
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
          )}

          {/* Shortage Checkbox */}
          {activeTab === 'attendance' && (
            <label className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shortageOnly}
                onChange={(e) => setShortageOnly(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
              <span>Show &lt; 75% Attendance Shortage Only</span>
            </label>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadReportData}
          leftIcon={<BarChart3 className="w-4 h-4 text-indigo-600" />}
        >
          Refresh Query
        </Button>
      </div>

      {/* Tab 1: Course Enrollment Report */}
      {activeTab === 'enrollment' && (
        <Card>
          <CardHeader
            title="Course Enrollment Capacity & Status Breakdown"
            subtitle="Aggregated using INNER JOIN and conditional COUNT(CASE status) across courses and enrollments"
          />
          {loading ? (
            <TableSkeleton rows={5} />
          ) : enrollmentReport.length === 0 ? (
            <EmptyState title="No Records" description="No course enrollment records found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4 text-center">Total Enrolled</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Active</th>
                    <th className="py-3 px-4 text-center text-rose-700">Dropped</th>
                    <th className="py-3 px-4 text-center text-blue-700">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollmentReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mr-2">
                          {row.course_code}
                        </span>
                        <strong className="text-slate-900">{row.course_name}</strong>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{row.department}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.faculty_name}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{row.total_enrolled}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{row.active_enrolled}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600">{row.dropped_count}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600">{row.completed_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Student Performance Report */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader
            title="Composite Student Performance GPA Matrix"
            subtitle="Calculates assignment average, quiz average, attendance %, and weighted grade"
          />
          {loading ? (
            <TableSkeleton rows={6} />
          ) : performanceReport.length === 0 ? (
            <EmptyState title="No Records" description="No student performance records found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4 text-center">Assignment Avg</th>
                    <th className="py-3 px-4 text-center">Quiz Avg</th>
                    <th className="py-3 px-4 text-center">Attendance</th>
                    <th className="py-3 px-4 text-right">Composite Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performanceReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{row.student_number} • {row.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {row.course_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {row.assignment_avg_percentage !== null ? `${row.assignment_avg_percentage}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {row.quiz_avg_percentage !== null ? `${row.quiz_avg_percentage}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={row.attendance_percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                          {row.attendance_percentage !== null ? `${row.attendance_percentage}%` : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-sm text-indigo-600">
                        {row.overall_score !== null ? `${row.overall_score}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Attendance Shortage Report */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader
            title="Attendance Shortage & Compliance Register"
            subtitle="Filters students below the mandatory 75% attendance criteria using SQL HAVING/WHERE clauses"
          />
          {loading ? (
            <TableSkeleton rows={6} />
          ) : attendanceReport.length === 0 ? (
            <EmptyState title="No Records Found" description="All students meet the attendance requirements!" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4 text-center">Classes Conducted</th>
                    <th className="py-3 px-4 text-center">Present</th>
                    <th className="py-3 px-4 text-center">Absent</th>
                    <th className="py-3 px-4 text-center">Attendance %</th>
                    <th className="py-3 px-4 text-right">Eligibility Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{row.student_number} • {row.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {row.course_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">{row.total_classes}</td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-700">{row.present_count}</td>
                      <td className="py-3 px-4 text-center font-semibold text-rose-700">{row.absent_count}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                        <span className={row.attendance_percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                          {row.attendance_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.is_shortage ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Shortage (&lt;75%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            Eligible for Exams
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Assignment Analytics Report */}
      {activeTab === 'submissions' && (
        <Card>
          <CardHeader
            title="Assignment Submission & Marks Distribution"
            subtitle="Analyzes completion rates, on-time vs late ratios, and min/max/average marks"
          />
          {loading ? (
            <TableSkeleton rows={5} />
          ) : submissionReport.length === 0 ? (
            <EmptyState title="No Records" description="No assignment submission analytics found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Assignment</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4 text-center">Submissions / Enrolled</th>
                    <th className="py-3 px-4 text-center">Completion Rate</th>
                    <th className="py-3 px-4 text-center">Graded</th>
                    <th className="py-3 px-4 text-center">Average Marks</th>
                    <th className="py-3 px-4 text-right">Min / Max Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissionReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.assignment_title}</div>
                        <div className="text-[11px] text-slate-400">Max: {row.max_marks} marks</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {row.course_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {row.submitted_count} / {row.eligible_students}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600">
                        {row.submission_rate}%
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-700">
                        {row.graded_count}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {row.avg_marks !== null ? `${row.avg_marks} (${row.avg_percentage}%)` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {row.min_marks !== null ? `${row.min_marks} / ${row.highest_marks}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
