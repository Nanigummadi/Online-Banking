import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    type: 'positive' | 'negative' | 'neutral';
    text: string;
  };
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  trend,
  variant = 'slate',
}) => {
  const dotColorMap = {
    emerald: 'bg-emerald-500',
    teal: 'bg-indigo-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-indigo-500',
    slate: 'bg-slate-500',
  };

  const badgeColorMap = {
    emerald: 'bg-emerald-50 text-emerald-700',
    teal: 'bg-indigo-50 text-indigo-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-800',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-indigo-50 text-indigo-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  const dotColor = dotColorMap[variant] || 'bg-indigo-500';
  const badgeColor = badgeColorMap[variant] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 text-slate-500 text-sm font-medium">
          <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
          <span>{label}</span>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badgeColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
        </span>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          {subtext && <span>{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trend.type === 'positive'
                  ? 'text-emerald-600'
                  : trend.type === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
