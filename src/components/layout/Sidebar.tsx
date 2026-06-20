import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  CreditCard,
  Droplets,
  Settings,
  Wrench,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const navItems = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Properties',    icon: Building2,       path: '/properties' },
  { label: 'Units',         icon: Home,            path: '/units' },
  { label: 'Tenants',       icon: Users,           path: '/tenants' },
  { label: 'Payments',      icon: CreditCard,      path: '/payments' },
  { label: 'Meter Readings',icon: Droplets,        path: '/meter-readings' },
  { label: 'Maintenance',   icon: Wrench,          path: '/maintenance' },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ── Desktop icon-only sidebar (always 64px) ───────────────────────────────
const DesktopSidebar: React.FC<{ profile: { full_name?: string | null; role?: string | null } | null; onSignOut: () => void }> = ({
  profile,
  onSignOut,
}) => {
  return (
    <div
      style={{
        width: 64,
        minWidth: 64,
        height: '100vh',
        background: '#111827',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 40,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 0,
            background: 'linear-gradient(135deg, #1c1c1c, #00b87c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Building2 style={{ width: 18, height: 18, color: '#fff' }} strokeWidth={2} />
        </div>
      </div>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16,
          paddingBottom: 16,
          gap: 4,
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            style={({ isActive }) => ({
              width: 40,
              height: 40,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              textDecoration: 'none',
              color: isActive ? '#1c1c1c' : 'rgba(255,255,255,0.35)',
              background: isActive ? 'rgba(28,28,28,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid #1c1c1c' : '3px solid transparent',
              transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
              flexShrink: 0,
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (!el.dataset.active) {
                el.style.background = 'rgba(255,255,255,0.07)';
                el.style.color = 'rgba(255,255,255,0.75)';
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (!el.dataset.active) {
                el.style.background = '';
                el.style.color = '';
              }
            }}
          >
            {({ isActive }) => (
              <item.icon
                style={{
                  width: 20,
                  height: 20,
                  color: isActive ? '#1c1c1c' : undefined,
                  flexShrink: 0,
                }}
                strokeWidth={1.75}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 12,
          paddingBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          width: '100%',
        }}
      >
        {/* Settings */}
        <NavLink
          to="/settings"
          title="Settings"
          style={({ isActive }) => ({
            width: 40,
            height: 40,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            color: isActive ? '#1c1c1c' : 'rgba(255,255,255,0.35)',
            background: isActive ? 'rgba(28,28,28,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid #1c1c1c' : '3px solid transparent',
            transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
          })}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = 'rgba(255,255,255,0.07)';
            el.style.color = 'rgba(255,255,255,0.75)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = '';
            el.style.color = '';
          }}
        >
          {({ isActive }) => (
            <Settings
              style={{ width: 20, height: 20, color: isActive ? '#1c1c1c' : undefined }}
              strokeWidth={1.75}
            />
          )}
        </NavLink>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          title="Sign out"
          style={{
            width: 40,
            height: 40,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.25)',
            background: 'transparent',
            border: 'none',
            transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,107,0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <LogOut style={{ width: 18, height: 18 }} strokeWidth={1.75} />
        </button>

        {/* User avatar */}
        <div
          title={profile?.full_name ?? 'User'}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1c1c1c, #00b87c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            flexShrink: 0,
            cursor: 'default',
          }}
        >
          {getInitials(profile?.full_name)}
        </div>
      </div>
    </div>
  );
};

// ── Mobile full-width drawer ──────────────────────────────────────────────
const MobileDrawer: React.FC<{
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  profile: { full_name?: string | null; role?: string | null } | null;
  onSignOut: () => void;
}> = ({ isOpen, setIsOpen, profile, onSignOut }) => {
  const getLinkStyle = (isActive: boolean): React.CSSProperties => ({
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 14px',
    borderRadius: 0,
    cursor: 'pointer',
    textDecoration: 'none',
    color: isActive ? '#1c1c1c' : 'rgba(226,238,255,0.55)',
    background: isActive ? 'rgba(28,28,28,0.1)' : 'transparent',
    borderLeft: isActive ? '3px solid #1c1c1c' : '3px solid transparent',
    transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
    whiteSpace: 'nowrap',
    width: '100%',
  });

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 240,
        height: '100vh',
        background: '#111827',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        zIndex: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo + close */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 0,
              background: 'linear-gradient(135deg, #1c1c1c, #00b87c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 style={{ width: 18, height: 18, color: '#fff' }} strokeWidth={2} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 20,
              color: '#e2eeff',
              letterSpacing: '-0.02em',
            }}
          >
            RentFlow
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(226,238,255,0.6)',
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            style={({ isActive }) => getLinkStyle(isActive)}
          >
            <item.icon style={{ width: 20, height: 20, flexShrink: 0 }} strokeWidth={1.75} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <NavLink
          to="/settings"
          onClick={() => setIsOpen(false)}
          style={({ isActive }) => getLinkStyle(isActive)}
        >
          <Settings style={{ width: 20, height: 20, flexShrink: 0 }} strokeWidth={1.75} />
          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Settings</span>
        </NavLink>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1c1c1c, #00b87c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              flexShrink: 0,
            }}
          >
            {getInitials(profile?.full_name)}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#e2eeff',
                fontFamily: 'var(--font-sans)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile?.full_name ?? 'User'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(226,238,255,0.4)',
                fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
              }}
            >
              {profile?.role ?? 'landlord'}
            </div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 14px',
            borderRadius: 0,
            cursor: 'pointer',
            color: 'rgba(226,238,255,0.45)',
            background: 'transparent',
            border: 'none',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,107,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(226,238,255,0.45)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} strokeWidth={1.75} />
          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Sign out</span>
        </button>
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <>
      {/* Desktop: always-visible 64px icon sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar profile={profile} onSignOut={handleSignOut} />
      </div>

      {/* Mobile: slide-in full-width drawer */}
      <div className="md:hidden">
        <MobileDrawer
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          profile={profile}
          onSignOut={handleSignOut}
        />
      </div>
    </>
  );
};

export default Sidebar;
