import React from 'react';
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
  
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-muted/50">
            <tr>
              {columns.map((col, i) => (
                <th key={String(col.key) + i} className="h-12 px-4 text-muted-foreground font-medium" style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="border-b">
                {columns.map((col, colIdx) => (
                  <td key={`skeleton-col-${colIdx}`} className="p-4" style={{ textAlign: col.align || 'left' }}>
                    <Skeleton className="h-4 w-full max-w-[80%]" />
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
      <div className={cn('rounded-md border bg-card p-8', className)}>
        <EmptyState icon={emptyIcon} title="No Records" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border overflow-x-auto", className)}>
      <table className="w-full text-sm text-left">
        <thead className="border-b bg-muted/50">
          <tr>
            {columns.map((col, i) => (
              <th key={String(col.key) + i} className="h-12 px-4 text-muted-foreground font-medium align-middle" style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b transition-colors hover:bg-muted/50",
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col, i) => (
                <td
                  key={String(col.key) + i}
                  className="p-4 align-middle"
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
