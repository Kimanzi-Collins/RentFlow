import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
      success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, ...props }) => {
  let variant: BadgeProps['variant'] = 'default';
  const s = status.toLowerCase();
  
  if (['active', 'completed', 'paid', 'resolved', 'occupied', 'success'].includes(s)) variant = 'success';
  else if (['pending', 'vacant', 'maintenance', 'partial', 'warning'].includes(s)) variant = 'warning';
  else if (['overdue', 'failed', 'evicted', 'terminated', 'cancelled', 'reversed', 'danger'].includes(s)) variant = 'destructive';
  else if (['in_progress', 'reserved', 'draft', 'sent', 'open', 'info'].includes(s)) variant = 'info';
  else variant = 'secondary';

  const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  );
};

export { Badge };
