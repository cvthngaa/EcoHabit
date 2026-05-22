import React from 'react';

export interface BadgeProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, children, className = '' }) => {
  // Base classes that can be overridden/extended by className
  const baseClasses = "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold";
  
  return (
    <span className={`${baseClasses} ${className}`}>
      {label || children}
    </span>
  );
};
