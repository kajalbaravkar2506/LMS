import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Computer Science',
    year: 1,
    semester: 1,
    student_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      toastError('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = await register(formData);
      success('Account created successfully! Welcome to EduVerse.');
      navigate(redirectUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Student Registration</h3>
        <p className="text-xs text-slate-500 mt-1">Enroll in the university LMS portal to access courses and assignments.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          name="full_name"
          placeholder="e.g. John Doe"
          value={formData.full_name}
          onChange={handleChange}
          required
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john.doe@lms.edu"
          value={formData.email}
          onChange={handleChange}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 text-sm text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Comm">Electronics & Comm</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 text-sm text-slate-900 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value={1}>1st</option>
                <option value={2}>2nd</option>
                <option value={3}>3rd</option>
                <option value={4}>4th</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">Sem</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 text-sm text-slate-900 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone (Optional)"
            name="phone"
            placeholder="+1-555-0199"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="Roll Number"
            name="student_number"
            placeholder="STU2026..."
            value={formData.student_number}
            onChange={handleChange}
            leftIcon={<GraduationCap className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
          value={formData.password}
          onChange={handleChange}
          required
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-3"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
