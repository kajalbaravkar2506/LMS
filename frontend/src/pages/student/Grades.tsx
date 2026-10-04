import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle, TrendingUp, HelpCircle, FileCheck } from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { quizService } from '../../services/quizService';
import { courseService } from '../../services/courseService';
import { Course, Assignment, Quiz } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentGrades: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGradesData = async () => {
      try {
        const [cList, aList, qList] = await Promise.all([
          courseService.getCourses({ my_courses: true }),
          assignmentService.getAssignments(),
          quizService.getQuizzes(),
        ]);
        setCourses(cList);
        setAssignments(aList);
        setQuizzes(qList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadGradesData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-xl" />
        <CardSkeleton />
      </div>
    );
  }

  // Calculate composite course-wise performance
  const courseReportCards = courses.map((course) => {
    const courseAssignments = assignments.filter((a) => a.course_id === course.id);
    const gradedAssignments = courseAssignments.filter((a) => a.submission && a.submission.status === 'graded');

    let totalAsgnMarks = 0;
    let maxAsgnMarks = 0;
    gradedAssignments.forEach((a) => {
      totalAsgnMarks += Number(a.submission?.marks || 0);
      maxAsgnMarks += Number(a.max_marks || 100);
    });
    const asgnPct = maxAsgnMarks > 0 ? (totalAsgnMarks / maxAsgnMarks) * 100 : null;

    const courseQuizzes = quizzes.filter((q) => q.course_id === course.id);
    const attemptedQuizzes = courseQuizzes.filter((q) => q.is_attempted && q.attempt);

    let totalQuizMarks = 0;
    let maxQuizMarks = 0;
    attemptedQuizzes.forEach((q) => {
      totalQuizMarks += Number(q.attempt?.score || 0);
      maxQuizMarks += Number(q.max_marks || 20);
    });
    const quizPct = maxQuizMarks > 0 ? (totalQuizMarks / maxQuizMarks) * 100 : null;

    // Overall grade calculation
    let overallScore = 0;
    let weightSum = 0;
    if (asgnPct !== null) {
      overallScore += asgnPct * 0.6;
      weightSum += 0.6;
    }
    if (quizPct !== null) {
      overallScore += quizPct * 0.4;
      weightSum += 0.4;
    }
    const finalPct = weightSum > 0 ? overallScore / weightSum : null;

    const getLetterGrade = (pct: number | null) => {
      if (pct === null) return 'N/A';
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B';
      if (pct >= 60) return 'C';
      if (pct >= 50) return 'D';
      return 'F';
    };

    return {
      course,
      assignments: courseAssignments,
      quizzes: courseQuizzes,
      assignmentPercentage: asgnPct,
      quizPercentage: quizPct,
      finalPercentage: finalPct,
      letterGrade: getLetterGrade(finalPct),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Gradebook</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your marks for assignments and quizzes across enrolled courses.
        </p>
      </div>

      {courseReportCards.length === 0 ? (
        <EmptyState
          title="No Enrolled Courses"
          description="Enroll in courses to start receiving grades and feedback."
        />
      ) : (
        <div className="space-y-6">
          {courseReportCards.map(({ course, assignments: cAsgn, quizzes: cQuiz, assignmentPercentage, quizPercentage, finalPercentage, letterGrade }) => (
            <Card key={course.id}>
              {/* Course Header with Grade Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                      {course.course_code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{course.credits} Credits</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{course.course_name}</h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Overall Score</p>
                    <p className="text-base font-extrabold text-indigo-600">
                      {finalPercentage !== null ? `${finalPercentage.toFixed(1)}%` : 'In Progress'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-200">
                    {letterGrade}
                  </div>
                </div>
              </div>

              {/* Assessment Breakdown Table */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assignments Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-500" /> Assignments
                    </span>
                    <span className="text-slate-500 font-normal">
                      Avg: {assignmentPercentage !== null ? `${assignmentPercentage.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cAsgn.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No assignments scheduled</p>
                    ) : (
                      cAsgn.map((a) => {
                        const sub = a.submission;
                        return (
                          <div
                            key={a.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">{a.title}</span>
                            {sub && sub.status === 'graded' ? (
                              <span className="font-bold text-emerald-700">
                                {sub.marks} / {a.max_marks}
                              </span>
                            ) : sub ? (
                              <span className="text-blue-600 font-medium">Under Review</span>
                            ) : (
                              <span className="text-slate-400">Not Submitted</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Quizzes Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-500" /> Quizzes
                    </span>
                    <span className="text-slate-500 font-normal">
                      Avg: {quizPercentage !== null ? `${quizPercentage.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cQuiz.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No quizzes scheduled</p>
                    ) : (
                      cQuiz.map((q) => {
                        const att = q.attempt;
                        return (
                          <div
                            key={q.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">{q.title}</span>
                            {q.is_attempted && att ? (
                              <span className="font-bold text-emerald-700">
                                {att.score} / {q.max_marks}
                              </span>
                            ) : (
                              <span className="text-slate-400">Not Attempted</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
