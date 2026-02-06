import React, { forwardRef, useEffect, useRef } from 'react';
import { cn, getInitials, getStatusVariant } from '@/lib/utils';
import { animateCardsIn, animateProgressBar } from '@/lib/animations';
import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  FileText,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD
// ═══════════════════════════════════════════════════════════════════════════

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'solid';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantClasses = {
      default: 'glass glass-inner-highlight',
      subtle: 'glass-subtle',
      solid: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-xl)]',
          variantClasses[variant],
          paddingClasses[padding],
          hover && 'card-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════════════════════════════════

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon: Icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] shadow-sm hover:shadow-md',
      secondary:
        'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-glass)] hover:border-[var(--color-border-strong)]',
      ghost:
        'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-glass)] hover:text-[var(--color-text-primary)]',
      danger:
        'bg-[var(--color-danger)] text-white hover:bg-red-600 shadow-sm hover:shadow-md',
      success:
        'bg-[var(--color-success)] text-white hover:bg-green-600 shadow-sm hover:shadow-md',
    };

    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]',
          'transition-all duration-[var(--duration-fast)]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ═══════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-1',
    };

    const variantClasses = {
      default: 'bg-[var(--color-border)] text-[var(--color-text-secondary)]',
      success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
      danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
      info: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
    };

    const dotColors = {
      default: 'bg-[var(--color-text-muted)]',
      success: 'bg-[var(--color-success)]',
      warning: 'bg-[var(--color-warning)]',
      danger: 'bg-[var(--color-danger)]',
      info: 'bg-[var(--color-accent)]',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)]',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

/**
 * Status badge with automatic variant detection
 */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = getStatusVariant(status);
  return (
    <Badge variant={variant} dot className={className}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════════════════════

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon: Icon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 rounded-[var(--radius-md)]',
              'bg-[var(--color-surface)] border border-[var(--color-border)]',
              'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
              'transition-all duration-[var(--duration-fast)]',
              'hover:border-[var(--color-border-strong)]',
              'focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)]',
              Icon && 'pl-10',
              error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-light)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ═══════════════════════════════════════════════════════════════════════════
// TEXTAREA
// ═══════════════════════════════════════════════════════════════════════════

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[100px] px-3 py-2.5 rounded-[var(--radius-md)]',
            'bg-[var(--color-surface)] border border-[var(--color-border)]',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
            'transition-all duration-[var(--duration-fast)]',
            'hover:border-[var(--color-border-strong)]',
            'focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)]',
            'resize-y',
            error && 'border-[var(--color-danger)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ═══════════════════════════════════════════════════════════════════════════
// SELECT
// ═══════════════════════════════════════════════════════════════════════════

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 px-3 pr-10 rounded-[var(--radius-md)] appearance-none',
              'bg-[var(--color-surface)] border border-[var(--color-border)]',
              'text-[var(--color-text-primary)]',
              'transition-all duration-[var(--duration-fast)]',
              'hover:border-[var(--color-border-strong)]',
              'focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)]',
              error && 'border-[var(--color-danger)]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH INPUT
