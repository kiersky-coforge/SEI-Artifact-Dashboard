import React from 'react';

/**
 * The bold, wide-tracked, uppercase kicker used for section, stat, and table-header
 * labels app-wide (see DESIGN.md). Two tiers only:
 *   - `title` (10px / 0.1em) — the ubiquitous section/stat/table-header kicker.
 *   - `label` (9px / 0.05em) — the smallest tier: status tags and meta annotations.
 */

type MicroLabelTier = 'title' | 'label';

type MicroLabelTone = 'grey' | 'muted' | 'navy' | 'black' | 'coral' | 'green' | 'white' | 'inherit';

const TIER_CLASSES: Record<MicroLabelTier, string> = {
  title: 'text-[10px] tracking-widest',
  label: 'text-[9px] tracking-wider',
};

const TONE_CLASSES: Record<MicroLabelTone, string> = {
  grey: 'text-ink-secondary',
  muted: 'text-ink-muted',
  navy: 'text-brand-navy dark:text-brand-blue',
  black: 'text-ink-primary',
  coral: 'text-brand-coral',
  green: 'text-brand-green',
  white: 'text-white',
  inherit: '',
};

type MicroLabelElement = 'span' | 'div' | 'p' | 'label' | 'th' | 'h3' | 'h4' | 'button';

interface MicroLabelProps extends React.AllHTMLAttributes<HTMLElement> {
  tier?: MicroLabelTier;
  tone?: MicroLabelTone;
  as?: MicroLabelElement;
}

export const MicroLabel: React.FC<MicroLabelProps> = ({
  tier = 'title',
  tone = 'grey',
  as = 'span',
  className = '',
  children,
  ...rest
}) =>
  React.createElement(
    as,
    {
      className: `font-bold uppercase ${TIER_CLASSES[tier]} ${TONE_CLASSES[tone]} ${className}`.trim(),
      ...rest,
    },
    children
  );
