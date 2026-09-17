import React from 'react';

interface HeaderBarProps {
  title: string;
  kicker?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  kicker,
  subtitle,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-surface rounded-level2 border border-surface-border shadow-sm">
      <div className="flex flex-col min-w-0">
        {kicker && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-action-primary dark:text-action-accent mb-1">
            {kicker}
          </span>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-ink-primary m-0 leading-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-ink-secondary mt-1 m-0">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};
