import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

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
  const formattedValue = typeof value === 'number' && isCurrency 
    ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)
    : value;

  return (
    <Card className={cn(className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              ) : (
                <h3 className="text-2xl font-bold tracking-tight">
                  {formattedValue}
                </h3>
              )}
            </div>
            
            {(change !== undefined || changeLabel) && !isLoading && (
              <div className="flex items-center gap-1.5 mt-2">
                {change !== undefined && (
                  <span
                    className={cn(
                      'inline-flex items-center text-xs font-medium',
                      change > 0 ? 'text-green-600 dark:text-green-400' : change < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                    )}
                  >
                    {change > 0 ? <TrendingUp size={14} className="mr-1" /> : change < 0 ? <TrendingDown size={14} className="mr-1" /> : null}
                    {Math.abs(change)}%
                  </span>
                )}
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="p-2.5 rounded-full bg-primary/10 text-primary">
              <Icon size={20} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
