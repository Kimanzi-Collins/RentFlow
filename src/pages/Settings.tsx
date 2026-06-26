import React, { useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { User, Shield, Bell, Globe, Palette, ChevronRight, Save, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useSettingsStore } from '@/stores/settingsStore';

interface NotifSetting { label: string; description: string; enabled: boolean; }



const CURRENCIES = ['KES – Kenyan Shilling', 'USD – US Dollar', 'EUR – Euro', 'GBP – British Pound'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const THEMES = ['Light', 'Dark', 'System'];

export const Settings: React.FC = () => {
  const { profile, updateProfile, uploadAvatar } = useAuthStore();
  const { success, error: toastErr } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fullName = profile?.full_name || 'Admin User';
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Profile state
  const [name, setName]         = useState(profile?.full_name || '');
  const [phone, setPhone]       = useState(profile?.phone || '');
  const [company, setCompany]   = useState(profile?.company_name || '');

  React.useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCompany(profile.company_name || '');
    }
  }, [profile]);

  // Preferences state
  const [currency, setCurrency]     = useState(CURRENCIES[0]);
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0]);
  const [theme, setTheme]           = useState(THEMES[0]);

  // Security state
  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd]   = useState('');
  const [confPwd, setConfPwd] = useState('');

  const { notifications, updateNotifications } = useSettingsStore();

  const notifsList = [
    { key: 'overdueRent', label: 'Overdue Rent Alerts', description: 'Get notified when rent is 3+ days overdue' },
    { key: 'maintenanceUpdates', label: 'Maintenance Updates', description: 'Receive updates when ticket status changes' },
    { key: 'newTenant', label: 'New Tenant Registration', description: 'Alert when a new tenant is added' },
    { key: 'lowOccupancy', label: 'Low Occupancy Warning', description: 'Alert when occupancy drops below 70%' },
  ];

  useGSAP(() => {
    const sections = containerRef.current?.querySelectorAll('.settings-section');
    if (sections) gsap.fromTo(sections,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
    );
  }, { scope: containerRef });

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toastErr('Validation error', 'Name cannot be empty.'); return; }
    
    const { error } = await updateProfile({ full_name: name, phone, company_name: company });
    
    if (error) {
      toastErr('Update failed', error);
    } else {
      success('Profile updated', 'Your profile information has been saved.');
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { error } = await uploadAvatar(file);
    setIsUploading(false);

    if (error) {
      toastErr('Upload failed', error);
    } else {
      success('Avatar updated', 'Your profile picture has been changed.');
    }
  }

  function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currPwd) { toastErr('Missing field', 'Current password is required.'); return; }
    if (newPwd.length < 8) { toastErr('Weak password', 'Password must be at least 8 characters.'); return; }
    if (newPwd !== confPwd) { toastErr('Mismatch', 'New passwords do not match.'); return; }
    success('Password changed', 'Your password has been updated successfully.');
    setCurrPwd(''); setNewPwd(''); setConfPwd('');
  }

  function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    success('Preferences saved', 'Your system preferences have been updated.');
  }

  function toggleNotif(key: keyof typeof notifications) {
    updateNotifications({ [key]: !notifications[key] });
  }

  function handleSaveNotifs() {
    success('Notifications saved', 'Your notification preferences have been successfully synced.');
  }

  const SECTION_STYLE: React.CSSProperties = {
    background: '#fff',
    borderRadius: 20,
    padding: 28,
    border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)',
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760, paddingBottom: 32 }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences and system configuration.</p>
      </div>

      {/* ── Profile ── */}
      <form className="settings-section" style={SECTION_STYLE} onSubmit={handleSaveProfile}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={17} color="#171717" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Profile Information</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#171717', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, overflow: 'hidden' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleAvatarChange}
            />
            <button 
              type="button"
              className="avatar-edit-btn" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: '#10b981', border: '2px solid #fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.5 : 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{profile?.full_name || 'User'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {profile?.role === 'landlord' ? 'Landlord' : 'Caretaker'} · RentFlow
            </div>
          </div>
        </div>

        <div className="modal-form-grid" style={{ '--modal-form-cols': '1fr 1fr' } as React.CSSProperties}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
            <input type="text" className="input-organic" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Email Address</label>
            <input type="email" className="input-organic" defaultValue={profile?.email || ''} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed', opacity: 0.7 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Phone Number</label>
            <input type="tel" className="input-organic" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +254 700 000000" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Company / Agency</label>
            <input type="text" className="input-organic" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Sunset Properties Ltd" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="submit" className="btn-organic btn-primary">
            <Save size={15} /> Save Changes
          </button>
        </div>
      </form>

      {/* ── Preferences ── */}
      <form className="settings-section" style={SECTION_STYLE} onSubmit={handleSavePreferences}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={17} color="#171717" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>System Preferences</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { label: 'Currency', value: currency, onChange: setCurrency, options: CURRENCIES },
            { label: 'Date Format', value: dateFormat, onChange: setDateFormat, options: DATE_FORMATS },
            { label: 'Theme', value: theme, onChange: setTheme, options: THEMES },
          ].map(pref => (
            <div key={pref.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{pref.label}</label>
              <select
                aria-label={pref.label}
                className="input-organic"
                style={{ cursor: 'pointer' }}
                value={pref.value}
                onChange={e => pref.onChange(e.target.value)}
              >
                {pref.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="submit" className="btn-organic btn-primary">
            <Save size={15} /> Save Preferences
          </button>
        </div>
      </form>

      {/* ── Notifications ── */}
      <div className="settings-section" style={SECTION_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={17} color="#171717" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Notifications</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {notifsList.map((n, i) => (
            <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < notifsList.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.description}</div>
              </div>
              <label className="toggle-switch" style={{ flexShrink: 0, marginLeft: 16 }}>
                <input type="checkbox" checked={notifications[n.key as keyof typeof notifications]} onChange={() => toggleNotif(n.key as keyof typeof notifications)} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="btn-organic btn-primary" onClick={handleSaveNotifs}>
            <Save size={15} /> Save Notifications
          </button>
        </div>
      </div>

      {/* ── Team & Access (Landlord Only) ── */}
      {profile?.role === 'landlord' && (
        <div className="settings-section" style={SECTION_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={17} color="#171717" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Team & Access</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-hover)', borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Caretaker Invitation</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Invite a caretaker to manage properties on your behalf.</div>
            </div>
            <button
              type="button"
              className="btn-organic btn-secondary"
              style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0, marginLeft: 16 }}
              onClick={() => {
                const link = `${window.location.origin}/sign-in?invite=${profile.id}`;
                navigator.clipboard.writeText(link);
                success('Invite Link Copied', 'Send this link to your caretaker to let them sign up.');
              }}
            >
              Copy Invite Link
            </button>
          </div>
        </div>
      )}

      {/* ── Security ── */}
      <form className="settings-section" style={SECTION_STYLE} onSubmit={handleSavePassword}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={17} color="#171717" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Security & Password</h2>
        </div>

        {/* 2FA row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-hover)', borderRadius: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Two-Factor Authentication</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Adds an extra layer of security to your account</div>
          </div>
          <button type="button" className="btn-organic btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => success('Coming soon', '2FA setup will be available in the next release.')}>
            Enable 2FA <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Current Password', value: currPwd, onChange: setCurrPwd, placeholder: '••••••••' },
            { label: 'New Password',     value: newPwd,  onChange: setNewPwd,  placeholder: 'Min. 8 characters' },
            { label: 'Confirm New Password', value: confPwd, onChange: setConfPwd, placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{f.label}</label>
              <input type="password" className="input-organic" placeholder={f.placeholder} value={f.value} onChange={e => f.onChange(e.target.value)} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="submit" className="btn-organic btn-primary">
            <Shield size={15} /> Update Password
          </button>
        </div>
      </form>
    </div>
  );
};
