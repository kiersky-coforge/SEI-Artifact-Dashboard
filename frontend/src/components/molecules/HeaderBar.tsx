import React from 'react';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  description,
  actions,
  badge,
}) => {
  const subText = subtitle || description;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-ink-primary leading-none font-display">
            {title}
          </h1>
          {badge}
        </div>
        {subText && (
          <p className="text-xs font-medium text-ink-secondary mt-1.5 max-w-2xl">
            {subText}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>}
    </div>
  );
};
