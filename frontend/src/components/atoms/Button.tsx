import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coral' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantClasses = {
    primary:
      'bg-brand-navy hover:bg-brand-navy/90 text-white rounded-level3 shadow-level1 active:scale-[0.99]',
    coral:
      'bg-brand-coral hover:bg-brand-coral/90 text-white rounded-level3 shadow-level1 active:scale-[0.99]',
    secondary:
      'bg-white dark:bg-slate-800 text-brand-navy dark:text-white border border-brand-navy/15 dark:border-white/15 hover:bg-brand-navy/5 rounded-level3 active:scale-[0.99]',
    danger:
      'bg-alert-coral hover:bg-alert-coral/90 text-white rounded-level3 shadow-level1 active:scale-[0.99]',
    ghost:
      'text-brand-grey hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/5 rounded-level2',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-3 py-1.5 gap-1.5',
    md: 'text-xs px-5 py-2.5 gap-2',
    lg: 'text-xs px-6 py-3 gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
