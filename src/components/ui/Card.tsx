import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'solid' | 'strong';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'none';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      accent = 'none',
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'glass',
      subtle: 'glass-subtle',
      solid: 'bg-[var(--color-surface)] border-[var(--color-border)]',
      strong: 'glass-strong',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    const accentStyles = {
      none: '',
      primary: 'border-l-4 border-l-[var(--color-accent)]',
      success: 'border-l-4 border-l-[var(--color-success)]',
      warning: 'border-l-4 border-l-[var(--color-warning)]',
      danger: 'border-l-4 border-l-[var(--color-danger)]',
      info: 'border-l-4 border-l-[var(--color-info)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-lg)] border',
          variants[variant],
          variant !== 'solid' ? 'glass-noise' : '',
          paddings[padding],
          hover ? 'card-hover' : '',
          accentStyles[accent],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
