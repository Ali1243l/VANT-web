import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

/* ==========================================================================
   BUTTON COMPONENT
   ========================================================================== */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer rounded-lg';

    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-950 border border-indigo-500/30',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 shadow-sm',
      outline: 'bg-transparent hover:bg-slate-800/80 text-slate-200 border border-slate-700 hover:border-slate-600',
      ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-500/30',
      emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm border border-emerald-500/30',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-3.5 py-2 gap-2 h-9.5',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
      icon: 'h-9 w-9 p-0 aspect-square',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

/* ==========================================================================
   INPUT COMPONENT
   ========================================================================== */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, action, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-start">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-slate-900 border text-slate-100 text-sm rounded-lg transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              Icon ? 'ps-9.5' : 'ps-3.5'
            } ${action ? 'pe-10' : 'pe-3.5'} py-2 h-9.5 ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 hover:border-slate-700'
            } ${className}`}
            {...props}
          />
          {action && (
            <div className="absolute inset-y-0 end-0 pe-2.5 flex items-center">
              {action}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ==========================================================================
   STATUS BADGE COMPONENT (Clean & Minimal dot indicator)
   ========================================================================== */
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'draft' | 'archived' | 'outOfStock' | 'lowStock' | 'success' | 'warning' | 'danger';
  label: string;
  dotOnly?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, dotOnly = false }) => {
  const configs = {
    active: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    success: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    inactive: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
    draft: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    warning: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    archived: { bg: 'bg-slate-600/10 text-slate-400 border-slate-600/20', dot: 'bg-slate-500' },
    lowStock: { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400' },
    outOfStock: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
    danger: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
  };

  const current = configs[status] || configs.inactive;

  if (dotOnly) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
        <span className={`w-2 h-2 rounded-full ${current.dot}`} />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{label}</span>
    </span>
  );
};

/* ==========================================================================
   CARD COMPONENT
   ========================================================================== */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm ${
        hoverable ? 'hover:border-slate-700 hover:shadow-md transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* ==========================================================================
   SWITCH / TOGGLE
   ========================================================================== */
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, description, disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer transition-colors border border-slate-700/60 ${
            checked ? 'bg-indigo-600 border-indigo-500' : ''
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 absolute top-1 start-1 ${
              checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col text-start">
          {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
          {description && <span className="text-xs text-slate-400">{description}</span>}
        </div>
      )}
    </label>
  );
};

/* ==========================================================================
   MODAL COMPONENT
   ========================================================================== */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const widthClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl lg:max-w-3xl',
    xl: 'max-w-xl sm:max-w-3xl lg:max-w-4xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={`relative w-full ${
          widthClasses[maxWidth] || widthClasses.md
        } max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto`}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/90 shrink-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900">
          <div className="pe-4 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h3>
            {description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 overscroll-contain scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};
