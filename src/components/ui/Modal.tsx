import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <Card
        className={cn('w-full flex flex-col max-h-[90vh] bg-background shadow-lg', sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b flex items-start justify-between shrink-0">
            <div>
              {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 z-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </Card>
    </div>,
    document.body
  );
};
