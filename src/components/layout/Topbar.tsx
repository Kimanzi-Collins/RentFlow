import React from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/properties':    'Properties',
  '/units':         'Units',
  '/tenants':       'Tenants',
  '/payments':      'Payments',
  '/meter-readings':'Meter Readings',
  '/maintenance':   'Maintenance',
  '/settings':      'Settings',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k) && k !== '/');
  return key ? PAGE_TITLES[key] : 'RentFlow';
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { profile } = useAuthStore();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header
      style={{
        height: 60,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 12,
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden"
        style={{
          width: 36,
          height: 36,
          borderRadius: 0,
          background: 'var(--bg-primary)',
          border: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#6b7280',
          flexShrink: 0,
        }}
      >
        <Menu style={{ width: 18, height: 18 }} />
      </button>

      {/* Page title */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18,
          fontWeight: 600,
          color: '#111827',
          letterSpacing: '-0.01em',
          margin: 0,
          flexShrink: 0,
        }}
      >
        {title}
      </h1>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search — hidden on mobile */}
        <div
          className="hidden md:flex"
          style={{ position: 'relative', width: 200, alignItems: 'center' }}
        >
          <Search
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14,
              height: 14,
              color: '#9ca3af',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%',
              height: 36,
              paddingLeft: 32,
              paddingRight: 12,
              background: 'var(--bg-primary)',
              border: '1px solid #e5e3de',
              borderRadius: 0,
              color: '#111827',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = '#1c1c1c';
              (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(28,28,28,0.12)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = '#e5e3de';
              (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Notification bell */}
        <button
          type="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--bg-primary)',
            border: '1px solid rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            position: 'relative',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#eeede9';
            (e.currentTarget as HTMLButtonElement).style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#f5f4f1';
            (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
          }}
        >
          <Bell style={{ width: 16, height: 16 }} />
          {/* Red dot indicator */}
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 7,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#ef4444',
              border: '1.5px solid #ffffff',
            }}
          />
        </button>

        {/* User pill */}
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px 4px 4px',
            borderRadius: 999,
            background: 'var(--bg-primary)',
            border: '1px solid rgba(0,0,0,0.07)',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#eeede9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#f5f4f1';
          }}
        >
          {/* Avatar */}
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
              flexShrink: 0,
              fontFamily: 'var(--font-serif)',
            }}
          >
            {getInitials(profile?.full_name)}
          </div>
          {/* Name — hidden on mobile */}
          <span
            className="hidden md:block"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#111827',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
            }}
          >
            {profile?.full_name?.split(' ')[0] ?? 'User'}
          </span>
          <ChevronDown style={{ width: 14, height: 14, color: '#9ca3af' }} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
