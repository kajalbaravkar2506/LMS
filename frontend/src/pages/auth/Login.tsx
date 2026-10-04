import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, Shield, GraduationCap, School } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = await login(email, password);
      success('Welcome back! Signed in successfully.');
      navigate(redirectUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsLoading(true);
    try {
      const redirectUrl = await login(demoEmail, 'Password123!');
      success('Logged in with demo credentials');
      navigate(redirectUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Demo login failed';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h3>
        <p className="text-xs text-slate-500 mt-1">Enter your university credentials to access your dashboard.</p>
      </div>

      {searchParams.get('expired') && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
          Your session expired. Please sign in again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@lms.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In to Portal
        </Button>
      </form>

      {/* Quick Demo Access Buttons */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick 1-Click Demo Logins</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@lms.edu')}
            disabled={isLoading}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-800 transition text-center disabled:opacity-50"
          >
            <Shield className="w-4 h-4 text-purple-600 mb-1" />
            <span className="text-[11px] font-bold">Admin</span>
            <span className="text-[9px] text-purple-600">Full System</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('dr.alan@lms.edu')}
            disabled={isLoading}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-800 transition text-center disabled:opacity-50"
          >
            <School className="w-4 h-4 text-blue-600 mb-1" />
            <span className="text-[11px] font-bold">Faculty</span>
            <span className="text-[9px] text-blue-600">Dr. Turing</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('student1@lms.edu')}
            disabled={isLoading}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 transition text-center disabled:opacity-50"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold">Student</span>
            <span className="text-[9px] text-emerald-600">Alex J.</span>
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          New Student?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create Student Account
          </Link>
        </p>
      </div>
    </div>
  );
};
