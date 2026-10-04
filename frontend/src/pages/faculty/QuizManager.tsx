import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  Award,
  Clock,
  CheckCircle,
  Users,
  Eye,
  PlusCircle,
  X
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { courseService } from '../../services/courseService';
import { Quiz, Course, QuizAttempt } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

interface QuestionDraft {
  question_text: string;
  marks: number;
  options: { option_text: string; is_correct: boolean }[];
}

export const FacultyQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz Builder Modal
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [duration, setDuration] = useState(20);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Results View Modal
  const [viewingQuizResults, setViewingQuizResults] = useState<Quiz | null>(null);
  const [resultsList, setResultsList] = useState<QuizAttempt[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Delete dialog
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [qData, cData] = await Promise.all([
        quizService.getQuizzes(),
        courseService.getCourses({ my_courses: true })
      ]);
      setQuizzes(qData);
      setCourses(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBuilder = () => {
    setCourseId(courses[0]?.id ? String(courses[0].id) : '');
    setQuizTitle('');
    setQuizDesc('');
    setDuration(20);
    setQuestions([
      {
        question_text: '',
        marks: 2.0,
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]
      }
    ]);
    setIsBuilderOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        marks: 2.0,
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx].question_text = text;
      return updated;
    });
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].options[optIdx].option_text = text;
      return updated;
    });
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
        ...opt,
        is_correct: i === optIdx,
      }));
      return updated;
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !quizTitle) {
      error('Course and Quiz title are required');
      return;
    }
    if (questions.length === 0) {
      error('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        error(`Question ${i + 1} is missing question text`);
        return;
      }
      const hasCorrect = questions[i].options.some((o) => o.is_correct && o.option_text.trim());
      if (!hasCorrect) {
        error(`Question ${i + 1} must have a marked correct option with valid text`);
        return;
      }
    }

    setSavingQuiz(true);
    try {
      await quizService.createQuiz({
        course_id: Number(courseId),
        title: quizTitle,
        description: quizDesc,
        duration_minutes: duration,
        questions
      });
      success('Quiz created with automatic grading rules!');
      setIsBuilderOpen(false);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleViewResults = async (quiz: Quiz) => {
    setViewingQuizResults(quiz);
    setLoadingResults(true);
    try {
      const results = await quizService.getQuizResults(quiz.id);
      setResultsList(Array.isArray(results) ? results : [results]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    try {
      await quizService.deleteQuiz(deleteQuizId);
      success('Quiz deleted successfully');
      setDeleteQuizId(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quiz & Test Builder</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build timed multiple choice questions with automated score calculation.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenBuilder}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Quiz
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No Quizzes Created"
          description="Create your first online quiz with multiple choice questions."
          actionText="Create Quiz"
          onAction={handleOpenBuilder}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((q) => (
            <Card key={q.id} className="flex flex-col justify-between hover:shadow-card transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {q.course_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {q.duration_minutes} Mins • {q.max_marks} Marks
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{q.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {q.description || 'Online test.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewResults(q)}
                  leftIcon={<Users className="w-3.5 h-3.5" />}
                >
                  View Student Scores
                </Button>

                <button
                  onClick={() => setDeleteQuizId(q.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Create Timed Quiz"
        subtitle="Specify questions and designate the correct choices for automatic evaluation"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveQuiz} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Duration (Minutes)"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 20)}
              required
            />
          </div>

          <Input
            label="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="e.g. Quiz 2: CPU Scheduling & Deadlock Conditions"
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={quizDesc}
              onChange={(e) => setQuizDesc(e.target.value)}
              rows={2}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Instructions for students taking this test..."
            />
          </div>

          {/* Dynamic Question Builder */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Questions ({questions.length})</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddQuestion}
                leftIcon={<PlusCircle className="w-4 h-4 text-indigo-600" />}
              >
                Add Question
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">Question {qIdx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Enter question statement..."
                    value={q.question_text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    required
                  />

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Options (Click radio to mark correct answer):
                    </p>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-opt-${qIdx}`}
                          checked={opt.is_correct}
                          onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt.option_text}
                          onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsBuilderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={savingQuiz}>
              Save & Publish Quiz
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Results Modal */}
      {viewingQuizResults && (
        <Modal
          isOpen={true}
          onClose={() => setViewingQuizResults(null)}
          title={`Quiz Results: ${viewingQuizResults.title}`}
          subtitle={`Max Marks: ${viewingQuizResults.max_marks} • Total Attempts: ${resultsList.length}`}
          maxWidth="lg"
        >
          {loadingResults ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading student scores...</div>
          ) : resultsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No student has attempted this quiz yet.</div>
          ) : (
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultsList.map((att) => (
                    <tr key={att.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{att.student_name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{att.student_number}</td>
                      <td className="py-2.5 px-3 font-extrabold text-indigo-600">
                        {att.score} / {viewingQuizResults.max_marks}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{formatDateTime(att.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteQuizId}
        onClose={() => setDeleteQuizId(null)}
        onConfirm={handleDeleteQuiz}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz and its associated question pool?"
        confirmText="Delete Quiz"
        isDangerous={true}
      />
    </div>
  );
};
