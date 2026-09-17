import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  delta,
  deltaType = 'neutral',
}) => {
  const deltaStyles = {
    positive: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    negative: 'bg-[#e06d53]/10 text-[#e06d53] border-[#e06d53]/20',
    neutral: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  };

  return (
    <div className="bg-surface border border-surface-border rounded-level2 p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-ink-secondary mt-0.5 truncate">
              {subtitle}
            </span>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-level1 bg-brand-navy/5 dark:bg-white/5 border border-brand-navy/10 dark:border-white/10 flex items-center justify-center text-brand-navy dark:text-action-primary shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 mt-1">
        <div className="text-2xl font-extrabold tracking-tight text-ink-primary font-mono leading-none">
          {value}
        </div>

        {delta && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${deltaStyles[deltaType]}`}
          >
            {deltaType === 'positive' && <TrendingUp className="w-3 h-3" />}
            {deltaType === 'negative' && <TrendingDown className="w-3 h-3" />}
            {deltaType === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{delta}</span>
          </div>
        )}
      </div>
    </div>
  );
};
