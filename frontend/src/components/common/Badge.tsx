import React, { ReactNode } from 'react';
import { getStatusBadgeVariant } from '../../utils/formatters';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'status';
  statusValue?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  statusValue,
  size = 'md',
  className = '',
}) => {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (statusValue) {
    const badgeColors = getStatusBadgeVariant(statusValue);
    styleClasses = badgeColors.bg;
  } else {
    switch (variant) {
      case 'primary':
        styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'success':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'warning':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'danger':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'info':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'neutral':
      default:
        styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styleClasses} ${sizeClasses} ${className} capitalize tracking-wide select-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {children}
    </span>
  );
};
