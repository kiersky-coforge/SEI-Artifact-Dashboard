import React from 'react';

/**
 * The standard surface container: bg-surface, a hairline border, a resting
 * shadow, and a radius that scales with the container's visual weight.
 */

type CardRadius = 'level3' | 'level4' | 'level5';
type CardElevation = 'level1' | 'level2' | 'none';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardElement = 'div' | 'article' | 'section' | 'li';
type CardTitleLevel = 'h2' | 'h3' | 'h4';

const RADIUS_CLASSES: Record<CardRadius, string> = {
  level3: 'rounded-level3',
  level4: 'rounded-level4',
  level5: 'rounded-level5',
};

const ELEVATION_CLASSES: Record<CardElevation, string> = {
  level1: 'shadow-level1',
  level2: 'shadow-level2',
  none: '',
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  radius?: CardRadius;
  elevation?: CardElevation;
  padding?: CardPadding;
  /** Clickable/hoverable cards deepen their hairline border; they never lift or escalate shadow. */
  interactive?: boolean;
  as?: CardElement;
  title?: React.ReactNode;
  titleAs?: CardTitleLevel;
  icon?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(({
  radius = 'level4',
  elevation = 'level1',
  padding = 'none',
  interactive = false,
  as = 'div',
  className = '',
  title,
  titleAs = 'h3',
  icon,
  children,
  ...rest
}, ref) =>
  React.createElement(
    as,
    {
      ref,
      className: [
        'bg-surface border border-surface-border',
        RADIUS_CLASSES[radius],
        ELEVATION_CLASSES[elevation],
        PADDING_CLASSES[padding],
        interactive ? 'hover:border-brand-navy/25 dark:hover:border-white/20 transition-all duration-200 ease-out active:scale-[0.995] cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      ...rest,
    },
    title
      ? [
          React.createElement(
            titleAs,
            { key: 'card-title', className: 'text-xs font-bold uppercase tracking-wider text-brand-navy dark:text-brand-blue border-b border-surface-border pb-3 flex items-center gap-2' },
            icon,
            title
          ),
          React.createElement(React.Fragment, { key: 'card-body' }, children),
        ]
      : children
  )
);
Card.displayName = 'Card';
