import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { User, Bell, Shield, CreditCard, Save, Eye, EyeOff, Monitor, Smartphone, ChevronRight, Camera, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

type Tab = 'profile' | 'notifications' | 'billing' | 'security';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
  { id: 'security',      label: 'Security',       icon: Shield },
];

/* ── Shared style primitives ─────────────────────────────────────────────── */
const card: React.CSSProperties = {
  background: '#ffffff', borderRadius: 0,
  boxShadow: 'none',
  border: '1px solid rgba(0,0,0,0.04)', padding: '24px',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px',
  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 0,
  color: '#111827', fontSize: 14, fontFamily: 'var(--font-sans)',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase',
  marginBottom: 6, fontFamily: 'var(--font-sans)',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 22px', background: '#1c1c1c', border: 'none',
  borderRadius: 0, color: '#111827', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 22px', background: 'transparent',
  border: '1px solid #e5e7eb', borderRadius: 0, color: '#6b7280',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
};

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#1c1c1c';
  e.target.style.boxShadow = '0 0 0 3px rgba(28,28,28,0.12)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#e5e7eb';
  e.target.style.boxShadow = 'none';
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, background: on ? '#1c1c1c' : '#e5e7eb', transition: 'background 0.22s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.22s cubic-bezier(0.16,1,0.3,1)' }} />
    </button>
  );
}

