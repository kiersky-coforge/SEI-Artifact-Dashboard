import React from 'react';

interface FilterChipProps {
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
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
        active
          ? 'bg-brand-navy text-white shadow-level1'
          : 'bg-white dark:bg-slate-800 text-brand-grey border border-brand-navy/10 dark:border-white/10 hover:border-brand-navy/30 hover:text-brand-navy dark:hover:text-white'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-brand-navy/[0.05] dark:bg-white/10 text-brand-grey'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
