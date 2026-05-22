import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = 'py-16' 
}) => {
  return (
    <div className={`text-center text-slate-400 flex flex-col items-center justify-center ${className}`}>
      <div className="text-slate-300 mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};
