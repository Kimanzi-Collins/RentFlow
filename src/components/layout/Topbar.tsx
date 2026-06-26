import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Menu, Search, Bell, ChevronDown, Settings, LogOut, User, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBillingStore } from '@/stores/billingStore';
import { useMaintenanceStore } from '@/stores/maintenanceStore';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { profile, signOut } = useAuthStore();
  const { tenants, getTenantOutstanding } = useBillingStore();
  const { tickets } = useMaintenanceStore();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const initials = (profile?.full_name || 'Admin User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Build live notifications from store data
  const notifications = useMemo(() => {
    const notifs: { id: string; title: string; body: string; time: string; color: string }[] = [];

    // Overdue tenants
    tenants.forEach(t => {
      const outstanding = getTenantOutstanding(t.id);
      if (outstanding > 0) {
        notifs.push({
          id: `overdue-${t.id}`,
          title: 'Overdue Rent',
          body: `${t.first_name} ${t.last_name} – Unit ${t.unit} owes KSh ${outstanding.toLocaleString()}`,
          time: 'Now',
          color: '#ef4444',
        });
      }
    });

    // Pending maintenance tickets
    tickets.filter(t => t.status !== 'resolved').forEach(t => {
      notifs.push({
        id: `ticket-${t.id}`,
        title: 'Maintenance Request',
        body: `${t.title} – ${t.unit}`,
        time: t.date || 'Recent',
        color: t.priority === 'High' ? '#ef4444' : '#f59e0b',
      });
    });

    // If no notifications, show a placeholder
    if (notifs.length === 0) {
      notifs.push({
        id: 'empty',
        title: 'All clear!',
        body: 'No overdue rent or pending maintenance.',
        time: 'Now',
        color: '#10b981',
      });
    }

    return notifs;
  }, [tenants, tickets, getTenantOutstanding]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id) && n.id !== 'empty').length;

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));

  return (
    <header style={{ padding: '0 28px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, height: 60 }}>

      {/* Left: mobile menu + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden btn-icon"
          style={{ flexShrink: 0 }}
        >
          <Menu size={19} />
        </button>

        <div style={{ position: 'relative', maxWidth: 300, flex: 1 }} className="hidden md:block">
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search properties, tenants..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 38px',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 999,
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
              color: 'var(--text-main)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.05)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Right: notifications + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => { setShowNotif(v => !v); setShowUser(false); }}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 8, height: 8,
                background: '#ef4444', borderRadius: '50%',
                border: '2px solid var(--bg-app)',
              }} />
            )}
          </button>

          {showNotif && (
            <div className="notif-panel">
              <div className="notif-header">
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, marginLeft: 6 }}>{unreadCount}</span>}
                </span>
                <button type="button" onClick={markAllRead} style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="notif-item" style={{ background: !readIds.has(n.id) && n.id !== 'empty' ? '#fafafa' : 'transparent' }}>
                  <span className="notif-dot" style={{ background: n.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 18px', textAlign: 'center' }}>
                <button type="button" onClick={() => { navigate('/maintenance'); setShowNotif(false); }} style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 28, width: 1, background: 'rgba(0,0,0,0.07)' }} />

        {/* User menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => { setShowUser(v => !v); setShowNotif(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,0,0,0.07)',
              padding: '6px 12px 6px 6px',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--brand-primary)', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0, overflow: 'hidden'
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              {profile?.full_name ? profile.full_name.split(' ')[0] : 'Admin'}
            </span>
            <ChevronDown size={13} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: showUser ? 'rotate(180deg)' : 'none' }} />
          </button>

          {showUser && (
            <div className="user-menu">
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{profile?.full_name || 'Admin User'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{profile?.role === 'caretaker' ? 'Caretaker' : 'Landlord'}</div>
              </div>
              {[
                { icon: User, label: 'Profile', action: () => { navigate('/settings'); setShowUser(false); } },
                { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowUser(false); } },
              ].map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="ctx-menu-item"
                  style={{ width: '100%' }}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => signOut()}
                className="ctx-menu-item danger"
                style={{ width: '100%' }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
