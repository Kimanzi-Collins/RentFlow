import React, { useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { User, Bell, Shield, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const sections = containerRef.current.querySelectorAll('.gsap-item');
      gsap.fromTo(
        sections,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: containerRef }
  );

  const fullName = profile?.full_name || 'Admin User';
  const initials = fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Manage your account preferences and system configurations.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="card-organic gsap-item" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={20} /> Profile Information
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
            {initials}
          </div>
          <div>
            <button className="btn-organic btn-secondary !py-2 !px-4 !text-[13px] mb-2">Change Avatar</button>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>JPG, GIF or PNG. Max size of 800K</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
            <input type="text" className="input-organic" defaultValue={fullName} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Email Address</label>
            <input type="email" className="input-organic" defaultValue="admin@rentflow.com" disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn-organic btn-primary">Save Changes</button>
        </div>
      </div>

      {/* Security */}
      <div className="card-organic gsap-item" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} /> Security & Password
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Password</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Last changed 3 months ago</div>
            </div>
            <button className="btn-organic btn-secondary !py-2 !px-4 !text-[13px]">Change Password</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add an extra layer of security to your account.</div>
            </div>
            <button className="btn-organic btn-secondary !py-2 !px-4 !text-[13px]">Enable 2FA</button>
          </div>
        </div>
      </div>

    </div>
  );
};
