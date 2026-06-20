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
      xs: 'w-6 h-6 text-[0.625rem]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-xl',
    };

    const gradientClasses = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-emerald-500 to-teal-500',
      'from-rose-500 to-red-500',
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
          'relative inline-flex items-center justify-center rounded-[var(--radius-full)] overflow-hidden shrink-0 border border-[var(--color-border)]',
          sizes[size],
          !src && `bg-gradient-to-br ${gradientClass} text-white font-medium`,
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name) || '?'}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
