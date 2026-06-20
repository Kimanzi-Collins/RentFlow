import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  onBack,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-4 mb-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-xs text-[var(--color-text-tertiary)] font-medium">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="mx-1" />}
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-[var(--color-accent)] transition-colors"
                >
                  {item.label}
                </button>
              ) : item.href ? (
                <a href={item.href} className="hover:text-[var(--color-accent)] transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-[var(--color-text-secondary)]">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-[var(--radius-full)] bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-headline">{title}</h1>
            {description && <p className="text-body-sm mt-1">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
