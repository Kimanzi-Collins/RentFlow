import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import {
  TrendingUp,
  Users,
  Home,
  CreditCard,
  AlertCircle,
  Droplets,
  Wrench,
  ArrowUpRight,
  ReceiptText,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime } from '@/lib/utils';
import type { RecentActivity } from '@/types';

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    description: 'KES 25,000 from Grace Wanjiku via MPESA',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: '2',
    type: 'lease',
    title: 'New Lease Signed',
    description: 'Peter Ochieng — B-204 Green Valley Estate',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    type: 'meter_reading',
    title: 'Meter Readings Submitted',
    description: 'Green Valley Estate — 12 units recorded',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '4',
    type: 'maintenance',
    title: 'Maintenance Request',
    description: 'City View Tower — Unit C-302, plumbing issue',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const OVERDUE_TENANTS = [
  { name: 'James Mwangi',  unit: 'A-104', amount: 18000, days: 14 },
  { name: 'Fatuma Hassan', unit: 'C-301', amount: 25000, days: 9 },
];

const BAR_DATA = [
  { month: 'Jan', height: 40, amount: 740000 },
  { month: 'Feb', height: 65, amount: 1200000 },
  { month: 'Mar', height: 45, amount: 830000 },
  { month: 'Apr', height: 80, amount: 1480000 },
  { month: 'May', height: 55, amount: 1020000 },
  { month: 'Jun', height: 90, amount: 1850000 },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getActivityColor(type: RecentActivity['type']): string {
  switch (type) {
    case 'payment':       return '#1c1c1c';
    case 'lease':         return '#4d7cff';
    case 'meter_reading': return '#a855f7';
    case 'maintenance':   return '#f59e0b';
    default:              return '#1c1c1c';
  }
}

function getActivityIcon(type: RecentActivity['type']): React.ReactNode {
  switch (type) {
    case 'payment':       return <CreditCard size={14} />;
    case 'lease':         return <ReceiptText size={14} />;
    case 'meter_reading': return <Droplets size={14} />;
    case 'maintenance':   return <Wrench size={14} />;
    default:              return <Activity size={14} />;
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDay(): string {
  return new Date().toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Shared white card style ────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 0,
  boxShadow: 'none',
  padding: 24,
};

// ── Dashboard Component ────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin';
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Refs for GSAP
  const containerRef    = useRef<HTMLDivElement>(null);
  const headerRef       = useRef<HTMLDivElement>(null);
  const card1Ref        = useRef<HTMLDivElement>(null);
  const card2Ref        = useRef<HTMLDivElement>(null);
  const card3Ref        = useRef<HTMLDivElement>(null);
  const card4Ref        = useRef<HTMLDivElement>(null);
  const counter1Ref     = useRef<HTMLSpanElement | null>(null);
  const counter2Ref     = useRef<HTMLSpanElement | null>(null);
  const counter3Ref     = useRef<HTMLSpanElement | null>(null);
  const counter4Ref     = useRef<HTMLSpanElement | null>(null);
  const barRefs         = useRef<(HTMLDivElement | null)[]>([]);
  const activityRef     = useRef<HTMLDivElement>(null);
  const progressBarRef  = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }

    // Stat cards stagger
    const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current].filter(Boolean);
    gsap.to(cards, { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out', delay: 0.15 });

    // Counter animations
    type CounterDef = { ref: React.RefObject<HTMLSpanElement | null>; target: number; format: (v: number) => string };
    const counters: CounterDef[] = [
      { ref: counter1Ref, target: 1850000, format: (v) => `KES ${(v / 1000000).toFixed(2)}M` },
      { ref: counter2Ref, target: 87.5,    format: (v) => `${v.toFixed(1)}%` },
      { ref: counter3Ref, target: 1620000, format: (v) => `KES ${(v / 1000).toFixed(0)}K` },
      { ref: counter4Ref, target: 145000,  format: (v) => `KES ${(v / 1000).toFixed(0)}K` },
    ];
    counters.forEach(({ ref, target, format }) => {
      if (!ref.current) return;
      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: target,
        duration: 1.4,
        delay: 0.4,
        ease: 'power2.out',
        onUpdate() { if (ref.current) ref.current.textContent = format(proxy.value); },
        onComplete() { if (ref.current) ref.current.textContent = format(target); },
      });
    });

    // Bar chart — animate height from 0
    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      gsap.fromTo(bar,
        { scaleY: 0, transformOrigin: 'bottom center' },
        { scaleY: 1, duration: 0.7, delay: 0.35 + i * 0.08, ease: 'power3.out' }
      );
    });

    // Progress bar
    if (progressBarRef.current) {
      gsap.fromTo(progressBarRef.current,
        { width: '0%' },
        { width: '87.6%', duration: 1.2, delay: 0.6, ease: 'power3.out' }
      );
    }

    // Activity items on scroll
    if (activityRef.current) {
      const items = activityRef.current.querySelectorAll('.activity-item');
      gsap.fromTo(items,
        { opacity: 0, y: 12 },
        {
          opacity: 1, y: 0, stagger: 0.09, duration: 0.45, ease: 'power3.out',
          scrollTrigger: { trigger: activityRef.current, start: 'top 90%' },
        }
      );
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>

      {/* ── Row 1: Welcome bar ── */}
      <div
        ref={headerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          opacity: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              fontWeight: 700,
              color: '#111827',
              marginBottom: 4,
              lineHeight: 1.15,
            }}
          >
            {getGreeting()}, {firstName}!
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'var(--font-sans)' }}>{formatDay()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 18px',
              borderRadius: 0,
              background: '#1c1c1c',
              border: 'none',
              color: '#0a2e1f',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.92)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
          >
            <CreditCard size={15} />
            Record Payment
          </button>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 0,
              background: 'transparent',
              border: '1.5px solid rgba(0,0,0,0.15)',
              color: '#374151',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.15)';
            }}
          >
            <Users size={15} />
            Add Tenant
          </button>
        </div>
      </div>

      {/* ── Row 2: KPI Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {/* Card 1 — Total Revenue (gradient purple-rose) */}
        <div
          ref={card1Ref}
          style={{
            background: '#ffffff', border: '1px solid var(--border-color)',
            borderRadius: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(124,58,237,0.25)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              Total Revenue
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 0,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={17} color="#fff" />
            </div>
          </div>
          <span
            ref={counter1Ref}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              fontWeight: 700,
              color: '#1c1c1c', lineHeight: 1.1,
            }}
          >
            KES 0.00M
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              <ArrowUpRight size={12} /> +12.5%
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'var(--font-sans)' }}>vs last month</span>
          </div>
        </div>

        {/* Card 2 — Occupancy (gradient teal-cyan) */}
        <div
          ref={card2Ref}
          style={{
            background: '#ffffff', border: '1px solid var(--border-color)',
            borderRadius: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(8,145,178,0.25)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              Occupancy Rate
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 0,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home size={17} color="#fff" />
            </div>
          </div>
          <span
            ref={counter2Ref}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              fontWeight: 700,
              color: '#1c1c1c', lineHeight: 1.1,
            }}
          >
            0.0%
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              <CheckCircle2 size={12} /> 42/48 units
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'var(--font-sans)' }}>occupied</span>
          </div>
        </div>

        {/* Card 3 — Collected (white, mint accent) */}
        <div
          ref={card3Ref}
          style={{
            ...CARD,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', fontFamily: 'var(--font-sans)' }}>
              Collected This Month
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 0,
                background: 'rgba(28,28,28,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={17} color="#1c1c1c" />
            </div>
          </div>
          <span
            ref={counter3Ref}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.1,
            }}
          >
            KES 0K
          </span>
          {/* Progress bar */}
          <div>
            <div style={{ width: '100%', height: 5, background: '#f0faf6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '87.6%', height: '100%', background: '#1c1c1c', borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#00b87c' }}>87.6%</span>
              <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-sans)' }}>collection rate</span>
            </div>
          </div>
        </div>

        {/* Card 4 — Overdue (white, red accent) */}
        <div
          ref={card4Ref}
          style={{
            ...CARD,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', fontFamily: 'var(--font-sans)' }}>
              Overdue Amount
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 0,
                background: 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={17} color="#ef4444" />
            </div>
          </div>
          <span
            ref={counter4Ref}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.1,
            }}
          >
            KES 0K
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color="#ef4444" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>8 tenants</span>
            <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-sans)' }}>5+ days late</span>
          </div>
        </div>
      </div>

      {/* ── Row 3: Main content (2/3 + 1/3) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Revenue Bar Chart */}
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: 4,
                  }}
                >
                  Revenue Overview
                </h2>
                <p style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
                  Monthly collection performance
                </p>
              </div>
              <select
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid #e5e3de',
                  borderRadius: 8,
                  color: '#374151',
                  padding: '6px 12px',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>

            {/* Bars */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 10,
                height: 160,
              }}
            >
              {BAR_DATA.map((bar, i) => (
                <div
                  key={bar.month}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {hoveredBar === i && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -36,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#111827',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}
                      >
                        KES {(bar.amount / 1000).toFixed(0)}K
                      </div>
                    )}
                    <div
                      ref={(el) => { barRefs.current[i] = el; }}
                      style={{
                        width: '100%',
                        height: `${bar.height}%`,
                        background: hoveredBar === i
                          ? 'linear-gradient(180deg, #00f5af 0%, #1c1c1c 100%)'
                          : 'linear-gradient(180deg, #1c1c1c 0%, rgba(28,28,28,0.4) 100%)',
                        borderRadius: '6px 6px 0 0',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#9ca3af',
                      fontWeight: 500,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={CARD}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                fontWeight: 700,
                color: '#111827',
                marginBottom: 16,
              }}
            >
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                {
                  label: 'Record Payment',
                  icon: <CreditCard size={20} color="#00b87c" />,
                  bg: 'rgba(28,28,28,0.08)',
                  border: 'rgba(28,28,28,0.2)',
                  hover: 'rgba(28,28,28,0.14)',
                },
                {
                  label: 'Add Reading',
                  icon: <Droplets size={20} color="#0891b2" />,
                  bg: 'rgba(8,145,178,0.08)',
                  border: 'rgba(8,145,178,0.2)',
                  hover: 'rgba(8,145,178,0.14)',
                },
                {
                  label: 'New Tenant',
                  icon: <Users size={20} color="#7c3aed" />,
                  bg: 'rgba(124,58,237,0.08)',
                  border: 'rgba(124,58,237,0.2)',
                  hover: 'rgba(124,58,237,0.14)',
                },
                {
                  label: 'Send Reminder',
                  icon: <AlertCircle size={20} color="#d97706" />,
                  bg: 'rgba(245,158,11,0.08)',
                  border: 'rgba(245,158,11,0.2)',
                  hover: 'rgba(245,158,11,0.14)',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  style={{
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    borderRadius: 0,
                    padding: '18px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    color: '#374151',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                    el.style.background = action.hover;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = '';
                    el.style.boxShadow = '';
                    el.style.background = action.bg;
                  }}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Collection Progress */}
          <div style={CARD}>
            {/* Big rate number */}
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 64,
                fontWeight: 800,
                color: '#1c1c1c',
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              87.6%
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: 'var(--font-sans)',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Collection Rate
            </p>

            {/* Animated progress bar */}
            <div
              style={{
                width: '100%',
                height: 8,
                background: '#f0faf6',
                borderRadius: 99,
                overflow: 'hidden',
                marginBottom: 8,
              }}
            >
              <div
                ref={progressBarRef}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #1c1c1c, #00b87c)',
                  borderRadius: 99,
                  width: '0%',
                }}
              />
            </div>
            <p
              style={{
                fontSize: 12,
                color: '#9ca3af',
                fontFamily: 'var(--font-sans)',
                marginBottom: 20,
              }}
            >
              KES 1,620,000 of KES 1,850,000 collected
            </p>

            {/* Overdue tenants */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Overdue Tenants
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {OVERDUE_TENANTS.map((tenant) => (
                <div
                  key={tenant.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 12px',
                    borderRadius: 0,
                    background: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(239,68,68,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#ef4444',
                        flexShrink: 0,
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      {tenant.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#111827',
                          lineHeight: 1.2,
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {tenant.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-sans)' }}>
                        {tenant.unit}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#ef4444',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      KES {tenant.amount.toLocaleString()}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-sans)' }}>
                      {tenant.days}d overdue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={CARD} ref={activityRef}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Recent Activity
              </h2>
              <button
                type="button"
                style={{
                  color: '#00b87c',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                }}
              >
                View all
              </button>
            </div>

            <div>
              {MOCK_ACTIVITIES.map((activity, i) => {
                const color = getActivityColor(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="activity-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom:
                        i < MOCK_ACTIVITIES.length - 1
                          ? '1px solid rgba(0,0,0,0.05)'
                          : 'none',
                      opacity: 0,
                    }}
                  >
                    {/* Colored dot icon */}
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: `${color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#111827',
                          lineHeight: 1.3,
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {activity.title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: '#9ca3af',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {activity.description}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        flexShrink: 0,
                        marginTop: 2,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {formatRelativeTime(new Date(activity.timestamp))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
