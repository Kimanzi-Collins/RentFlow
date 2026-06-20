import React, { useRef } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
  className?: string;
  isCurrency?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  isLoading = false,
  className,
  isCurrency = false,
}) => {
  const valueRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!isLoading && valueRef.current && typeof value === 'number') {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: () => {
          if (valueRef.current) {
            if (isCurrency) {
              valueRef.current.innerText = new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                maximumFractionDigits: 0,
              }).format(obj.val);
            } else {
              valueRef.current.innerText = Math.round(obj.val).toString();
            }
          }
        },
      });
    }
  }, [value, isLoading, isCurrency]);

  return (
    <Card
      padding="lg"
      className={cn('stat-card', `stat-card--${variant}`, className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-[var(--color-text-secondary)] mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-8 w-24 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
            ) : (
              <h3
                ref={valueRef}
                className={cn('text-3xl font-bold tracking-tight', isCurrency ? 'text-amount' : '')}
              >
                {typeof value === 'string' ? value : ''}
              </h3>
            )}
          </div>
          
          {(change !== undefined || changeLabel) && !isLoading && (
            <div className="flex items-center gap-1.5 mt-2">
              {change !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center text-xs font-medium',
                    change > 0 ? 'text-[var(--color-success)]' : change < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'
                  )}
                >
                  {change > 0 ? <TrendingUp size={14} className="mr-1" /> : change < 0 ? <TrendingDown size={14} className="mr-1" /> : null}
                  {Math.abs(change)}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-[var(--color-text-tertiary)]">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'p-3 rounded-[var(--radius-lg)]',
            `bg-[var(--color-${variant === 'default' ? 'accent' : variant}-muted)]`,
            `text-[var(--color-${variant === 'default' ? 'accent' : variant})]`
          )}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </Card>
  );
};
