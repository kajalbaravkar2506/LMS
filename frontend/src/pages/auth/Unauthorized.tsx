import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const Unauthorized: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have the required permissions or role privileges to view this portal page.
        </p>
        <div className="pt-4">
          <Link to={role ? `/${role}/dashboard` : '/login'}>
            <Button variant="primary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
