import React, { forwardRef } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon: Icon, required, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-label text-[var(--color-text-secondary)]">
            {label} {required && <span className="text-[var(--color-danger)]">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'glass-input w-full h-10 px-3 py-2 text-sm',
              Icon && 'pl-10',
              error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-muted)]',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
        {hint && !error && <span className="text-xs text-[var(--color-text-tertiary)]">{hint}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-label text-[var(--color-text-secondary)]">
            {label} {required && <span className="text-[var(--color-danger)]">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'glass-input w-full px-3 py-2 text-sm min-h-[80px]',
            error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-muted)]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
        {hint && !error && <span className="text-xs text-[var(--color-text-tertiary)]">{hint}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, icon: Icon, required, options, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-label text-[var(--color-text-secondary)]">
            {label} {required && <span className="text-[var(--color-danger)]">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
              <Icon size={18} />
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'glass-input w-full h-10 px-3 py-2 text-sm appearance-none',
              Icon && 'pl-10',
              error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-muted)]',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
        {hint && !error && <span className="text-xs text-[var(--color-text-tertiary)]">{hint}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
