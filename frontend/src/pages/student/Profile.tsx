import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, GraduationCap, Building2, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../hooks/useToast';

export const UserProfile: React.FC = () => {
  const { user, updateUser, role } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile({
        full_name: fullName,
        phone,
        profile_image: profileImage,
      });
      updateUser(updated);
      success('Profile updated successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New password and confirm password do not match');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account information, contact details, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <Card className="md:col-span-1 flex flex-col items-center text-center p-6 space-y-4">
          <img
            src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.full_name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-md"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.full_name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <span className="mt-2.5 inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              {role} Account
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2 text-xs">
            {role === 'student' && user?.student_profile && (
              <>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Roll No:</span>
                  <span className="font-semibold text-slate-700">{user.student_profile.student_number}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-700">{user.student_profile.department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Semester:</span>
                  <span className="font-semibold text-slate-700">Sem {user.student_profile.semester} (Yr {user.student_profile.year})</span>
                </div>
              </>
            )}
            {role === 'faculty' && user?.faculty_profile && (
              <>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Faculty ID:</span>
                  <span className="font-semibold text-slate-700">{user.faculty_profile.faculty_number}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-700">{user.faculty_profile.department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Designation:</span>
                  <span className="font-semibold text-slate-700">{user.faculty_profile.designation}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Edit Details & Security */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader title="Personal Information" icon={<UserIcon className="w-5 h-5" />} />
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                leftIcon={<UserIcon className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email address is managed by university IT administration."
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Profile Image URL"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://..."
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={savingProfile}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader title="Security & Password" icon={<Lock className="w-5 h-5 text-indigo-600" />} />
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={savingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