// ═══════════════════════════════════════════════════════════════════════════

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          ref={ref}
          value={value}
          className={cn(
            'w-full h-10 pl-10 pr-10 rounded-[var(--radius-md)]',
            'bg-[var(--color-glass)] border border-[var(--color-glass-border)]',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
            'transition-all duration-[var(--duration-fast)]',
            'hover:bg-[var(--color-glass-hover)]',
            'focus:outline-none focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)]',
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════════════════════════════════════

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-gradient-to-br from-[var(--color-accent)] to-blue-600',
          'text-white font-medium',
          'overflow-hidden flex-shrink-0',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

// ═══════════════════════════════════════════════════════════════════════════
// PAGE HEADER
// ═══════════════════════════════════════════════════════════════════════════

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-3">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} />}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[var(--color-text-primary)]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-headline text-[var(--color-text-primary)]">{title}</h1>
          {description && (
            <p className="mt-1 text-[var(--color-text-secondary)]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

// Icon mapping for empty states
export const emptyStateIcons: Record<string, LucideIcon> = {
  properties: Building2,
  tenants: Users,
  invoices: FileText,
  payments: CreditCard,
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const DefaultIcon = Icon || Building2;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-glass)] flex items-center justify-center mb-4">
        <DefaultIcon size={28} className="text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-title text-[var(--color-text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded-[var(--radius-sm)]',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]',
  };

  return (
    <div
      className={cn('skeleton', variantClasses[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════════════

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--color-glass)] border border-[var(--color-glass-border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-[var(--duration-fast)]',
            activeTab === tab.id
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 px-1.5 py-0.5 text-xs rounded-[var(--radius-full)]',
                activeTab === tab.id
                  ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                  : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA TABLE
// ═══════════════════════════════════════════════════════════════════════════

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  loading = false,
  emptyState,
}: DataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!loading && data.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tbody tr');
      animateCardsIn(rows, { stagger: 0.03 });
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={56} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState || null;
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table ref={tableRef} className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={String(item[keyField])}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; label: string };
  icon?: LucideIcon;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, change, icon: Icon, variant = 'default' }: StatCardProps) {
  const iconColors = {
    default: 'text-[var(--color-text-muted)] bg-[var(--color-glass)]',
    accent: 'text-[var(--color-accent)] bg-[var(--color-accent-light)]',
    success: 'text-[var(--color-success)] bg-[var(--color-success-light)]',
    warning: 'text-[var(--color-warning)] bg-[var(--color-warning-light)]',
    danger: 'text-[var(--color-danger)] bg-[var(--color-danger-light)]',
  };

  return (
    <GlassCard className="flex items-start justify-between">
      <div>
        <p className="text-caption text-[var(--color-text-muted)] mb-1">{title}</p>
        <p className="text-headline text-[var(--color-text-primary)]">{value}</p>
        {change && (
          <p
            className={cn(
              'text-caption mt-2 flex items-center gap-1',
              change.value >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
            )}
          >
            {change.value >= 0 ? '+' : ''}
            {change.value}%
            <span className="text-[var(--color-text-muted)]">{change.label}</span>
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center', iconColors[variant])}>
          <Icon size={20} />
        </div>
      )}
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    animateProgressBar(barRef.current, percentage);
  }, [percentage]);

  const barColors = {
    default: 'bg-[var(--color-accent)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-[var(--color-text-secondary)]">{label}</span>}
          {showValue && (
            <span className="text-[var(--color-text-primary)] font-medium">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-[var(--radius-full)] bg-[var(--color-border)]', heights[size])}>
        <div
          ref={barRef}
          className={cn('h-full rounded-[var(--radius-full)] transition-all', barColors[variant])}
          style={{ width: 0 }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div
        className={cn(
          'relative w-full glass glass-inner-highlight rounded-[var(--radius-xl)] animate-scale-in',
          sizeClasses[size]
        )}
      >
        <div className="flex items-start justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-title text-[var(--color-text-primary)]">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT / TOAST
// ═══════════════════════════════════════════════════════════════════════════

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    danger: XCircle,
  };

  const colors = {
    info: 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border-[var(--color-accent)]',
    success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger)]',
  };

  const Icon = icons[variant];

  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border', colors[variant])}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onPageChange(page)}
          className="w-9"
        >
          {page}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKBOX
// ═══════════════════════════════════════════════════════════════════════════

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'peer w-4 h-4 rounded border border-[var(--color-border-strong)]',
              'bg-[var(--color-surface)] checked:bg-[var(--color-accent)] checked:border-[var(--color-accent)]',
              'focus:ring-2 focus:ring-[var(--color-accent-light)] focus:ring-offset-0',
              'transition-all duration-[var(--duration-fast)]',
              'appearance-none cursor-pointer',
              className
            )}
            {...props}
          />
          <Check
            size={12}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-[var(--color-text-primary)] cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ═══════════════════════════════════════════════════════════════════════════
// DROPDOWN MENU
// ═══════════════════════════════════════════════════════════════════════════

interface DropdownItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function DropdownMenu({ trigger, items, align = 'right' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 py-1 min-w-[160px] rounded-[var(--radius-lg)]',
            'glass glass-inner-highlight animate-fade-up',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                'hover:bg-[var(--color-glass-hover)] transition-colors',
                item.variant === 'danger'
                  ? 'text-[var(--color-danger)]'
                  : 'text-[var(--color-text-primary)]'
              )}
            >
              {item.icon && <item.icon size={16} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
