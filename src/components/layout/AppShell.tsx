import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ToastProvider } from '@/components/ui/Toast';
import { useBillingStore } from '@/stores/billingStore';
import { usePropertyStore } from '@/stores/propertyStore';
import { useUnitStore } from '@/stores/unitStore';
import { useMaintenanceStore } from '@/stores/maintenanceStore';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const { fetchBillingData } = useBillingStore();
  const { fetchProperties }  = usePropertyStore();
  const { fetchUnits }       = useUnitStore();
  const { fetchTickets }     = useMaintenanceStore();

  // Load all live data once when the authenticated shell mounts
  useEffect(() => {
    Promise.all([
      fetchBillingData(),
      fetchProperties(),
      fetchUnits(),
      fetchTickets(),
    ]).catch(console.error);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useGSAP(
    () => {
      if (!mainRef.current) return;
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 14, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'opacity,transform' }
      );
    },
    { dependencies: [location.pathname], scope: mainRef }
  );

  // Animate mobile drawer in
  useGSAP(
    () => {
      if (!mobileOpen || !mobileDrawerRef.current) return;
      gsap.fromTo(mobileDrawerRef.current,
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
      );
    },
    { dependencies: [mobileOpen] }
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:block" style={{ flexShrink: 0 }}>
        <Sidebar
          isOpen={false}
          setIsOpen={() => {}}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />
      </div>

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: '12px 20px 20px 0', gap: 12 }}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main
          ref={mainRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.85)',
            borderRadius: 20,
            padding: '28px',
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto', height: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(10,10,10,0.5)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            ref={mobileDrawerRef}
            style={{
              position: 'relative',
              width: 264,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '20px 0 60px rgba(0,0,0,0.15)',
            }}
          >
            <Sidebar
              isOpen={mobileOpen}
              setIsOpen={setMobileOpen}
              collapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        </div>
      )}

      <ToastProvider />
    </div>
  );
};

export default AppShell;
