import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Edit, Users, User } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { adminService } from '../../services/adminService';
import { Course } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../hooks/useToast';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({
    course_code: '',
    course_name: '',
    description: '',
    syllabus: '',
    credits: 4,
    semester: 5,
    department: 'Computer Science',
    faculty_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [cData, fData] = await Promise.all([
        courseService.getCourses(),
        adminService.getFacultyDropdown()
      ]);
      setCourses(cData);
      setFacultyList(fData);
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
    setEditingCourse(null);
    setForm({
      course_code: '',
      course_name: '',
      description: '',
      syllabus: '',
      credits: 4,
      semester: 5,
      department: 'Computer Science',
      faculty_id: facultyList[0]?.id ? String(facultyList[0].id) : ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      course_code: course.course_code,
      course_name: course.course_name,
      description: course.description,
      syllabus: course.syllabus || '',
      credits: course.credits,
      semester: course.semester,
      department: course.department,
      faculty_id: String(course.faculty_id)
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_code || !form.course_name || !form.faculty_id) {
      error('Course code, name, and assigned faculty are required');
      return;
    }

    setSaving(true);
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, {
          course_name: form.course_name,
          description: form.description,
          syllabus: form.syllabus,
          credits: form.credits,
          semester: form.semester,
          department: form.department,
          faculty_id: Number(form.faculty_id)
        });
        success('Course updated successfully!');
      } else {
        await courseService.createCourse({
          course_code: form.course_code,
          course_name: form.course_name,
          description: form.description,
          syllabus: form.syllabus,
          credits: form.credits,
          semester: form.semester,
          department: form.department,
          faculty_id: Number(form.faculty_id)
        });
        success('Course created and assigned successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await courseService.deleteCourse(deleteId);
      success('Course deleted');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Course Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage degree courses and faculty assignments.</p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Course
        </Button>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No Courses Found"
            description="Create your first curriculum course."
            actionText="Add Course"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Credits & Sem</th>
                  <th className="py-3 px-4">Assigned Professor</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] mr-2">
                        {course.course_code}
                      </span>
                      <strong className="text-slate-900">{course.course_name}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{course.department}</td>
                    <td className="py-3 px-4 text-slate-600">{course.credits} Credits • Sem {course.semester}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {course.faculty?.full_name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {course.enrolled_students_count || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(course.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create Course'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              value={form.course_code}
              onChange={(e) => setForm({ ...form, course_code: e.target.value.toUpperCase() })}
              placeholder="CS501"
              required
              disabled={!!editingCourse}
            />
            <Input
              label="Credits"
              type="number"
              min="1"
              max="10"
              value={form.credits}
              onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 3 })}
              required
            />
          </div>

          <Input
            label="Course Title"
            value={form.course_name}
            onChange={(e) => setForm({ ...form, course_name: e.target.value })}
            placeholder="Advanced Algorithm Design"
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Assigned Faculty Member <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.faculty_id}
              onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">Select Instructor</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.full_name} ({f.department} - {f.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Semester</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5"
              >
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? All associated data will be removed."
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};
