import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Clock, Award, CheckCircle, ArrowRight, AlertCircle, Play } from 'lucide-react';
import { quizService } from '../../services/quizService';
import { Quiz } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export const StudentQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await quizService.getQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quizzes & Online Assessments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Take timed multiple-choice tests with automatic instant evaluation.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No Quizzes Available"
          description="Your enrolled courses have no active quizzes scheduled right now."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((quiz) => {
            const attempt = quiz.attempt;
            const isCompleted = quiz.is_attempted;

            return (
              <Card key={quiz.id} className="flex flex-col justify-between hover:shadow-card hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {quiz.course_code}
                    </span>
                    {isCompleted ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Score: {attempt?.score} / {quiz.max_marks}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Available
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Test your knowledge on course topics.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: <strong>{quiz.duration_minutes} Mins</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Max Marks: <strong>{quiz.max_marks}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-xs text-slate-400">
                      Submitted {attempt?.submitted_at ? formatDateTime(attempt.submitted_at) : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-indigo-600 font-semibold">
                      1 Attempt Allowed
                    </span>
                  )}

                  {isCompleted ? (
                    <Link
                      to={`/student/quizzes/${quiz.id}/take`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                    >
                      Review Answers <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/student/quizzes/${quiz.id}/take`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Quiz
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
