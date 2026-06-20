import React, { forwardRef } from 'react';
import { cn, getStatusVariant } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const variants = {
      success: 'bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]/20',
      warning: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
      danger: 'bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
      info: 'bg-[var(--color-info-muted)] text-[var(--color-info)] border-[var(--color-info)]/20',
      default: 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[0.625rem]',
      md: 'px-2.5 py-0.5 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium border rounded-[var(--radius-full)] whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn(`status-dot status-dot--${variant}`, 'mr-1.5')} />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, ...props }) => {
  const variant = getStatusVariant(status);
  const label = status.replace(/_/g, ' ');
  
  return (
    <Badge variant={variant} className={cn('capitalize', className)} {...props}>
      {label}
    </Badge>
  );
};
