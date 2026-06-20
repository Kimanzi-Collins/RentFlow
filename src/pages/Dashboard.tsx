import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  TrendingUp,
  Users,
  Home,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical,
  Pause,
  Square,
  Wrench
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// ── Mock data ──────────────────────────────────────────────────────────────

const OVERDUE_TENANTS = [
  { name: 'James Mwangi',  unit: 'A-104', amount: 18000, days: 14, avatar: 'https://ui-avatars.com/api/?name=James+Mwangi&background=facc15&color=fff' },
  { name: 'Fatuma Hassan', unit: 'C-301', amount: 25000, days: 9, avatar: 'https://ui-avatars.com/api/?name=Fatuma+Hassan&background=ef4444&color=fff' },
  { name: 'Peter Ochieng', unit: 'B-204', amount: 45000, days: 2, avatar: 'https://ui-avatars.com/api/?name=Peter+Ochieng&background=4f46e5&color=fff' },
];

const BAR_DATA = [
  { day: 'S', height: 40, active: false },
  { day: 'M', height: 60, active: false },
  { day: 'T', height: 85, active: true, label: '74%' },
  { day: 'W', height: 100, active: true },
  { day: 'T', height: 75, active: false },
  { day: 'F', height: 50, active: false },
  { day: 'S', height: 30, active: false },
];

// ── Dashboard Component ────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Admin';

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef    = useRef<HTMLDivElement>(null);
  const cardsRef     = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }

    // Elements stagger
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.gsap-item');
      gsap.fromTo(items,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
      );
    }

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>

      {/* ── Header ── */}
      <div ref={headerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Plan, prioritize, and accomplish your property tasks with ease.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-organic btn-primary">
            <Plus size={16} />
            Add Property
          </button>
          <button className="btn-organic btn-secondary">
            Import Data
          </button>
        </div>
      </div>

      {/* ── Top Row KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gsap-item">
        {/* Card 1: Primary Solid */}
        <div className="card-primary relative overflow-hidden">
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Total Properties</span>
            <button className="btn-icon" style={{ width: '32px', height: '32px', color: 'var(--text-main)' }}>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '24px' }}>
            24
          </div>
          <div style={{ alignItems: 'center', gap: '8px', fontSize: '13px', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex' }}>
            <TrendingUp size={14} /> Increased from last month
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="card-organic relative">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Total Revenue</span>
            <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '24px', color: 'var(--text-main)' }}>
            1.8M
          </div>
          <div style={{ alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--brand-primary)', background: 'var(--brand-primary-light)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', fontWeight: 600 }}>
            <TrendingUp size={14} /> +12.5% vs last month
          </div>
        </div>

        {/* Card 3: Occupancy */}
        <div className="card-organic relative">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Occupancy</span>
            <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '24px', color: 'var(--text-main)' }}>
            88%
          </div>
          <div style={{ alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--brand-primary)', background: 'var(--brand-primary-light)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', fontWeight: 600 }}>
            <Home size={14} /> 42/48 Units Filled
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="card-organic relative">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Pending Issues</span>
            <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '24px', color: 'var(--text-main)' }}>
            12
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            <span style={{ color: '#ef4444' }}>8 Maintenance</span> • 4 Overdue
          </div>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Collection Analytics (Bar Chart) */}
        <div className="card-organic lg:col-span-1 gsap-item">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Collection Analytics</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px' }}>
            {BAR_DATA.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${bar.height}%`, 
                  background: bar.active ? 'var(--brand-primary)' : 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 4px, #f3f4f6 4px, #f3f4f6 8px)',
                  borderRadius: '99px',
                  position: 'relative'
                }}>
                  {bar.label && (
                    <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#ffffff', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      {bar.label}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders / Next Meeting */}
        <div className="card-organic lg:col-span-1 flex flex-col justify-between gsap-item">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Reminders</h3>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1.2, marginBottom: '8px' }}>
              Meeting with Kilimani Landlords
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
              <Clock size={16} /> Time : 02.00 pm - 04.00 pm
            </div>
          </div>
          <button className="btn-organic btn-primary w-full mt-8 py-4 text-[16px]">
            <Calendar size={18} /> Start Meeting
          </button>
        </div>

        {/* Recent Tasks / Actions */}
        <div className="card-organic lg:col-span-1 gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Priority Tasks</h3>
            <button className="btn-organic btn-secondary !py-2 !px-3 !text-[12px]">
              + New
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: <CreditCard color="#4f46e5" />, title: 'Review Overdue Rent', date: 'Due date: Jun 22, 2026' },
              { icon: <Wrench color="#ef4444" />, title: 'Fix Plumbing at Unit A1', date: 'Due date: Jun 21, 2026' },
              { icon: <Users color="#facc15" />, title: 'Tenant Onboarding', date: 'Due date: Jun 24, 2026' },
            ].map((task, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {task.icon}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Collaboration / Overdue List */}
        <div className="card-organic lg:col-span-1 gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Overdue Payments</h3>
            <button className="btn-organic btn-secondary !py-2 !px-3 !text-[12px]">
              + Send Reminder
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {OVERDUE_TENANTS.map((tenant, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: i !== OVERDUE_TENANTS.length -1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={tenant.avatar} alt={tenant.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{tenant.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unit {tenant.unit} • <span style={{ color: '#ef4444' }}>{tenant.days} days late</span></div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>
                  KSh {tenant.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Progress Arc */}
        <div className="card-organic lg:col-span-1 flex flex-col items-center justify-center relative gsap-item">
          <h3 style={{ fontSize: '18px', fontWeight: 700, alignSelf: 'flex-start', position: 'absolute', top: 24, left: 24 }}>Collection Progress</h3>
          <div style={{ width: '200px', height: '100px', position: 'relative', marginTop: '60px', overflow: 'hidden' }}>
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '24px solid var(--brand-primary-light)', position: 'absolute', top: 0, left: 0 }} />
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '24px solid var(--brand-primary)', position: 'absolute', top: 0, left: 0, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(-40deg)' }} />
          </div>
          <div style={{ marginTop: '-40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>87%</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Collected this month</div>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-primary)' }}/> Collected</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-primary-light)' }}/> Pending</div>
          </div>
        </div>

        {/* Time Tracker / Active Action */}
        <div className="card-dark lg:col-span-1 flex flex-col justify-between gsap-item" style={{ background: '#312e81', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative ripples */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)', opacity: 0.5 }} />
          
          <h3 style={{ fontSize: '18px', fontWeight: 600, position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.8)' }}>Active Session</h3>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, margin: '24px 0' }}>
            <div style={{ fontSize: '56px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-2px' }}>01:24:08</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            <button style={{ width: 48, height: 48, borderRadius: '50%', background: '#ffffff', color: '#312e81', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <Pause fill="#312e81" />
            </button>
            <button style={{ width: 48, height: 48, borderRadius: '50%', background: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <Square fill="#ffffff" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
