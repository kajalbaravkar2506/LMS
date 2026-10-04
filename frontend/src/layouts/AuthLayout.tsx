import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, ShieldCheck, Sparkles, BookCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-500/30 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          EduVerse LMS
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Next-Generation University Learning & Academic Management
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
