import React, { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Users, Home, CreditCard, AlertCircle,
  Plus, ArrowUpRight, Calendar, CheckCircle2, Clock,
  ChevronRight, Pause, Square, Wrench, Download, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import {
  useBillingStore, getAvailablePeriods, parsePeriodKey, CURRENT_PERIOD_KEY,
} from '@/stores/billingStore';

// ── Quick Pay modal (dashboard shortcut) ────────────────────────────────────

const METHODS = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque'];

const QuickPayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tenants, rentRecords, waterReadings, recordPayment, markWaterPaid, ensureRentRecord } = useBillingStore();
  const { success } = useToast();
  const activeTenants = tenants.filter(t => t.status === 'active');
  const periods = getAvailablePeriods();

  const [tenantId, setTenantId]   = useState(activeTenants[0]?.id ?? 0);
  const [periodKey, setPeriodKey] = useState(CURRENT_PERIOD_KEY);
  const [payType, setPayType]     = useState<'rent' | 'water'>('rent');
  const [method, setMethod]       = useState('M-PESA');
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');
  const [err, setErr]             = useState('');

  const tenant      = activeTenants.find(t => t.id === tenantId);
  const rentRecord  = rentRecords.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
  const waterRecord = waterReadings.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
  const rentBalance  = rentRecord ? rentRecord.balance : (tenant?.rent_amount ?? 0);
  const waterBalance = waterRecord?.status === 'paid' ? 0 : (waterRecord?.amount ?? 0);
  const activeBalance = payType === 'rent' ? rentBalance : waterBalance;

  // Auto-fill amount when selections change
  React.useEffect(() => {
    setAmount(String(activeBalance > 0 ? activeBalance : ''));
    setErr('');
  }, [tenantId, periodKey, payType]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    const n = Number(amount);
    if (!n || n <= 0) { setErr('Enter a valid amount.'); return; }
    setErr('');

    const { year, month } = parsePeriodKey(periodKey);

    if (payType === 'rent') {
      ensureRentRecord(tenantId, year, month);
      recordPayment(tenantId, periodKey, n, method, note || undefined);
      success('Rent payment recorded', `KSh ${n.toLocaleString()} — ${tenant.first_name} ${tenant.last_name}`);
    } else {
      if (!waterRecord) { setErr('No water reading for this period.'); return; }
      if (waterRecord.status === 'paid') { setErr('Water bill already paid for this period.'); return; }
      markWaterPaid(tenantId, periodKey);
      success('Water payment recorded', `KSh ${waterBalance.toLocaleString()} — Unit ${tenant.unit}`);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}

      <div className="modal-form-grid">
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="modal-label">Tenant</label>
          <select aria-label="Tenant" className="modal-input" value={tenantId}
            onChange={e => setTenantId(Number(e.target.value))}>
            {activeTenants.map(t => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — Unit {t.unit}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="modal-label">Billing Month</label>
          <select aria-label="Billing month" className="modal-input" value={periodKey}
            onChange={e => setPeriodKey(e.target.value)}>
            {periods.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="modal-label">Payment Type</label>
          <select aria-label="Payment type" className="modal-input" value={payType}
            onChange={e => setPayType(e.target.value as 'rent' | 'water')}>
            <option value="rent">🏠 Rent</option>
            <option value="water">💧 Water</option>
          </select>
        </div>
        <div>
          <label className="modal-label">Amount (KES) *</label>
          <input className="modal-input" type="number" min="1" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`Balance: KSh ${activeBalance.toLocaleString()}`} />
        </div>
        <div>
          <label className="modal-label">Method</label>
          <select aria-label="Payment method" className="modal-input" value={method}
            onChange={e => setMethod(e.target.value)}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="modal-label">Note (optional)</label>
        <input className="modal-input" placeholder="e.g. Partial payment" value={note}
          onChange={e => setNote(e.target.value)} />
      </div>

      {/* Balance preview */}
      {tenant && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'rgba(226,238,255,0.55)' }}>
          <span style={{ fontWeight: 700, color: '#e2eeff' }}>{tenant.first_name} {tenant.last_name}</span>
          {' — '}
          {payType === 'rent'
            ? `Rent balance: KSh ${rentBalance.toLocaleString()}`
            : waterRecord
              ? `Water bill: KSh ${waterRecord.amount.toLocaleString()} (${waterRecord.status})`
              : 'No water reading for this period'}
        </div>
      )}

      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn-submit">Record Payment</button>
      </div>
    </form>
  );
};

// ── Data ───────────────────────────────────────────────────────────────────

const OVERDUE_TENANTS = [
  { name: 'James Mwangi',  unit: 'A-104', amount: 18000, days: 14, initials: 'JM', color: '#4f46e5' },
  { name: 'Fatuma Hassan', unit: 'C-301', amount: 25000, days: 9,  initials: 'FH', color: '#ef4444' },
  { name: 'Peter Ochieng', unit: 'B-204', amount: 45000, days: 2,  initials: 'PO', color: '#f59e0b' },
];

const COLLECTION_DATA = [
  { day: 'Sun', amount: 32 },
  { day: 'Mon', amount: 58 },
  { day: 'Tue', amount: 82 },
  { day: 'Wed', amount: 100 },
  { day: 'Thu', amount: 74 },
  { day: 'Fri', amount: 48 },
  { day: 'Sat', amount: 28 },
];

const REVENUE_TREND = [
  { month: 'Jan', value: 720 },
  { month: 'Feb', value: 850 },
  { month: 'Mar', value: 780 },
  { month: 'Apr', value: 920 },
  { month: 'May', value: 1050 },
  { month: 'Jun', value: 850 },
];

const COLLECTION_PIE = [
  { name: 'Collected', value: 87 },
  { name: 'Pending',   value: 13 },
];

