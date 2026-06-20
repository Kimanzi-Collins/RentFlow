import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ToastProvider } from '@/components/ui/Toast';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Animate page content on route change
  useGSAP(
    () => {
      if (!mainRef.current) return;
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        }
      );
    },
    { dependencies: [location.pathname], scope: mainRef }
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      <Sidebar isOpen={mobileOpen} setIsOpen={setMobileOpen} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main
          ref={mainRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg-primary)',
            padding: '28px 32px',
            paddingBottom: 48,
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 35,
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <ToastProvider />
    </div>
  );
};

export default AppShell;
