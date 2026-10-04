import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  ArrowLeft,
  User,
  MessageSquare,
  Search
} from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { Submission, Assignment } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const SubmissionsGrade: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment_id');

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAsgnId, setSelectedAsgnId] = useState<string>(assignmentId || '');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Grade Modal state
  const [activeSub, setActiveSub] = useState<Submission | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const aList = await assignmentService.getAssignments();
      setAssignments(aList);

      const targetId = selectedAsgnId || (aList[0]?.id ? String(aList[0].id) : '');
      if (targetId) {
        setSelectedAsgnId(targetId);
        const sList = await assignmentService.getAssignmentSubmissions(Number(targetId));
        setSubmissions(sList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAsgnId]);

  const handleOpenGrade = (sub: Submission) => {
    setActiveSub(sub);
    setMarks(sub.marks !== null && sub.marks !== undefined ? String(sub.marks) : '');
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub) return;

    setSavingGrade(true);
    try {
      await assignmentService.gradeSubmission(activeSub.id, {
        marks: parseFloat(marks),
        feedback
      });
      success('Grade and feedback saved!');
      setActiveSub(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Grading failed');
    } finally {
      setSavingGrade(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const name = s.student?.full_name?.toLowerCase() || '';
    const roll = s.student?.student_number?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm.toLowerCase());
  });

  const currentAssignment = assignments.find((a) => String(a.id) === selectedAsgnId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/faculty/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tasks
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grade Submissions</h1>
          <p className="text-xs text-slate-500 mt-1">Review uploaded files, assign marks, and give student feedback.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAsgnId}
            onChange={(e) => setSelectedAsgnId(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.course_code}: {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentAssignment && (
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-indigo-900">{currentAssignment.title}</span>
            <span className="text-indigo-700 ml-2">({currentAssignment.course_code} - {currentAssignment.course_name})</span>
          </div>
          <div className="flex gap-4 font-semibold text-indigo-800">
            <span>Max Marks: {currentAssignment.max_marks}</span>
            <span>Due: {formatDateTime(currentAssignment.due_date)}</span>
            <span>Submissions: {submissions.length}</span>
          </div>
        </div>
      )}

      {/* Submissions Table Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Submissions Found"
            description="No student submissions recorded for this assignment yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Marks Awarded</th>
                  <th className="py-3 px-4">Deliverable</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sub.student?.full_name}</div>
                      <div className="text-[11px] text-slate-400">{sub.student?.student_number} • {sub.student?.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDateTime(sub.submitted_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'graded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.status === 'late'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {sub.status === 'graded' ? `${sub.marks} / ${currentAssignment?.max_marks || 100}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {sub.file_url ? (
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <Download className="w-3.5 h-3.5" /> View File
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={sub.status === 'graded' ? 'outline' : 'primary'}
                        onClick={() => handleOpenGrade(sub)}
                      >
                        {sub.status === 'graded' ? 'Edit Grade' : 'Grade Paper'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grade Modal */}
      {activeSub && (
        <Modal
          isOpen={true}
          onClose={() => setActiveSub(null)}
          title={`Grade Paper: ${activeSub.student?.full_name}`}
          subtitle={`Assignment: ${currentAssignment?.title} (Max: ${currentAssignment?.max_marks || 100} Marks)`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            {activeSub.file_url && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Uploaded File:</span>
                <a
                  href={activeSub.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Download Solution
                </a>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Marks Awarded (0 to {currentAssignment?.max_marks || 100}) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max={currentAssignment?.max_marks || 100}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="e.g. 48.5"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Feedback & Constructive Review
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Good organization, excellent normal form derivation..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setActiveSub(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={savingGrade} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Record Grade
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
