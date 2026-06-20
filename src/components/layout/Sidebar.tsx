import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  CreditCard,
  Settings,
  LogOut,
  Droplets,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/properties', icon: Building2, label: 'Properties' },
  { path: '/units', icon: Home, label: 'Units' },
  { path: '/tenants', icon: Users, label: 'Tenants' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/utilities', icon: Droplets, label: 'Utilities' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { signOut } = useAuthStore();
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!navRef.current) return;
      const links = navRef.current.querySelectorAll('a');
      gsap.fromTo(
        links,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: navRef }
  );

  return (
    <aside
      style={{
        width: 280,
        height: '100%',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a', // Ultra dark graphite
        color: '#ffffff',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', marginBottom: 48 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 style={{ width: 20, height: 20, color: '#0a0a0a' }} />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          RentFlow
        </span>
      </div>

      <nav ref={navRef} style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 16 }}>
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-[14px]
              ${isActive ? 'bg-[#ffffff] text-[#0a0a0a] shadow-lg shadow-white/10' : 'text-[#a3a3a3] hover:bg-[#171717] hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavLink
          to="/help"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-[14px] text-[#a3a3a3] hover:bg-[#171717] hover:text-white"
        >
          <HelpCircle size={18} strokeWidth={2} />
          Help Center
        </NavLink>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-[14px] text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#f87171] w-full text-left"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
