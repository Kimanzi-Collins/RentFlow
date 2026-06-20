import React, { forwardRef, useMemo } from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name = '', src, size = 'md', ...props }, ref) => {
    const sizes = {
      xs: 'h-6 w-6 text-[0.625rem]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-xl',
    };

    const gradientClasses = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    ];

    const gradientClass = useMemo(() => {
      if (!name) return gradientClasses[0];
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return gradientClasses[hash % gradientClasses.length];
    }, [name]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizes[size],
          !src && `${gradientClass} items-center justify-center font-medium`,
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="aspect-square h-full w-full object-cover" />
        ) : (
          <span>{getInitials(name) || '?'}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
