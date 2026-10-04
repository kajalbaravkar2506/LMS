import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, ArrowRight, Search, FileText, HelpCircle, FileCheck, Compass } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { Card } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await courseService.getCourses({ my_courses: true });
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Enrolled Courses</h1>
          <p className="text-xs text-slate-500 mt-1">Access syllabus, lecture materials, assignments, and quizzes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <Link
            to="/student/browse-courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
          >
            <Compass className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No Enrolled Courses Found"
          description={searchTerm ? "No courses matched your filter query." : "You are not enrolled in any courses yet. Browse the course catalog to enroll."}
          actionText="Browse Courses"
          onAction={() => window.location.href = '/student/browse-courses'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between hover:border-indigo-300 hover:shadow-card transition duration-200">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {course.course_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {course.credits} Credits
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                  <Link to={`/student/courses/${course.id}`}>{course.course_name}</Link>
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {course.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.faculty?.full_name || 'Assigned Faculty'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{course.department}</span>
                </div>

                {/* Quick stats indicators */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-xl">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{course.materials_count || 0} Files</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>{course.assignments_count || 0} Tasks</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{course.quizzes_count || 0} Quizzes</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
                <Link
                  to={`/student/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Enter Course <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
