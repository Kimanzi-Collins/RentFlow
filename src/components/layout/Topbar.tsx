import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <header className="h-16 shrink-0 border-b border-[var(--color-border)]/50 glass z-20 hidden md:flex items-center justify-between px-6 sticky top-0">
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
          <input
            type="text"
            placeholder="Search properties, tenants..."
            className="w-full h-9 pl-9 pr-4 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-full text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full animate-pulse-glow" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-strong border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden animate-scale-in origin-top-right">
              <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
                <h3 className="font-medium text-sm">Notifications</h3>
                <span className="text-xs text-[var(--color-accent)] cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-[var(--color-border)]/50 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-success-muted)] text-[var(--color-success)] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">K</span>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-medium text-white">Payment Received</span></p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">KES 25,000 from Grace Wanjiku via MPESA.</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">10 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 text-center bg-[rgba(0,0,0,0.2)]">
                <button className="text-xs text-[var(--color-text-secondary)] hover:text-white">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium leading-none">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] capitalize mt-1">{profile?.role || 'Landlord'}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-strong border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden animate-scale-in origin-top-right">
              <div className="p-3 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.02)]">
                <p className="font-medium text-sm truncate">{profile?.full_name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">{profile?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                  className="flex items-center gap-2 w-full p-2 text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full p-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] rounded-lg transition-colors mt-1"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
