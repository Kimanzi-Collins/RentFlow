import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui';
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
    <header className="h-16 shrink-0 border-b bg-background z-20 hidden md:flex items-center justify-between px-6 sticky top-0">
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in zoom-in-95">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">K</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Received</p>
                      <p className="text-xs text-muted-foreground mt-0.5">KES 25,000 from Grace Wanjiku via MPESA.</p>
                      <p className="text-[10px] text-muted-foreground mt-1">10 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 text-center bg-muted/20">
                <button className="text-xs text-muted-foreground hover:text-foreground font-medium">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors"
          >
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium leading-none">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{profile?.role || 'Landlord'}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in zoom-in-95">
              <div className="p-4 border-b">
                <p className="font-medium text-sm truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{profile?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                  className="flex items-center gap-2 w-full p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full p-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
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
