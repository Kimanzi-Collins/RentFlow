import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Building2, Users, Home, CreditCard,
  Settings, LogOut, Droplets, Wrench, HelpCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { path: '/properties',  icon: Building2,       label: 'Properties'  },
  { path: '/units',       icon: Home,            label: 'Units'        },
  { path: '/tenants',     icon: Users,           label: 'Tenants'      },
  { path: '/payments',    icon: CreditCard,      label: 'Payments'     },
  { path: '/maintenance', icon: Wrench,          label: 'Maintenance'  },
  { path: '/water',       icon: Droplets,        label: 'Water'        },
  { path: '/settings',    icon: Settings,        label: 'Settings'     },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, collapsed, onToggleCollapse }) => {
  const { signOut } = useAuthStore();
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!navRef.current) return;
      const links = navRef.current.querySelectorAll('a');
      gsap.fromTo(links,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: navRef }
  );

  const w = collapsed ? 68 : 264;

  return (
    <aside
      style={{
        width: w,
        height: '100%',
        padding: collapsed ? '24px 10px' : '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        color: '#ffffff',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        transition: 'width 0.32s cubic-bezier(0.16,1,0.3,1), padding 0.32s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '0 6px' : '0 8px',
        marginBottom: 40,
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
        }}>
          <Building2 style={{ width: 18, height: 18, color: '#0a0a0a' }} />
        </div>
        <div style={{
          overflow: 'hidden',
          maxWidth: collapsed ? 0 : 160,
          transition: 'max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.24s ease',
          opacity: collapsed ? 0 : 1,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            RentFlow
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Section label */}
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#525252',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 6,
          paddingLeft: collapsed ? 0 : 12,
          textAlign: collapsed ? 'center' : 'left',
          overflow: 'hidden',
          maxHeight: collapsed ? 0 : 20,
          opacity: collapsed ? 0 : 1,
          transition: 'max-height 0.28s ease, opacity 0.2s ease',
        }}>
          Main Menu
        </div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            onClick={() => setIsOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 8px' : '10px 12px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive ? '#ffffff' : 'transparent',
              color: isActive ? '#0a0a0a' : '#a3a3a3',
              boxShadow: isActive ? '0 2px 8px rgba(255,255,255,0.12)' : 'none',
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ flexShrink: 0, transition: 'color 0.15s' }}
                />
                <span style={{
                  overflow: 'hidden',
                  maxWidth: collapsed ? 0 : 160,
                  opacity: collapsed ? 0 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
                }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <NavLink
          to="/help"
          title="Help Center"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 8px' : '10px 12px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            color: '#a3a3a3',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#171717'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a3a3a3'; }}
        >
          <HelpCircle size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{
            overflow: 'hidden', maxWidth: collapsed ? 0 : 160,
            opacity: collapsed ? 0 : 1, whiteSpace: 'nowrap',
            transition: 'max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
          }}>Help Center</span>
        </NavLink>

        <button
          onClick={() => signOut()}
          title="Sign Out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 8px' : '10px 12px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{
            overflow: 'hidden', maxWidth: collapsed ? 0 : 160,
            opacity: collapsed ? 0 : 1, whiteSpace: 'nowrap',
            transition: 'max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
          }}>Sign Out</span>
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: collapsed ? 0 : 8,
            padding: '9px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#525252',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            width: '100%',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#525252'; }}
        >
          {collapsed
            ? <ChevronRight size={15} />
            : (
              <>
                <ChevronLeft size={15} />
                <span style={{
                  overflow: 'hidden', maxWidth: 80,
                  opacity: 1, whiteSpace: 'nowrap',
                }}>Collapse</span>
              </>
            )
          }
        </button>

        {/* Copyright — hidden when collapsed */}
        {!collapsed && (
          <p style={{
            marginTop: 10,
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 600,
            letterSpacing: '0.02em',
            lineHeight: 1.5,
          }}>
            © 2026 Collins Mwandikwa
          </p>
        )}
      </div>
    </aside>
  );
};
