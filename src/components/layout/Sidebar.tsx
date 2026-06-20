import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Home, Users, CreditCard, Droplets, Settings, Wrench, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Properties', icon: Building2, path: '/properties' },
    { label: 'Units', icon: Home, path: '/units' },
    { label: 'Tenants', icon: Users, path: '/tenants' },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
    { label: 'Meter Readings', icon: Droplets, path: '/meter-readings' },
    { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  ];

  // Animate the active pill indicator
  useGSAP(() => {
    if (navRef.current && pillRef.current) {
      const activeLink = navRef.current.querySelector('.nav-link.active') as HTMLElement;
      if (activeLink) {
        const top = activeLink.offsetTop;
        gsap.to(pillRef.current, {
          y: top,
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header (visible only on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-4 bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--color-border)] z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-md text-[var(--color-text-secondary)] hover:text-white"
        >
          <Menu size={24} />
        </button>
        <div className="ml-2 font-display font-bold text-lg text-white">RentFlow</div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[260px] flex flex-col bg-[rgba(15,18,25,0.85)] backdrop-blur-xl border-r border-[var(--color-border)] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-[var(--color-border)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)]">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">RentFlow</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto py-6 px-3 relative">
          <div
            ref={pillRef}
            className="absolute left-0 w-1 h-10 bg-[var(--color-accent)] rounded-r-full shadow-[0_0_10px_var(--color-accent)]"
            style={{ transform: 'translateY(-100px)' }} // Initial hide
          />
          
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'nav-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'active bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-[var(--color-border)]/50">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'nav-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'active bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]'
                    )
                  }
                >
                  <Settings size={18} />
                  Settings
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]/50">
          <div className="glass p-4 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Premium Plan</h4>
            <p className="text-[0.65rem] text-[var(--color-text-tertiary)]">© {new Date().getFullYear()} Collins Kimanzi Mwandikwa</p>
          </div>
        </div>
      </aside>
    </>
  );
};
