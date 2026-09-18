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
    published: 'bg-status-success/10 text-status-success-text border-status-success/25',
    active: 'bg-status-success/10 text-status-success-text border-status-success/25',
    draft: 'bg-status-warning/10 text-status-warning-text border-status-warning/25',
    pending: 'bg-status-warning/10 text-status-warning-text border-status-warning/25',
    archived: 'bg-status-neutral/10 text-status-neutral-text border-status-neutral/25',
    disabled: 'bg-status-error/10 text-status-error-text border-status-error/25',
  };

  const currentStyle = styles[status] || styles.archived;

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-widest rounded-full border ${currentStyle} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{displayLabel}</span>
    </span>
  );
};
