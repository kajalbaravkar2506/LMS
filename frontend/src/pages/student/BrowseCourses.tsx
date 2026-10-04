import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Check, UserPlus, User, GraduationCap } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../hooks/useToast';

export const BrowseCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadCourses = async () => {
    try {
      const data = await courseService.getCourses({
        search: search || undefined,
        department: selectedDept || undefined,
      });
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadCourses();
  };

  const handleEnroll = async (courseId: number, courseCode: string) => {
    setEnrollingId(courseId);
    try {
      await courseService.enrollInCourse(courseId);
      success(`Successfully enrolled in ${courseCode}!`);
      // Update local state
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, is_enrolled: true } : c))
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Enrollment failed';
      error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Catalog</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore university curriculum, review syllabi, and enroll in upcoming semester courses.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No Courses Found"
          description="Try adjusting your search criteria or department filter."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedDept('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between hover:shadow-card hover:border-slate-300 transition duration-200">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {course.course_code}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {course.credits} Credits • Sem {course.semester}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {course.course_name}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.faculty?.full_name || 'Faculty Assigned'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{course.department}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/student/courses/${course.id}`}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                >
                  View Syllabus
                </Link>

                {course.is_enrolled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold select-none">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Enrolled
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleEnroll(course.id, course.course_code)}
                    isLoading={enrollingId === course.id}
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Enroll Now
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
