import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const SIZE_MAP = {
  sm:  480,
  md:  560,
  lg:  720,
  xl:  960,
};

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, description,
  size = 'md', children, footer,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  /* ── Lock body scroll ──────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  /* ── GSAP entrance ─────────────────────────────────────────────────────── */
  useGSAP(() => {
    if (!isOpen || !backdropRef.current || !panelRef.current) return;
    gsap.fromTo(backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 24, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35,
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0.05 }
    );
  }, { dependencies: [isOpen] });

  if (!isOpen) return null;

  const maxW = SIZE_MAP[size];

  return createPortal(
    <div
      ref={backdropRef}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: maxW,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        {(title || description) && (
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              {title && (
                <h2 style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18,
                  color: '#e2eeff', letterSpacing: '-0.02em', margin: 0,
                }}>{title}</h2>
              )}
              {description && (
                <p style={{
                  fontSize: 13, color: 'rgba(226,238,255,0.5)',
                  marginTop: 4, fontFamily: 'var(--font-sans)',
                }}>{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginLeft: 12,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(226,238,255,0.5)',
                transition: 'background 0.15s, color 0.15s',
              }}
              type="button"
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(226,238,255,0.9)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(226,238,255,0.5)'; }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
