import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ArtifactStatus, ProjectStatus, UserStatus } from '../../../../shared/types';

type BadgeStatus = ArtifactStatus | ProjectStatus | UserStatus | 'error' | 'warning' | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  const statusStyles: Record<BadgeStatus, { badge: string; dot: string }> = {
    published: { badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
    active: { badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
    draft: { badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
    archived: { badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20', dot: 'bg-slate-400' },
    disabled: { badge: 'bg-[#e06d53]/10 text-[#e06d53] border-[#e06d53]/20', dot: 'bg-[#e06d53]' },
    error: { badge: 'bg-[#e06d53]/10 text-[#e06d53] border-[#e06d53]/20', dot: 'bg-[#e06d53]' },
    warning: { badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
    info: { badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
  };

  const style = statusStyles[status] || statusStyles.archived;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border leading-none transition-colors',
          style.badge,
          className
        )
      )}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {displayLabel}
    </span>
  );
};
