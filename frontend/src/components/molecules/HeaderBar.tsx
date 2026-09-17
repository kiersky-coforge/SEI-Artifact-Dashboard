import React from 'react';

interface HeaderBarProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  kicker,
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
        {kicker && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
            {kicker}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-brand-black dark:text-white leading-none font-display">
            {title}
          </h1>
          {badge}
        </div>
        {subText && (
          <p className="text-xs font-semibold text-brand-grey uppercase tracking-wide mt-1.5">
            {subText}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>}
    </div>
  );
};
