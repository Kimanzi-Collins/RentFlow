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
        { opacity: 0, scale: 0.98, y: 16 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
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
        background: 'var(--bg-app)',
        overflow: 'hidden',
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isOpen={false} setIsOpen={() => {}} />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          padding: '16px 24px 24px 0', // Padding around the main glass pane
          gap: 16
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main
          ref={mainRef}
          className="card-organic"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.8)',
            padding: '32px',
            margin: 0,
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto', height: '100%' }}>{children}</div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17, 24, 39, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Content */}
          <div
            style={{
              position: 'relative',
              width: 280,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(32px)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '24px 0 60px rgba(0,0,0,0.1)',
            }}
          >
            <Sidebar isOpen={mobileOpen} setIsOpen={setMobileOpen} />
          </div>
        </div>
      )}

      <ToastProvider />
    </div>
  );
};

export default AppShell;
