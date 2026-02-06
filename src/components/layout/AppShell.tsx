import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, SearchInput, DropdownMenu } from '@/components/ui';
import { animateSidebarPill, animatePageEnter } from '@/lib/animations';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  Droplets,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  X,
  type LucideIcon,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND IMAGES/VIDEOS PER PAGE
// ═══════════════════════════════════════════════════════════════════════════

// High-quality Unsplash images that match each page theme
const pageBackgrounds: Record<string, { type: 'image' | 'video'; src: string }> = {
  '/dashboard': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2020/08/12/46965-449623750_large.mp4',
  },
  '/properties': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2019/06/06/24235-341040953_large.mp4',
  },
  '/units': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2021/03/18/68040-527035127_large.mp4',
  },
  '/tenants': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2016/09/21/5373-183629300_large.mp4',
  },
  '/meter-readings': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2020/05/25/40139-424930032_large.mp4',
  },
  '/payments': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2020/02/18/32376-393127612_large.mp4',
  },
  '/settings': {
    type: 'video',
    src: 'https://cdn.pixabay.com/video/2020/08/24/48820-453411946_large.mp4',
  },
};

const defaultBackground = {
  type: 'video' as const,
  src: 'https://cdn.pixabay.com/video/2020/08/12/46965-449623750_large.mp4',
};

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC BACKGROUND COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

type BackgroundConfig = { type: 'image' | 'video'; src: string };

interface DynamicBackgroundProps {
  pathname: string;
}

function DynamicBackground({ pathname }: DynamicBackgroundProps) {
  const [currentBg, setCurrentBg] = useState<BackgroundConfig>(defaultBackground);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Find matching background based on pathname prefix
    const matchedKey = Object.keys(pageBackgrounds).find((key) =>
      pathname.startsWith(key)
    );
    const newBg: BackgroundConfig = matchedKey ? pageBackgrounds[matchedKey] : defaultBackground;

    if (newBg.src !== currentBg.src) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBg(newBg);
        setIsTransitioning(false);
      }, 300);
    }
  }, [pathname, currentBg.src]);

  return (
    <div
      className={cn(
        'page-background',
        isTransitioning && 'opacity-0'
      )}
    >
      {currentBg.type === 'video' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={currentBg.src}
        />
      ) : (
        <img
          src={currentBg.src}
          alt=""
          loading="eager"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════════════════════

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'properties', label: 'Properties', href: '/properties', icon: Building2 },
  { id: 'units', label: 'Units', href: '/units', icon: Home },
  { id: 'tenants', label: 'Tenants', href: '/tenants', icon: Users },
  { id: 'meter', label: 'Meter Readings', href: '/meter-readings', icon: Droplets },
  { id: 'payments', label: 'Payments', href: '/payments', icon: CreditCard },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const pillRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Animate sidebar pill position
  useEffect(() => {
    const activeItem = mainNavItems.find((item) => location.pathname.startsWith(item.href));
    if (activeItem && pillRef.current) {
      const activeEl = navRefs.current.get(activeItem.id);
      if (activeEl) {
        const pillY = activeEl.offsetTop;
        animateSidebarPill(pillRef.current, pillY);
      }
    }
  }, [location.pathname]);

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        to={item.href}
        ref={(el) => {
          if (el) navRefs.current.set(item.id, el);
        }}
        onClick={onMobileClose}
        className={cn(
          'relative flex items-center gap-3 h-11 px-3 rounded-[var(--radius-md)]',
          'transition-all duration-[var(--duration-fast)]',
          isActive
            ? 'text-[var(--color-accent)] bg-[var(--color-accent-light)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass)]'
        )}
      >
        <Icon size={20} className="flex-shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium truncate">{item.label}</span>
        )}
        {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-[var(--radius-full)] bg-[var(--color-danger)] text-white">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
              RentFlow
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">Property Management</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="relative">
          {/* Active indicator pill */}
          <div
            ref={pillRef}
            className="absolute left-0 w-1 h-11 rounded-[var(--radius-full)] bg-[var(--color-accent)] opacity-0"
            style={{ opacity: location.pathname !== '/sign-in' ? 1 : 0 }}
          />
          
          <div className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="space-y-1">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-glass)] transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col',
          'bg-[var(--color-surface)]/95 backdrop-blur-xl border-r border-[var(--color-border)]',
          'transition-all duration-[var(--duration-slow)]',
          // Mobile
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Width
          isCollapsed ? 'lg:w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-glass)]"
        >
          <X size={20} />
        </button>

        {sidebarContent}

        {/* Copyright */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              © {new Date().getFullYear()} Collins Kimanzi.<br/>All rights reserved.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════════════════════

interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

// Notifications data
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'payment' | 'alert' | 'info' | 'success';
}

