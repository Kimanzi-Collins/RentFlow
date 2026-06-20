import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { LucideIcon } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available',
  emptyIcon,
  onRowClick,
  keyExtractor,
  className,
}: DataTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useGSAP(() => {
    if (!isLoading && data.length > 0 && tbodyRef.current) {
      const rows = tbodyRef.current.children;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [isLoading, data.length]);

  if (isLoading) {
    return (
      <div className={cn('w-full overflow-x-auto custom-scrollbar', className)}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={String(col.key) + i} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`}>
                {columns.map((col, colIdx) => (
                  <td key={`skeleton-col-${colIdx}`} style={{ textAlign: col.align || 'left' }}>
                    <Skeleton className="h-5 w-full max-w-[80%] rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('w-full border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)]', className)}>
        <EmptyState icon={emptyIcon} title="No Records" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('w-full overflow-x-auto custom-scrollbar', className)}>
      <table className="data-table mobile-card-layout">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={String(col.key) + i} style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col, i) => (
                <td
                  key={String(col.key) + i}
                  data-label={col.header}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render
                    ? col.render((row as any)[col.key], row)
                    : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
