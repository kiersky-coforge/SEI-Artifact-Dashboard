import React from 'react';
import type { Artifact } from '../../../../shared/types';

interface PipelineStageBadgesProps {
  artifact: Pick<Artifact, 'stage1Prompt' | 'stage2Prompt' | 'jsonSchema'>;
}

export const PipelineStageBadges: React.FC<PipelineStageBadgesProps> = ({ artifact }) => {
  return (
    <div className="flex items-center gap-1 font-mono text-[9px]">
      <span
        className={`px-1.5 py-0.5 rounded font-bold uppercase ${
          artifact.stage1Prompt ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-navy/[0.04] text-ink-secondary'
        }`}
        title="Stage 1 Extraction Prompt"
      >
        Stage 1
      </span>
      <span
        className={`px-1.5 py-0.5 rounded font-bold uppercase ${
          artifact.stage2Prompt ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-navy/[0.04] text-ink-secondary'
        }`}
        title="Stage 2 Refinement Prompt"
      >
        Stage 2
      </span>
      <span
        className={`px-1.5 py-0.5 rounded font-bold uppercase ${
          artifact.jsonSchema ? 'bg-brand-coral/10 text-brand-coral' : 'bg-brand-navy/[0.04] text-ink-secondary'
        }`}
        title="JSON Validation Schema"
      >
        Schema
      </span>
    </div>
  );
};
