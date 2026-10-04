import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Edit, Calendar, BookOpen } from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import { courseService } from '../../services/courseService';
import { Announcement, Course } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const FacultyAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [aList, cList] = await Promise.all([
        announcementService.getAnnouncements(),
        courseService.getCourses({ my_courses: true })
      ]);
      setAnnouncements(aList);
      setCourses(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setCourseId(courses[0]?.id ? String(courses[0].id) : '');
    setTitle('');
    setContent('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      error('Title and message content are required');
      return;
    }

    setSaving(true);
    try {
      await announcementService.createAnnouncement({
        course_id: courseId ? Number(courseId) : null,
        title,
        content
      });
      success('Announcement published and students notified!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await announcementService.deleteAnnouncement(deleteId);
      success('Announcement deleted');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish circulars, guest lecture notices, and exam updates to enrolled students.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Announcement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No Announcements"
          description="Post your first class update to notify students."
          actionText="Create Announcement"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="hover:border-slate-300 transition">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {ann.course_code || 'GLOBAL'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{ann.course_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatDateTime(ann.created_at)}</span>
                  <button
                    onClick={() => setDeleteId(ann.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-700 mt-2 whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                {ann.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Course Announcement"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Target Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lab 3 Starter Files Uploaded"
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Message Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Enter full notice text for students..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?"
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};
