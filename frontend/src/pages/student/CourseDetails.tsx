import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  FileCheck,
  HelpCircle,
  Download,
  User,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { Course, CourseMaterial, Assignment, Quiz } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('syllabus');
  const [enrolling, setEnrolling] = useState(false);

  const { success, error } = useToast();

  const loadCourse = async () => {
    if (!id) return;
    try {
      const data = await courseService.getCourseById(Number(id));
      setCourse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await courseService.enrollInCourse(course.id);
      success(`Successfully enrolled in ${course.course_code}!`);
      loadCourse();
    } catch (err: any) {
      error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-slate-200 animate-pulse rounded-3xl" />
        <CardSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Course Not Found"
        description="The course you requested does not exist or may have been archived."
        actionText="Back to Catalog"
        onAction={() => window.location.href = '/student/browse-courses'}
      />
    );
  }

  const tabs = [
    { id: 'syllabus', label: 'Syllabus & Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'materials', label: `Materials (${course.materials?.length || 0})`, icon: <FileText className="w-4 h-4" /> },
    { id: 'assignments', label: `Assignments (${course.assignments?.length || 0})`, icon: <FileCheck className="w-4 h-4" /> },
    { id: 'quizzes', label: `Quizzes (${course.quizzes?.length || 0})`, icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Course Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-lg uppercase tracking-wider border border-indigo-400/20">
                {course.course_code}
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg">
                {course.credits} Credits • Semester {course.semester}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {course.department}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course.course_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
              {course.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300 font-medium">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Instructor: <strong>{course.faculty?.full_name || 'Department Faculty'}</strong> ({course.faculty?.designation})</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            {course.is_enrolled ? (
              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-4 h-4" /> Enrolled Student
                </span>
                <p className="text-[11px] text-emerald-300/80 mt-1">Full Course Access Active</p>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleEnroll}
                isLoading={enrolling}
                className="w-full md:w-auto"
              >
                Enroll in this Course
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="pt-2">
        {/* 1. Syllabus & Overview */}
        {activeTab === 'syllabus' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Curriculum Syllabus"
                subtitle="Course topics and learning modules"
                icon={<BookOpen className="w-5 h-5" />}
              />
              <div className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100 font-mono">
                {course.syllabus || "Unit 1: Introduction and Core Concepts\nUnit 2: Theoretical Foundations & Architecture\nUnit 3: Implementation & Practical Applications\nUnit 4: Advanced Optimizations and Case Studies"}
              </div>
            </Card>

            <Card>
              <CardHeader title="Course Information" icon={<Calendar className="w-5 h-5" />} />
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="text-slate-900 font-semibold">{course.department}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Credit Units</span>
                  <span className="text-slate-900 font-semibold">{course.credits} Credits</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Recommended Semester</span>
                  <span className="text-slate-900 font-semibold">Semester {course.semester}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Enrolled Students</span>
                  <span className="text-slate-900 font-semibold">{course.enrolled_students_count || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 2. Course Materials */}
        {activeTab === 'materials' && (
          <Card>
            <CardHeader
              title="Course Materials & Handouts"
              subtitle="Download lecture slides, notes, and code repositories"
              icon={<FileText className="w-5 h-5" />}
            />
            {!course.materials || course.materials.length === 0 ? (
              <EmptyState
                title="No Materials Uploaded Yet"
                description="Your instructor will post lecture slides and handouts here soon."
              />
            ) : (
              <div className="space-y-3">
                {course.materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-subtle transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                        {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span>Uploaded {formatDate(m.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{m.material_type}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-semibold transition"
                    >
                      <Download className="w-4 h-4" /> Download / Open
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 3. Assignments */}
        {activeTab === 'assignments' && (
          <Card>
            <CardHeader
              title="Course Assignments"
              subtitle="Submit homework, projects, and lab exercises"
              icon={<FileCheck className="w-5 h-5" />}
            />
            {!course.assignments || course.assignments.length === 0 ? (
              <EmptyState
                title="No Assignments Posted"
                description="There are no assignments scheduled for this course at the moment."
              />
            ) : (
              <div className="space-y-3">
                {course.assignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-subtle transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {a.max_marks} Marks
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Due: {formatDateTime(a.due_date)}</span>
                      </div>
                    </div>

                    <Link
                      to="/student/assignments"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition shadow-sm whitespace-nowrap"
                    >
                      View & Submit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 4. Quizzes */}
        {activeTab === 'quizzes' && (
          <Card>
            <CardHeader
              title="Online Quizzes & Assessments"
              subtitle="Timed multiple choice tests"
              icon={<HelpCircle className="w-5 h-5" />}
            />
            {!course.quizzes || course.quizzes.length === 0 ? (
              <EmptyState
                title="No Quizzes Available"
                description="No quizzes have been published for this course yet."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:shadow-subtle transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {q.duration_minutes} Mins
                        </span>
                        <span className="text-xs font-bold text-slate-700">{q.max_marks} Marks</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                      <Link
                        to={`/student/quizzes/${q.id}/take`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                      >
                        Start Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