export const Settings: React.FC = () => {
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [showPw, setShowPw] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [notifs, setNotifs] = useState({
    email: true, mpesa: true, overdue: true, maintenance: false, reports: true,
  });
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState('+254 700 000 000');
  const [company, setCompany] = useState('');

  const initials = fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  useGSAP(() => {
    const hdr = pageRef.current?.querySelector('[data-hdr]');
    if (hdr) gsap.fromTo(hdr, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    const tabEls = pageRef.current?.querySelectorAll('[data-tab-btn]') ?? [];
    gsap.fromTo(tabEls, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out', delay: 0.1 });
  }, { scope: pageRef });

  const switchTab = (t: Tab) => {
    setTab(t);
    if (contentRef.current) gsap.fromTo(contentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' });
  };

  return (
    <div ref={pageRef}>
      <div data-hdr style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4, fontFamily: 'DM Sans,sans-serif' }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Sidebar tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 190, flexShrink: 0 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button data-tab-btn type="button" key={t.id} onClick={() => switchTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 0, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 500, textAlign: 'left', transition: 'all 0.18s', background: active ? '#f0fdf9' : 'transparent', color: active ? '#059669' : '#6b7280', borderLeft: active ? '2px solid #1c1c1c' : '2px solid transparent' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <t.icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (<>
            <div style={card}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Profile Information</h3>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(28,28,28,0.15), rgba(77,124,255,0.15))', border: '2px solid rgba(28,28,28,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#059669' }}>{initials}</div>
                  <button type="button" title="Upload photo" style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: '#1c1c1c', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera style={{ width: 11, height: 11, color: '#111827' }} />
                  </button>
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#111827' }}>{fullName || 'Your Name'}</p>
                  <p style={{ fontSize: 13, color: '#9ca3af', textTransform: 'capitalize', fontFamily: 'DM Sans,sans-serif' }}>{profile?.role ?? 'landlord'} · RentFlow</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[
                  { label: 'Full Name', value: fullName, onChange: setFullName, placeholder: 'Your full name' },
                  { label: 'Email Address', value: email, onChange: () => {}, placeholder: 'you@example.com', readOnly: true },
                  { label: 'Phone Number', value: phone, onChange: setPhone, placeholder: '+254 7XX XXX XXX' },
                  { label: 'Company / Organisation', value: company, onChange: setCompany, placeholder: 'Your company name' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={lbl}>{f.label}</label>
                    <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} readOnly={f.readOnly}
                      style={{ ...inp, opacity: f.readOnly ? 0.6 : 1, cursor: f.readOnly ? 'not-allowed' : 'text' }}
                      onFocus={focusIn} onBlur={focusOut}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <button type="button" style={btnPrimary}><Save style={{ width: 14, height: 14 }} /> Save Changes</button>
              </div>
            </div>

            <div style={{ ...card, borderLeft: '3px solid #ef4444', padding: '20px 24px' }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>Danger Zone</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, fontFamily: 'DM Sans,sans-serif' }}>Permanently delete your account and all data. This cannot be undone.</p>
              <button type="button" style={{ padding: '8px 18px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 9, color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Delete Account</button>
            </div>
          </>)}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <div style={card}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Notification Preferences</h3>
              {([
                { key:'email',       label:'Email Notifications',    desc:'Receive all alerts via email' },
                { key:'mpesa',       label:'MPESA Payment Alerts',   desc:'Instant notification when rent is paid' },
                { key:'overdue',     label:'Overdue Rent Alerts',    desc:'Alert when payment is past due date' },
                { key:'maintenance', label:'Maintenance Updates',    desc:'Updates on maintenance request status' },
                { key:'reports',     label:'Weekly Reports',         desc:'Summary report every Monday morning' },
              ] as const).map((item, i) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 2, fontFamily: 'DM Sans,sans-serif' }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'DM Sans,sans-serif' }}>{item.desc}</p>
                  </div>
                  <Toggle on={notifs[item.key]} onChange={v => setNotifs(p => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
            </div>
          )}

          {/* ── BILLING ── */}
          {tab === 'billing' && (<>
            <div style={{ ...card, borderTop: '3px solid #1c1c1c' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: '#f0fdf9', border: '1px solid #a7f3d0', color: '#059669', fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', marginBottom: 8 }}>PROFESSIONAL PLAN</span>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: '#111827' }}>KES 2,499<span style={{ fontSize: 15, fontWeight: 400, color: '#9ca3af' }}>/mo</span></p>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'right', fontFamily: 'DM Sans,sans-serif' }}>
                  <p>Renews: Jul 1, 2025</p>
                  <p style={{ marginTop: 2 }}>4 / 10 properties · 48 / 100 units</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={{ ...btnPrimary, padding: '9px 18px' }}>Upgrade Plan</button>
                <button type="button" style={{ ...btnGhost, padding: '9px 18px' }}>Downgrade</button>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Invoice History</h3>
              {[{ date:'May 2025',amount:'KES 2,499' },{ date:'Apr 2025',amount:'KES 2,499' },{ date:'Mar 2025',amount:'KES 2,499' }].map((inv,i) => (
                <div key={inv.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontFamily: 'DM Sans,sans-serif' }}>{inv.date}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'DM Sans,sans-serif' }}>{inv.amount}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 99, background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>Paid</span>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 4 }}>
                    <ChevronRight style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              ))}
            </div>
          </>)}

          {/* ── SECURITY ── */}
          {tab === 'security' && (<>
            <div style={card}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Change Password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Current Password', 'New Password', 'Confirm Password'].map(f => (
                  <div key={f}>
                    <label style={lbl}>{f}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
                      <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                        style={{ ...inp, paddingLeft: 36, paddingRight: 40 }}
                        onFocus={focusIn} onBlur={focusOut}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                        {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div><button type="button" style={btnPrimary}><Save style={{ width: 14, height: 14 }} /> Update Password</button></div>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Active Sessions</h3>
              {[
                { icon: Monitor, device: 'Chrome on Windows', location: 'Nairobi, Kenya', time: 'Active now', current: true },
                { icon: Smartphone, device: 'Mobile Safari', location: 'Mombasa, Kenya', time: '2 hours ago', current: false },
              ].map(s => (
                <div key={s.device} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexShrink: 0 }}>
                    <s.icon style={{ width: 18, height: 18 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: 'DM Sans,sans-serif' }}>{s.device}</span>
                      {s.current && <span style={{ padding: '1px 8px', borderRadius: 99, background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, fontFamily: 'DM Sans,sans-serif' }}>Current</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'DM Sans,sans-serif' }}>{s.location} · {s.time}</p>
                  </div>
                  {!s.current && <button type="button" style={{ padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Revoke</button>}
                </div>
              ))}
              <button type="button" style={{ marginTop: 14, padding: '8px 18px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                Sign Out All Devices
              </button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
};

export default Settings;
