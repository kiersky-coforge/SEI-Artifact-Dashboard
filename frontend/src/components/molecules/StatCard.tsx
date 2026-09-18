import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  trend?: {
    direction: 'up' | 'down';
    label: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon,
  delta,
  deltaType = 'neutral',
  trend,
  onClick,
}) => {
  const subText = subtitle || description;

  const content = (
    <div
      onClick={onClick}
      className={`bg-surface rounded-level3 border border-surface-border shadow-level1 p-4 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-brand-navy/20 hover:shadow-level2' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
          {title}
        </p>
        {icon && (
          <div className="w-7 h-7 rounded-level1 bg-brand-navy/[0.04] dark:bg-white/[0.05] flex items-center justify-center text-brand-navy dark:text-brand-blue flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-black text-ink-primary tabular-nums font-mono">
          {value}
        </p>

        {(subText || delta || trend) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {delta && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  deltaType === 'positive'
                    ? 'bg-brand-green/10 text-brand-green'
                    : deltaType === 'negative'
                    ? 'bg-alert-coral/10 text-alert-coral'
                    : 'bg-brand-navy/5 text-ink-secondary'
                }`}
              >
                {delta}
              </span>
            )}

            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                  trend.direction === 'up' ? 'text-brand-green' : 'text-alert-coral'
                }`}
              >
                {trend.direction === 'up' ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend.label}
              </span>
            )}

            {subText && (
              <span className="text-[10px] font-medium text-ink-secondary truncate">
                {subText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return content;
};
