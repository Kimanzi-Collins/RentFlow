import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { SignIn } from '@/pages/SignIn';
import { Dashboard } from '@/pages/Dashboard';
import { Properties, PropertyDetail } from '@/pages/Properties';
import { Tenants, TenantDetail } from '@/pages/Tenants';
import { Units, UnitDetail } from '@/pages/Units';
import { Payments } from '@/pages/Payments';
import { MeterReadings } from '@/pages/MeterReadings';
import { Settings } from '@/pages/Settings';

// ═══════════════════════════════════════════════════════════════════════════
// RENTFLOW - Property Management Platform for Kenya
// Premium SaaS UI with iOS 18 Liquid Glass Design
// ═══════════════════════════════════════════════════════════════════════════

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // In production, this would check Clerk authentication
  const isAuthenticated = localStorage.getItem('rentflow-auth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

export function App() {
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
          path="/properties"
          element={
            <ProtectedLayout>
              <Properties />
            </ProtectedLayout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <ProtectedLayout>
              <PropertyDetail />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/units"
          element={
            <ProtectedLayout>
              <Units />
            </ProtectedLayout>
          }
        />
        <Route
          path="/units/:id"
          element={
            <ProtectedLayout>
              <UnitDetail />
            </ProtectedLayout>
          }
        />
        
        <Route
          path="/tenants"
          element={
            <ProtectedLayout>
              <Tenants />
            </ProtectedLayout>
          }
        />
        <Route
          path="/tenants/:id"
          element={
            <ProtectedLayout>
              <TenantDetail />
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
