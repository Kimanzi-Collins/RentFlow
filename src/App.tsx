import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { SignIn } from '@/pages/SignIn';
import { Dashboard } from '@/pages/Dashboard';
import { Properties } from '@/pages/Properties';
import { Tenants } from '@/pages/Tenants';
import { Units } from '@/pages/Units';
import { Payments } from '@/pages/Payments';
import { MeterReadings } from '@/pages/MeterReadings';
import { Settings } from '@/pages/Settings';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

export function App() {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mb-4" />
        <p className="text-[var(--color-text-secondary)] font-medium tracking-wide text-sm">INITIALIZING...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/sign-in" element={<SignIn />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/properties/*"
          element={
            <ProtectedLayout>
              <Properties />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/units/*"
          element={
            <ProtectedLayout>
              <Units />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/tenants/*"
          element={
            <ProtectedLayout>
              <Tenants />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/meter-readings"
          element={
            <ProtectedLayout>
              <MeterReadings />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/payments"
          element={
            <ProtectedLayout>
              <Payments />
            </ProtectedLayout>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedLayout>
              <div className="text-center py-20 animate-fade-up">
                <h2 className="text-headline mb-2">Maintenance</h2>
                <p className="text-body-sm text-[var(--color-text-secondary)]">Coming soon.</p>
              </div>
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
