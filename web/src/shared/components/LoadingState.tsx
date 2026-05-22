import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Đang tải...', 
  className = 'py-16', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 w-full ${className}`}>
      <Loader2 className={`${sizeClasses} text-emerald-500 animate-spin`} />
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
};