const TASKS = [
  { icon: CreditCard, label: 'Review Overdue Rent',    date: 'Jun 22, 2026', color: '#4f46e5' },
  { icon: Wrench,     label: 'Fix Plumbing – Unit A1', date: 'Jun 21, 2026', color: '#ef4444' },
  { icon: Users,      label: 'Tenant Onboarding',      date: 'Jun 24, 2026', color: '#f59e0b' },
];

// ── Counter hook ───────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1400, delay = 300) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const timeout = setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(2, -10 * progress);
        setCount(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return count;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontFamily: 'var(--font-main)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{payload[0].value}%</div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { success, info } = useToast();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Admin';

  const [showPayModal, setShowPayModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef    = useRef<HTMLDivElement>(null);

  // Animated counters
  const props24  = useCounter(24);
  const rev18    = useCounter(18);
  const occ88    = useCounter(88);
  const issues12 = useCounter(12);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSec, setTimerSec] = useState(5048);
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSec(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);
  const hh = String(Math.floor(timerSec / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timerSec % 3600) / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');

  useGSAP(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );
    }
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.gsap-item');
      gsap.fromTo(items,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div ref={headerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Good morning
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>
            {firstName} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Here's what's happening with your properties today.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn-organic btn-secondary" onClick={() => navigate('/payments')}>
            <Download size={15} /> View Payments
          </button>
          <button type="button" className="btn-organic btn-primary" onClick={() => setShowPayModal(true)}>
            <CreditCard size={15} /> Record Payment
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 gsap-item">

        <div className="card-primary relative overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => navigate('/properties')}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -10, width: 70, height: 70, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={18} color="#fff" />
            </div>
            <ArrowUpRight size={16} color="rgba(255,255,255,0.5)" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Properties</div>
          <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, marginBottom: 10 }}>{props24}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
            <TrendingUp size={12} /> +2 this month
          </div>
        </div>

        <div className="card-organic relative overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => navigate('/payments')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#10b981" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total Revenue</div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: 'var(--text-main)' }}>
            {rev18}<span style={{ fontSize: 18, marginLeft: 2 }}>.2M</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#f0fdf4', color: '#10b981', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
            <TrendingUp size={12} /> +12.5%
          </div>
        </div>

        <div className="card-organic relative overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => navigate('/units')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#3b82f6" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Occupancy</div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: 'var(--text-main)' }}>
            {occ88}<span style={{ fontSize: 18 }}>%</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>42 / 48 units filled</div>
        </div>

        <div className="card-organic relative overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => navigate('/maintenance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} color="#ef4444" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Open Issues</div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: 'var(--text-main)' }}>{issues12}</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: '#ef4444' }}>8 maintenance</span>
            <span style={{ color: 'var(--text-muted)' }}> · 4 overdue</span>
          </div>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Collection Analytics – Recharts Bar */}
        <div className="card-organic gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Collection</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>This week</p>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>74%</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={COLLECTION_DATA} barSize={10} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }} />
              <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                {COLLECTION_DATA.map((_, i) => (
                  <Cell key={i} fill={i === 3 ? '#171717' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="card-organic gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Revenue Trend</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>KSh (thousands)</p>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: '#f0fdf4', padding: '4px 10px', borderRadius: 8 }}>↑ 12.5%</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={REVENUE_TREND} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#171717" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontFamily: 'var(--font-main)', fontSize: 12 }}
                formatter={(v: number) => [`KSh ${v}K`, 'Revenue']}
              />
              <Area type="monotone" dataKey="value" stroke="#171717" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#171717' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Tasks */}
        <div className="card-organic gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Priority Tasks</h3>
            <button type="button" onClick={() => success('Task created', 'New task added to your queue')} className="btn-organic btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>+ New</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TASKS.map((task, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <task.icon size={17} color={task.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Due {task.date}</div>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Overdue Payments */}
        <div className="card-organic gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Overdue Payments</h3>
            <button type="button" onClick={() => success('Reminders sent', 'SMS reminders sent to 3 tenants')} className="btn-organic btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}>
              <Bell size={12} /> Remind All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {OVERDUE_TENANTS.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: i !== OVERDUE_TENANTS.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unit {t.unit} · <span style={{ color: '#ef4444', fontWeight: 600 }}>{t.days}d late</span></div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>KSh {t.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Progress – Donut */}
        <div className="card-organic gsap-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Collection Rate</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>June 2026</p>
          </div>
          <div style={{ position: 'relative', width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={COLLECTION_PIE}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={80}
                  startAngle={90} endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill="#171717" />
                  <Cell fill="#f3f4f6" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>87%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>collected</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#171717', display: 'inline-block' }} /> Collected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e5e7eb', display: 'inline-block' }} /> Pending
            </div>
          </div>
        </div>

        {/* Active Session Timer */}
        <div className="gsap-item" style={{ background: '#0a0a0a', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Active Session</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Property Review</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-2px', lineHeight: 1, marginBottom: 28 }}>
              {hh}:{mm}:{ss}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1 }}>
            <button
              type="button"
              onClick={() => setTimerRunning(v => !v)}
              style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
            >
              {timerRunning ? <Pause size={15} /> : <Calendar size={15} />}
              {timerRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={() => { setTimerSec(0); setTimerRunning(false); success('Session ended', 'Session logged successfully'); }}
              style={{ width: 44, height: 44, borderRadius: 12, background: '#ef4444', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#dc2626'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#ef4444'}
            >
              <Square size={15} fill="#fff" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Pay modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)}
        title="Record Payment" description="Log a rent or water payment for any tenant and month.">
        <QuickPayModal onClose={() => setShowPayModal(false)} />
      </Modal>
    </div>
  );
};
