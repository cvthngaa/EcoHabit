import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Sizing of the button padding and text size
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Optional icon to render before children (left aligned)
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon to render after children (right aligned)
   */
  rightIcon?: React.ReactNode;
  /**
   * Shows a loading spinner and disables interaction
   */
  isLoading?: boolean;
  /**
   * Expands the button to 100% width of parent container
   */
  fullWidth?: boolean;
  /**
   * Border radius corner variant
   * @default 'xl'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-500 border border-transparent shadow-sm',
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

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
  md: 'px-4 py-2.5 text-sm font-bold gap-2',
  lg: 'px-5 py-3 text-base font-bold gap-2.5',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = false,
      rounded = 'xl',
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isBtnDisabled = disabled || isLoading;

    const renderIcon = (icon: React.ReactNode) => {
      if (!icon) return null;
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement<any>, {
          className: cn(iconSizeClasses[size], (icon.props as any).className),
        });
      }
      return icon;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isBtnDisabled}
        className={cn(
          'inline-flex items-center justify-center cursor-pointer transition-colors duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all',
          fullWidth ? 'w-full' : '',
          variantClasses[variant],
          sizeClasses[size],
          roundedClasses[rounded],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />}
        {!isLoading && renderIcon(leftIcon)}
        {children}
        {!isLoading && renderIcon(rightIcon)}
      </button>
    );
  }
);

Button.displayName = 'Button';
