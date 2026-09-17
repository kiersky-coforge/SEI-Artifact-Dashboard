import React from 'react';
import type { ArtifactStatus } from '../../../../shared/types';

interface StatusBadgeProps {
  status: ArtifactStatus | 'active' | 'disabled' | 'archived' | 'pending';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
}) => {
  const displayLabel = label || status;

  const styles: Record<string, string> = {
    published:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    active:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    draft:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    pending:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    archived:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
    disabled:
      'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
  };

  const currentStyle = styles[status] || styles.archived;

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-widest rounded-full border ${currentStyle} ${
        size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{displayLabel}</span>
    </span>
  );
};
