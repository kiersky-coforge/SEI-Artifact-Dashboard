import React from 'react';
import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  count,
  icon,
  removable = false,
  onClick,
  onRemove,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border cursor-pointer select-none ${
        active
          ? 'bg-brand-navy dark:bg-action-primary text-white border-brand-navy dark:border-action-primary shadow-sm'
          : 'bg-surface text-ink-secondary border-surface-border hover:border-emphasis hover:text-ink-primary'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>

      {count !== undefined && count > 0 && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
            active
              ? 'bg-black/20 text-white'
              : 'bg-brand-navy/10 dark:bg-white/10 text-brand-navy dark:text-action-primary'
          }`}
        >
          {count}
        </span>
      )}

      {removable && (
        <span
          onClick={e => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:opacity-75 transition-opacity p-0.5"
          title="Remove filter"
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </button>
  );
};
