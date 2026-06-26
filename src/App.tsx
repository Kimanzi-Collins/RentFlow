import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Landing } from '@/pages/Landing';
import { SignIn } from '@/pages/SignIn';
import { Dashboard } from '@/pages/Dashboard';
import { Properties } from '@/pages/Properties';
import { PropertyDetail } from '@/pages/PropertyDetail';
import { Tenants } from '@/pages/Tenants';
import { TenantDetail } from '@/pages/TenantDetail';
import { Units } from '@/pages/Units';
import { Payments } from '@/pages/Payments';
import { WaterBilling } from '@/pages/WaterBilling';
import { Settings } from '@/pages/Settings';
import { Maintenance } from '@/pages/Maintenance';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';

import { usePropertyStore } from '@/stores/propertyStore';
import { useUnitStore } from '@/stores/unitStore';
import { useBillingStore } from '@/stores/billingStore';
import { useMaintenanceStore } from '@/stores/maintenanceStore';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  
  const { fetchProperties } = usePropertyStore();
  const { fetchUnits } = useUnitStore();
  const { fetchBillingData } = useBillingStore();
  const { fetchTickets } = useMaintenanceStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
      fetchUnits();
      fetchBillingData();
      fetchTickets();
    }
  }, [isAuthenticated, fetchProperties, fetchUnits, fetchBillingData, fetchTickets]);

  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;
  return <AppShell>{children}</AppShell>;
}

export function App() {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

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
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in" element={<SignIn />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/properties" element={<ProtectedLayout><Properties /></ProtectedLayout>} />
        <Route path="/properties/:id" element={<ProtectedLayout><PropertyDetail /></ProtectedLayout>} />
        <Route path="/units/*" element={<ProtectedLayout><Units /></ProtectedLayout>} />

        {/* Tenants — list + detail */}
        <Route path="/tenants" element={<ProtectedLayout><Tenants /></ProtectedLayout>} />
        <Route path="/tenants/:id" element={<ProtectedLayout><TenantDetail /></ProtectedLayout>} />

        {/* Payments — monthly rent tracking */}
        <Route path="/payments" element={<ProtectedLayout><Payments /></ProtectedLayout>} />

        {/* Water billing (was /utilities) */}
        <Route path="/water" element={<ProtectedLayout><WaterBilling /></ProtectedLayout>} />
        {/* Keep old route working */}
        <Route path="/utilities" element={<Navigate to="/water" replace />} />
        <Route path="/meter-readings" element={<Navigate to="/water" replace />} />

        <Route path="/maintenance" element={<ProtectedLayout><Maintenance /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
