import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Users,
  FileText,
  Upload,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { Course, CourseMaterial } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const FacultyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_name: '',
    description: '',
    syllabus: '',
    credits: 4,
    semester: 5,
    department: 'Computer Science'
  });
  const [savingCourse, setSavingCourse] = useState(false);

  // Upload Material Modal
  const [uploadModalCourse, setUploadModalCourse] = useState<Course | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialType, setMaterialType] = useState('pdf');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialUrl, setMaterialUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Delete Course Dialog
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);

  const { success, error } = useToast();

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

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      course_code: '',
      course_name: '',
      description: '',
      syllabus: '',
      credits: 4,
      semester: 5,
      department: 'Computer Science'
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      course_code: course.course_code,
      course_name: course.course_name,
      description: course.description,
      syllabus: course.syllabus || '',
      credits: course.credits,
      semester: course.semester,
      department: course.department
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.course_code || !courseForm.course_name) {
      error('Course code and course name are required');
      return;
    }

    setSavingCourse(true);
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, courseForm);
        success('Course updated successfully!');
      } else {
        await courseService.createCourse(courseForm);
        success('Course created successfully!');
      }
      setIsCourseModalOpen(false);
      loadCourses();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;
    try {
      await courseService.deleteCourse(deleteCourseId);
      success('Course deleted successfully');
      setDeleteCourseId(null);
      loadCourses();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleOpenUpload = (course: Course) => {
    setUploadModalCourse(course);
    setMaterialTitle('');
    setMaterialDesc('');
    setMaterialType('pdf');
    setMaterialFile(null);
    setMaterialUrl('');
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalCourse || !materialTitle) {
      error('Material title is required');
      return;
    }
    if (!materialFile && !materialUrl) {
      error('Please select a file or provide a URL');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', materialTitle);
      formData.append('description', materialDesc);
      formData.append('material_type', materialType);
      if (materialFile) {
        formData.append('file', materialFile);
      }
      if (materialUrl) {
        formData.append('file_url', materialUrl);
      }

      await courseService.uploadMaterial(uploadModalCourse.id, formData);
      success('Course material uploaded successfully!');
      setUploadModalCourse(null);
      loadCourses();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and maintain your course curricula, syllabus modules, and uploaded learning materials.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreateCourse}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Course
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No Courses Assigned"
          description="You haven't created any courses yet. Click 'Create New Course' to launch a new curriculum."
          actionText="Create Course"
          onAction={handleOpenCreateCourse}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                      {course.course_code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{course.credits} Credits • Sem {course.semester}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{course.course_name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditCourse(course)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCourseId(course.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {course.description || 'No description provided.'}
              </p>

              {/* Counts Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Students</p>
                  <p className="text-sm font-bold text-slate-800">{course.enrolled_students_count || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Materials</p>
                  <p className="text-sm font-bold text-slate-800">{course.materials_count || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Assignments</p>
                  <p className="text-sm font-bold text-slate-800">{course.assignments_count || 0}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenUpload(course)}
                  leftIcon={<Upload className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Upload Material
                </Button>

                <div className="flex gap-2">
                  <Link
                    to={`/faculty/assignments?course_id=${course.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Tasks
                  </Link>
                  <Link
                    to={`/faculty/quizzes?course_id=${course.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Quizzes
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingCourse ? 'Edit Course Details' : 'Create New Course Curriculum'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              value={courseForm.course_code}
              onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value.toUpperCase() })}
              placeholder="e.g. CS401"
              required
              disabled={!!editingCourse}
            />
            <Input
              label="Credits"
              type="number"
              min="1"
              max="10"
              value={courseForm.credits}
              onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 3 })}
              required
            />
          </div>

          <Input
            label="Course Title"
            value={courseForm.course_name}
            onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
            placeholder="e.g. Advanced Distributed Systems"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Department</label>
              <select
                value={courseForm.department}
                onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Semester</label>
              <select
                value={courseForm.semester}
                onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) || 1 })}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Course Description</label>
            <textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              rows={2}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Overview of syllabus scope and learning outcomes..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Syllabus Breakdown</label>
            <textarea
              value={courseForm.syllabus}
              onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })}
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Unit 1: Fundamentals&#10;Unit 2: Architecture&#10;Unit 3: Implementation..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={savingCourse}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Material Modal */}
      {uploadModalCourse && (
        <Modal
          isOpen={true}
          onClose={() => setUploadModalCourse(null)}
          title={`Upload Material: ${uploadModalCourse.course_code}`}
          maxWidth="md"
        >
          <form onSubmit={handleUploadMaterial} className="space-y-4">
            <Input
              label="Material Title"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="e.g. Lecture 04 - BCNF Normalization"
              required
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Material Type</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="pdf">PDF Lecture Slide / Note</option>
                <option value="code">Source Code / SQL Script</option>
                <option value="document">Word Document / Handout</option>
                <option value="presentation">Presentation (PPT)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Description (Optional)</label>
              <textarea
                value={materialDesc}
                onChange={(e) => setMaterialDesc(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Brief summary of notes..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">File Upload</label>
              <input
                type="file"
                onChange={(e) => e.target.files && setMaterialFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">Or External URL</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <Input
              label="External Document Link"
              value={materialUrl}
              onChange={(e) => setMaterialUrl(e.target.value)}
              placeholder="https://..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setUploadModalCourse(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={uploading} leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Upload File
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Course Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course Curriculum"
        message="Are you sure you want to delete this course? All associated materials, assignments, and quizzes will be removed."
        confirmText="Delete Course"
        isDangerous={true}
      />
    </div>
  );
};
