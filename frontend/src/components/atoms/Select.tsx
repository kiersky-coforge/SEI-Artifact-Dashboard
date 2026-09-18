import React from 'react';

export interface SelectProps extends React.ComponentPropsWithoutRef<'select'> {
  variant?: 'field' | 'pill';
}

export const Select: React.FC<SelectProps> = ({ variant = 'field', className = '', ...props }) => {
  const variantClasses =
    variant === 'pill'
      ? 'px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider'
      : 'px-3.5 py-2 rounded-level2 font-medium';

  return (
    <select
      className={`w-full bg-surface border border-input text-ink-primary text-xs focus:outline-none focus:ring-1 focus:ring-focus ${variantClasses} ${className}`}
      {...props}
    />
  );
};
