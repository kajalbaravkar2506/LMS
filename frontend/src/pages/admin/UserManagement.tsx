import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  School,
  GraduationCap,
  Shield,
  CheckCircle,
  XCircle,
  Filter,
  ToggleLeft,
  ToggleRight,
  Edit
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User, UserRole } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Modals
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Faculty form
  const [facForm, setFacForm] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    faculty_number: '',
    phone: '',
    password: 'Password123!'
  });
  const [creatingFac, setCreatingFac] = useState(false);

  // Student form
  const [stuForm, setStuForm] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science',
    year: 1,
    semester: 1,
    student_number: '',
    phone: '',
    password: 'Password123!'
  });
  const [creatingStu, setCreatingStu] = useState(false);

  const { success, error } = useToast();

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers({
        role: roleFilter || undefined,
        search: search || undefined
      });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadUsers();
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await adminService.toggleUserStatus(user.id);
      success(`User ${user.full_name} ${res.is_active ? 'activated' : 'deactivated'}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: res.is_active } : u))
      );
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingFac(true);
    try {
      await adminService.createFacultyUser(facForm);
      success('Faculty account created successfully!');
      setIsFacultyModalOpen(false);
      loadUsers();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create faculty');
    } finally {
      setCreatingFac(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStu(true);
    try {
      await adminService.createStudentUser(stuForm);
      success('Student account created successfully!');
      setIsStudentModalOpen(false);
      loadUsers();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create student');
    } finally {
      setCreatingStu(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administer student, faculty, and administrative staff accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsStudentModalOpen(true)}
            leftIcon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
          >
            Add Student
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsFacultyModalOpen(true)}
            leftIcon={<School className="w-4 h-4" />}
          >
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="Try clearing your filters or create a new user profile."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Profile Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={u.full_name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'faculty'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {u.role === 'student' && u.student_profile && (
                        <span>
                          {u.student_profile.student_number} • {u.student_profile.department} (Sem {u.student_profile.semester})
                        </span>
                      )}
                      {u.role === 'faculty' && u.faculty_profile && (
                        <span>
                          {u.faculty_profile.faculty_number} • {u.faculty_profile.designation} ({u.faculty_profile.department})
                        </span>
                      )}
                      {u.role === 'admin' && <span className="text-slate-400">System Admin</span>}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          u.is_active ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {u.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Faculty Modal */}
      <Modal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        title="Create Faculty Account"
        maxWidth="md"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <Input
            label="Full Name"
            value={facForm.full_name}
            onChange={(e) => setFacForm({ ...facForm, full_name: e.target.value })}
            placeholder="Dr. Jane Smith"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={facForm.email}
            onChange={(e) => setFacForm({ ...facForm, email: e.target.value })}
            placeholder="jane.smith@lms.edu"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Department</label>
              <select
                value={facForm.department}
                onChange={(e) => setFacForm({ ...facForm, department: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <Input
              label="Designation"
              value={facForm.designation}
              onChange={(e) => setFacForm({ ...facForm, designation: e.target.value })}
              placeholder="Professor"
              required
            />
          </div>
          <Input
            label="Initial Password"
            value={facForm.password}
            onChange={(e) => setFacForm({ ...facForm, password: e.target.value })}
            placeholder="Password123!"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsFacultyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={creatingFac}>
              Create Faculty
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Student Modal */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Create Student Account"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Input
            label="Full Name"
            value={stuForm.full_name}
            onChange={(e) => setStuForm({ ...stuForm, full_name: e.target.value })}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={stuForm.email}
            onChange={(e) => setStuForm({ ...stuForm, email: e.target.value })}
            placeholder="john.doe@lms.edu"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Department</label>
              <select
                value={stuForm.department}
                onChange={(e) => setStuForm({ ...stuForm, department: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Year"
                type="number"
                min="1"
                max="4"
                value={stuForm.year}
                onChange={(e) => setStuForm({ ...stuForm, year: parseInt(e.target.value) || 1 })}
              />
              <Input
                label="Sem"
                type="number"
                min="1"
                max="8"
                value={stuForm.semester}
                onChange={(e) => setStuForm({ ...stuForm, semester: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <Input
            label="Initial Password"
            value={stuForm.password}
            onChange={(e) => setStuForm({ ...stuForm, password: e.target.value })}
            placeholder="Password123!"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={creatingStu}>
              Create Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
