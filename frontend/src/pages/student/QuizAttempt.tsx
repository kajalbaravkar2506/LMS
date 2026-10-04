import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Award,
  BookOpen
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { Quiz, Question, QuizAttempt } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';

export const StudentQuizAttempt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const loadQuiz = async () => {
    if (!id) return;
    try {
      const data = await quizService.getQuizById(Number(id));
      setQuiz(data);

      if (data.is_attempted && data.attempt) {
        // Quiz was already attempted, restore answers
        const ansMap: Record<number, number> = {};
        data.attempt.answers?.forEach((a) => {
          if (a.selected_option_id) {
            ansMap[a.question_id] = a.selected_option_id;
          }
        });
        setSelectedAnswers(ansMap);
      } else {
        // Start new attempt timer
        setTimeLeft((data.duration_minutes || 20) * 60);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (loading || !quiz || quiz.is_attempted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quiz, timeLeft]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (quiz?.is_attempted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoSubmit = () => {
    warning('Time is up! Submitting your answers automatically.');
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !id) return;

    const payload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
      question_id: Number(qId),
      selected_option_id: optId,
    }));

    setSubmitting(true);
    try {
      const result = await quizService.submitQuiz(Number(id), payload);
      setSubmissionResult(result);
      setResultModalOpen(true);
      success('Quiz submitted and scored successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-slate-200 animate-pulse rounded-2xl" />
        <CardSkeleton />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No questions found for this quiz.</p>
        <Link to="/student/quizzes" className="text-indigo-600 font-bold mt-3 inline-block">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 180; // less than 3 minutes

  return (
    <div className="space-y-6">
      {/* Quiz Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {quiz.course_code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Question {currentQIndex + 1} of {totalQuestions}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">{quiz.title}</h1>
        </div>

        {/* Timer or Score Indicator */}
        {quiz.is_attempted ? (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
            <Award className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Final Score</p>
              <p className="text-sm font-bold">{quiz.attempt?.score} / {quiz.max_marks} Marks</p>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
              isLowTime
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Question {currentQIndex + 1}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {currentQuestion.marks} Marks
              </span>
            </div>

            <h3 className="text-base font-semibold text-slate-900 leading-relaxed">
              {currentQuestion.question_text}
            </h3>

            {/* Multiple Choice Options */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                const optionLetter = String.fromCharCode(65 + idx);

                return (
                  <div
                    key={opt.id || idx}
                    onClick={() => opt.id && handleSelectOption(currentQuestion.id, opt.id)}
                    className={`p-4 rounded-xl border transition-all duration-150 flex items-center gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span className="text-sm font-medium text-slate-800 leading-normal flex-1">
                      {opt.option_text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              {currentQIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                !quiz.is_attempted && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleSubmitQuiz}
                    isLoading={submitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Quiz
                  </Button>
                )
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Question Navigator */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Question Palette" subtitle={`${answeredCount} of ${totalQuestions} answered`} />
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = idx === currentQIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {!quiz.is_attempted && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSubmitQuiz}
                  isLoading={submitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit & Finish
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => {
          setResultModalOpen(false);
          navigate('/student/quizzes');
        }}
        title="Quiz Completed!"
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Your Score Has Been Computed</h3>
            <p className="text-xs text-slate-500 mt-1">Transaction verified and grade recorded to database.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-3xl font-extrabold text-indigo-600 font-mono">
              {submissionResult?.score} / {submissionResult?.max_marks}
            </div>
            <p className="text-xs font-bold text-slate-600 mt-1">
              {submissionResult ? ((submissionResult.score / submissionResult.max_marks) * 100).toFixed(1) : 0}% Obtained
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              setResultModalOpen(false);
              navigate('/student/quizzes');
            }}
          >
            Back to Quizzes
          </Button>
        </div>
      </Modal>
    </div>
  );
};
