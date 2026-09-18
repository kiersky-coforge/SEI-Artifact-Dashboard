import React from 'react';

export type InputProps = React.ComponentPropsWithoutRef<'input'>;

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3.5 py-2 rounded-level2 bg-surface border border-input text-ink-primary text-xs font-medium focus:outline-none focus:ring-1 focus:ring-focus ${className}`}
      {...props}
    />
  );
};