const demoNotifications: Notification[] = [
  {
    id: '1',
    title: 'Payment Received',
    message: 'Jane Wanjiku paid KES 25,000 for Unit A3',
    time: '2 min ago',
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Rent Overdue',
    message: 'Peter Ochieng is 5 days overdue on rent',
    time: '1 hour ago',
    read: false,
    type: 'alert',
  },
  {
    id: '3',
    title: 'New Meter Reading',
    message: 'Caretaker submitted water readings for Sunrise Apartments',
    time: '3 hours ago',
    read: true,
    type: 'info',
  },
  {
    id: '4',
    title: 'Lease Expiring',
    message: 'Mary Akinyi lease expires in 30 days',
    time: 'Yesterday',
    read: true,
    type: 'info',
  },
];

function Topbar({ sidebarCollapsed, onMenuClick, theme, onThemeToggle }: TopbarProps) {
  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-[var(--color-success)]" />;
      case 'alert':
        return <AlertTriangle size={16} className="text-[var(--color-danger)]" />;
      case 'payment':
        return <CreditCard size={16} className="text-[var(--color-success)]" />;
      default:
        return <Info size={16} className="text-[var(--color-accent)]" />;
    }
  };

  // Demo user
  const user = {
    name: 'Bruce Mwikya',
    email: 'bruce@rentflow.co.ke',
    role: 'Landlord',
  };

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleSignOut = () => {
    // In production, this would call Clerk signOut
    navigate('/sign-in');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16',
        'flex items-center justify-between gap-4 px-6',
        'bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]',
        'transition-all duration-[var(--duration-slow)]',
        sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-[260px]',
        'left-0'
      )}
    >
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-glass)]"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block flex-1">
          <SearchInput
            placeholder="Search properties, tenants, units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="theme-toggle p-2.5 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass)] transition-all"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass)] transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-[var(--color-danger)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-xl overflow-hidden animate-fade-up z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-glass)]">
                <h3 className="font-semibold text-[var(--color-text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-muted)]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--color-glass)] transition-colors border-b border-[var(--color-divider)] last:border-b-0',
                        !notification.read && 'bg-[var(--color-accent-light)]'
                      )}
                    >
                      <div className="mt-0.5 p-2 rounded-full bg-[var(--color-glass)] flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm',
                          notification.read ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)] font-medium'
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-glass)]">
                <button className="w-full text-center text-sm font-medium text-[var(--color-accent)] hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-3 p-1.5 rounded-[var(--radius-lg)] hover:bg-[var(--color-glass)] transition-colors">
              <Avatar name={user.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{user.role}</p>
              </div>
            </button>
          }
          items={[
            { label: 'Profile', icon: User, onClick: handleProfileClick },
            { label: 'Settings', icon: Settings, onClick: handleSettingsClick },
            { label: 'Sign Out', icon: LogOut, onClick: handleSignOut, variant: 'danger' },
          ]}
        />
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════════

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('rentflow-theme') as 'light' | 'dark' | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('rentflow-theme', newTheme);
    applyTheme(newTheme);
  }, [theme, applyTheme]);

  // Animate page content on route change
  useEffect(() => {
    if (mainRef.current) {
      animatePageEnter(mainRef.current);
    }
  }, [location.pathname]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Dynamic Background */}
      <DynamicBackground pathname={location.pathname} />

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setMobileMenuOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main
        ref={mainRef}
        className={cn(
          'min-h-screen pt-16 transition-all duration-[var(--duration-slow)]',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
