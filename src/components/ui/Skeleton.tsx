import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('skeleton', className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('glass-card p-5 space-y-4', className)}>
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-[var(--radius-full)]" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[60%] rounded" />
        <Skeleton className="h-3 w-[40%] rounded" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full">
    <div className="flex border-b border-[var(--color-border)] pb-4 mb-4">
      <Skeleton className="h-4 w-1/4 rounded mx-2" />
      <Skeleton className="h-4 w-1/4 rounded mx-2" />
      <Skeleton className="h-4 w-1/4 rounded mx-2" />
      <Skeleton className="h-4 w-1/4 rounded mx-2" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex py-3 border-b border-[var(--color-border)]/50">
        <Skeleton className="h-4 w-1/4 rounded mx-2 opacity-70" />
        <Skeleton className="h-4 w-1/4 rounded mx-2 opacity-70" />
        <Skeleton className="h-4 w-1/4 rounded mx-2 opacity-70" />
        <Skeleton className="h-4 w-1/4 rounded mx-2 opacity-70" />
      </div>
    ))}
  </div>
);
