import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/types';

// Toast Store
interface ToastStore {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Hook for components
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  
  return {
    toast: (props: Omit<ToastType, 'id'>) => addToast(props),
    success: (title: string, description?: string) => addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => addToast({ type: 'info', title, description }),
  };
};

// Toast Item Component
const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="text-[var(--color-success)]" size={20} />,
    error: <AlertCircle className="text-[var(--color-danger)]" size={20} />,
    warning: <AlertTriangle className="text-[var(--color-warning)]" size={20} />,
    info: <Info className="text-[var(--color-info)]" size={20} />,
  };

  return (
    <div
      className={cn(
        'glass pointer-events-auto w-full max-w-sm rounded-[var(--radius-lg)] p-4 shadow-lg flex items-start gap-3 transition-all duration-300',
        isLeaving ? 'opacity-0 translate-x-full' : 'animate-slide-left'
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{toast.title}</h4>
        {toast.description && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{toast.description}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 md:p-6 pointer-events-none max-w-full sm:max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
};
