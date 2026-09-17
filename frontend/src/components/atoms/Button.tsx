import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1 rounded-level1 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-brand-navy dark:bg-action-primary text-white hover:bg-brand-navy-light dark:hover:bg-action-primary-hover shadow-sm',
    secondary: 'bg-brand-coral text-white hover:opacity-90 shadow-sm',
    outline: 'border border-surface-border bg-surface text-ink-primary hover:bg-surface-hover hover:border-emphasis',
    ghost: 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover',
    danger: 'bg-status-error text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-xs px-4 py-2 gap-2 h-9',
    lg: 'text-sm px-5 py-2.5 gap-2.5 h-10',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
