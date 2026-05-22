import React from 'react';

export interface StatCardProps {
  icon: React.ElementType;
  iconColorClass?: string;
  iconBgClass?: string;
  iconClassName?: string;
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  rightElement?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColorClass = 'text-emerald-600',
  iconBgClass = 'bg-emerald-50',
  iconClassName = 'w-6 h-6',
  label,
  value,
  description,
  rightElement,
  layout = 'horizontal',
  className = '',
}) => {
  if (layout === 'vertical') {
    return (
      <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        <div className="flex items-start justify-between">
          <div className={`rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
            <Icon className={`${iconColorClass} ${iconClassName}`} />
          </div>
          {rightElement}
        </div>
        <div className="mt-3">
          <div className="mb-0.5">{label}</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 flex items-baseline gap-2">
            {value}
          </div>
          {description && <div className="mt-1">{description}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 ${className}`}>
      <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${iconBgClass}`}>
        <Icon className={`${iconColorClass} ${iconClassName}`} />
      </div>
      <div>
        <div className="mb-0.5">{label}</div>
        <div className="text-2xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
          {value}
        </div>
        {description && <div className="mt-1">{description}</div>}
      </div>
    </div>
  );
};
