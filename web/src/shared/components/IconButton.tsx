import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge Tailwind classes safely
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The icon component to render. Accepts a React element (e.g. <X />)
   */
  icon?: React.ReactNode;
  /**
   * Style visual variant
   * @default 'ghost'
   */
  variant?: IconButtonVariant;
  /**
   * Size of the button padding and the icon inside
   * @default 'md'
   */
  size?: IconButtonSize;
  /**
   * Show a loading spinner instead of the icon and disable interaction
   * @default false
   */
  isLoading?: boolean;
  /**
   * Roundness of the button corners
   * @default 'full'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const variantClasses: Record<IconButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500 shadow-sm border border-transparent',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-transparent',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400 shadow-sm',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 focus-visible:ring-slate-400 border border-transparent',
  danger:
    'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 focus-visible:ring-rose-400 border border-transparent',
  success:
    'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 focus-visible:ring-emerald-400 border border-transparent',
  warning:
    'bg-amber-50 text-amber-700 hover:bg-amber-100 active:bg-amber-200 focus-visible:ring-amber-400 border border-transparent',
};

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
  xl: 'p-3',
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      children,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      rounded = 'full',
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isBtnDisabled = disabled || isLoading;

    // Helper to render icon and automatically inject standard sizing classes
    const renderIcon = () => {
      const activeIcon = icon || children;
      if (!activeIcon) return null;

      if (React.isValidElement(activeIcon)) {
        return React.cloneElement(activeIcon as React.ReactElement<any>, {
          className: cn(iconSizeClasses[size], (activeIcon.props as any).className),
        });
      }

      return activeIcon;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isBtnDisabled}
        className={cn(
          'inline-flex items-center justify-center cursor-pointer transition-colors duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          roundedClasses[rounded],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />
        ) : (
          renderIcon()
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
