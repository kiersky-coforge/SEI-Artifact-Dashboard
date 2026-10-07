import React from 'react';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  /** Rendered on its own line between the title row and the description (e.g. version + status). */
  meta?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  description,
  actions,
  badge,
  meta,
}) => {
  const subText = subtitle || description;

  return (
    <div className="space-y-1.5 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-ink-primary leading-none font-display">
            {title}
          </h1>
          {badge}
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>}
      </div>
      {meta && <div className="pt-1">{meta}</div>}
      {subText && (
        <p className="text-xs font-medium text-ink-secondary max-w-2xl">
          {subText}
        </p>
      )}
    </div>
  );
};
