import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Landing } from '@/pages/Landing';
import { SignIn } from '@/pages/SignIn';
import { Dashboard } from '@/pages/Dashboard';
import { Properties } from '@/pages/Properties';
import { Tenants } from '@/pages/Tenants';
import { Units } from '@/pages/Units';
import { Payments } from '@/pages/Payments';
import { MeterReadings } from '@/pages/MeterReadings';
import { Settings } from '@/pages/Settings';
import { Maintenance } from '@/pages/Maintenance';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';

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
      <div className="app-loader">
        <div className="app-loader__ring" />
        <p className="app-loader__label">Initializing…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

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
              <Maintenance />
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

        {/* Catch-all → Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
