import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface ModalProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  title, 
  icon, 
  onClose, 
  maxWidth = 'sm', 
  children,
  footer
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidthClass} border border-slate-200 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <IconButton
            onClick={onClose}
            icon={<X />}
            variant="ghost"
            size="sm"
            aria-label="Đóng"
            className="text-slate-400 hover:text-slate-600"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
