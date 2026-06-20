import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 sm:pb-0', className)}>
      <div className="flex bg-[rgba(255,255,255,0.03)] p-1 rounded-[var(--radius-full)] border border-[var(--color-border)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-[var(--radius-full)] transition-all duration-300',
                isActive
                  ? 'text-white bg-[var(--color-surface-3)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.02)]'
              )}
            >
              {Icon && <Icon size={16} className={cn('mr-2', isActive ? 'text-[var(--color-accent)]' : '')} />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 px-1.5 py-0.5 text-[0.625rem] rounded-[var(--radius-full)]',
                    isActive
                      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                      : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
