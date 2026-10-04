import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  MessageSquare,
  Award
} from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { Assignment, Submission } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDateTime, formatDate, formatMarks } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Submission Modal state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadAssignments = async () => {
    try {
      const data = await assignmentService.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFile(null);
    setFileUrl(assignment.submission?.file_url || '');
    setIsSubmitModalOpen(true);
  };

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!file && !fileUrl) {
      error('Please select a file to upload or enter a submission URL');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignment_id', String(selectedAssignment.id));
      if (file) {
        formData.append('file', file);
      }
      if (fileUrl) {
        formData.append('file_url', fileUrl);
      }

      await assignmentService.submitAssignment(formData);
      success('Assignment submitted successfully!');
      setIsSubmitModalOpen(false);
      loadAssignments();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'pending') return !a.is_submitted;
    if (activeTab === 'submitted') return a.is_submitted && !a.is_graded;
    if (activeTab === 'graded') return a.is_graded;
    return true;
  });

  const pendingCount = assignments.filter((a) => !a.is_submitted).length;
  const submittedCount = assignments.filter((a) => a.is_submitted && !a.is_graded).length;
  const gradedCount = assignments.filter((a) => a.is_graded).length;

  const tabs = [
    { id: 'all', label: `All Tasks (${assignments.length})` },
    { id: 'pending', label: `Pending (${pendingCount})` },
    { id: 'submitted', label: `Submitted (${submittedCount})` },
    { id: 'graded', label: `Graded (${gradedCount})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assignments & Submissions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review upcoming deadlines, upload assignment deliverables, and view professor grades with feedback.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Assignments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No Assignments in this Category"
          description="You are all caught up! No tasks found matching this status filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((a) => {
            const sub = a.submission;
            return (
              <Card key={a.id} className="hover:border-slate-300 transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {a.course_code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {a.course_name}
                      </span>
                      {sub && (
                        <Badge statusValue={sub.status}>
                          {sub.status}
                        </Badge>
                      )}
                      {!sub && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Pending Submission
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{a.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Deadline: <strong>{formatDateTime(a.due_date)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Max Marks: <strong>{a.max_marks}</strong></span>
                      </div>
                    </div>

                    {/* Graded Feedback Card */}
                    {sub && sub.status === 'graded' && (
                      <div className="mt-4 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-900">
                          <span>Marks Awarded: {sub.marks} / {a.max_marks}</span>
                          <span className="text-emerald-700">{((Number(sub.marks) / a.max_marks) * 100).toFixed(1)}%</span>
                        </div>
                        {sub.feedback && (
                          <div className="flex items-start gap-1.5 text-emerald-800 pt-1 border-t border-emerald-200/60">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p><strong>Feedback:</strong> {sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {sub ? (
                      <div className="text-left lg:text-right">
                        <p className="text-[11px] text-slate-400">
                          Submitted: {formatDate(sub.submitted_at)}
                        </p>
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Submitted File
                          </a>
                        )}
                      </div>
                    ) : null}

                    {(!sub || sub.status !== 'graded') && (
                      <Button
                        size="sm"
                        variant={sub ? 'outline' : 'primary'}
                        onClick={() => handleOpenSubmit(a)}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                      >
                        {sub ? 'Resubmit Solution' : 'Submit Assignment'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit: ${selectedAssignment?.title || ''}`}
        subtitle={`Course: ${selectedAssignment?.course_code} • Maximum Marks: ${selectedAssignment?.max_marks}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmissionSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Upload Solution File (PDF, DOCX, ZIP, Code)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 bg-slate-50 transition cursor-pointer">
              <input
                type="file"
                id="assignment-file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="assignment-file" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {file ? file.name : 'Click to select file or drag here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Up to 16 MB allowed</p>
              </label>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 font-semibold uppercase">Or provide URL</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              External Document / GitHub URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/... or https://drive.google.com/..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Submission
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
