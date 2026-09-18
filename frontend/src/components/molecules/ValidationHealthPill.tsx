import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const ValidationHealthPill: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
  </span>
);
