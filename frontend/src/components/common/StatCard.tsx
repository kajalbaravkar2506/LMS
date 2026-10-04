import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'indigo',
  onClick,
}) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-100' },
    emerald: { bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-100' },
    blue: { bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-100' },
    rose: { bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-100' },
    purple: { bg: 'bg-purple-50/80', text: 'text-purple-600', border: 'border-purple-100' },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} ${scheme.border} border`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  );
};
