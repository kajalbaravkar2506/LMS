import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { courseService } from '../../services/courseService';
import { Assignment, Course } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const FacultyAssignments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('course_id');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdParam || '');
  const [loading, setLoading] = useState(true);

  // Create/Edit Assignment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: 50
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [aData, cData] = await Promise.all([
        assignmentService.getAssignments({ course_id: selectedCourseId ? Number(selectedCourseId) : undefined }),
        courseService.getCourses({ my_courses: true })
      ]);
      setAssignments(aData);
      setCourses(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    const defaultCourse = courses[0]?.id ? String(courses[0].id) : '';
    setForm({
      course_id: selectedCourseId || defaultCourse,
      title: '',
      description: '',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      max_marks: 50
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setForm({
      course_id: String(a.course_id),
      title: a.title,
      description: a.description || '',
      due_date: a.due_date ? a.due_date.slice(0, 16) : '',
      max_marks: a.max_marks
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title || !form.due_date) {
      error('Course, title, and due date are required');
      return;
    }

    setSaving(true);
    try {
      if (editingAssignment) {
        await assignmentService.updateAssignment(editingAssignment.id, {
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          max_marks: form.max_marks
        });
        success('Assignment updated successfully!');
      } else {
        await assignmentService.createAssignment({
          course_id: Number(form.course_id),
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          max_marks: form.max_marks
        });
        success('Assignment published and students notified!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await assignmentService.deleteAssignment(deleteId);
      success('Assignment deleted successfully');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assignment Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create homework tasks, project deliverables, and track student submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All My Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} - {c.course_name}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No Assignments Found"
          description="Click 'Create Task' to publish a new homework or project assignment."
          actionText="Create Assignment"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <Card key={a.id} className="hover:border-slate-300 transition">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                      {a.course_code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{a.course_name}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{a.description}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Deadline: <strong>{formatDateTime(a.due_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Maximum: <strong>{a.max_marks} Marks</strong></span>
                    </div>
                  </div>
                </div>

                {/* Submissions stats & actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400">Total: </span>
                      <strong className="text-slate-800">{a.total_submissions || 0}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Graded: </span>
                      <strong className="text-emerald-700">{a.graded_submissions || 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/faculty/submissions?assignment_id=${a.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Grade Submissions
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Course <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
              disabled={!!editingAssignment}
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
            label="Assignment Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Assignment 2: SQL Subqueries & Optimization"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
            />
            <Input
              label="Maximum Marks"
              type="number"
              min="1"
              value={form.max_marks}
              onChange={(e) => setForm({ ...form, max_marks: parseFloat(e.target.value) || 50 })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Problem Description & Instructions
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Detail the task deliverables, formats, and submission guidelines..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              {editingAssignment ? 'Save Changes' : 'Publish Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to remove this assignment? Existing student submissions will also be deleted."
        confirmText="Delete Assignment"
        isDangerous={true}
      />
    </div>
  );
};
