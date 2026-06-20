import React from 'react';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { profile } = useAuthStore();

  const initials = (profile?.full_name || 'Admin User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <header style={{ padding: '0 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <Menu size={20} />
        </button>

        <div style={{ position: 'relative', width: 320 }} className="hidden md:block">
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search properties, tenants..."
            style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 999, fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)', position: 'relative' }}>
          <Bell size={20} color="var(--text-main)" />
          <span style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #ffffff' }} />
        </button>

        <div style={{ height: 32, width: 1, background: 'rgba(0,0,0,0.08)' }} />

        <button style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 999 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {initials}
          </div>
          <span className="hidden sm:block" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
            {profile?.full_name ? profile.full_name.split(' ')[0] : 'Admin'}
          </span>
          <ChevronDown size={14} color="#9ca3af" />
        </button>
      </div>
    </header>
  );
};
