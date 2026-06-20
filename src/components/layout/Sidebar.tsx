import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Home, Users, CreditCard, Droplets, Settings, Wrench, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Properties', icon: Building2, path: '/properties' },
    { label: 'Units', icon: Home, path: '/units' },
    { label: 'Tenants', icon: Users, path: '/tenants' },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
    { label: 'Meter Readings', icon: Droplets, path: '/meter-readings' },
    { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-4 bg-background border-b z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-md text-muted-foreground hover:bg-muted"
        >
          <Menu size={24} />
        </button>
        <div className="ml-2 font-bold text-lg">RentFlow</div>
      </div>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-card border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b shrink-0 md:h-20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">RentFlow</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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

        <div className="p-4 border-t">
          <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-semibold">Premium Plan</h4>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} C. Kimanzi</p>
          </div>
        </div>
      </aside>
    </>
  );
};
