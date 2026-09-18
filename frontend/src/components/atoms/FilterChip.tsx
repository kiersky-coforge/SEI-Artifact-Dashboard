import React from 'react';

interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active = false,
  onClick,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page ${
        active
          ? 'bg-brand-navy text-white shadow-level1'
          : 'bg-surface text-ink-secondary border border-input hover:border-brand-navy/30 hover:text-brand-navy dark:hover:text-white'
      } ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-brand-navy/[0.05] dark:bg-white/10 text-ink-secondary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
