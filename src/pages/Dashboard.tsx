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
import { usePropertyStore } from '@/stores/propertyStore';
import { useUnitStore } from '@/stores/unitStore';
import { useMaintenanceStore } from '@/stores/maintenanceStore';

// ── Quick Pay modal (dashboard shortcut) ────────────────────────────────────

const METHODS = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque'];

const QuickPayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tenants, rentRecords, waterReadings, recordPayment, recordWaterPayment, ensureRentRecord } = useBillingStore();
  const { success } = useToast();
  const activeTenants = tenants.filter(t => t.status === 'active');
  const periods = getAvailablePeriods();

  const [tenantId, setTenantId]   = useState<string>(activeTenants[0]?.id ?? '');
  const [periodKey, setPeriodKey] = useState(CURRENT_PERIOD_KEY);
  const [payType, setPayType]     = useState<'rent' | 'water'>('rent');
  const [method, setMethod]       = useState('M-PESA');
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');
  const [err, setErr]             = useState('');

  // Compute balances fresh every render
  const tenant       = activeTenants.find(t => t.id === tenantId);
  const rentRecord   = rentRecords.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
  const waterRecord  = waterReadings.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
  const rentBalance  = rentRecord ? rentRecord.balance : (tenant?.rent_amount ?? 0);
  const waterBalance = waterRecord?.balance ?? 0;
  const activeBalance = payType === 'rent' ? rentBalance : waterBalance;

  // Auto-fill amount — compute INSIDE the effect to avoid stale closure
  React.useEffect(() => {
    const t    = activeTenants.find(x => x.id === tenantId);
    const rRec = rentRecords.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
    const wRec = waterReadings.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
    const rBal = rRec ? rRec.balance : (t?.rent_amount ?? 0);
    const wBal = wRec?.balance ?? 0;
    const bal  = payType === 'rent' ? rBal : wBal;
    setAmount(String(bal > 0 ? bal : ''));
    setErr('');
  }, [tenantId, periodKey, payType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    const n = Number(amount);
    if (!n || n <= 0) { setErr('Enter a valid amount.'); return; }
    setErr('');

    const { year, month } = parsePeriodKey(periodKey);

    if (payType === 'rent') {
      await ensureRentRecord(tenantId, year, month);
      const res: any = await recordPayment(tenantId, periodKey, n, method, note || undefined);
      if (res && res.error) {
        setErr(res.error);
        return;
      }
      success('Rent payment recorded', `KSh ${n.toLocaleString()} — ${tenant.first_name} ${tenant.last_name}`);
    } else {
      if (!waterRecord) { setErr('No water reading for this period.'); return; }
      if (waterRecord.status === 'paid') { setErr('Water bill already paid for this period.'); return; }
      if (n > waterBalance) { setErr(`Amount exceeds water balance of KSh ${waterBalance.toLocaleString()}.`); return; }
      const res = await recordWaterPayment(waterRecord.id, n);
      if (res?.error) { setErr(res.error); return; }
      success('Water payment recorded', `KSh ${n.toLocaleString()} — Unit ${tenant.unit}`);
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
            onChange={e => setTenantId(e.target.value)}>
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
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>
          <span style={{ fontWeight: 700, color: '#111827' }}>{tenant.first_name} {tenant.last_name}</span>
          {' — '}
          {payType === 'rent'
            ? `Rent balance: KSh ${rentBalance.toLocaleString()}`
            : waterRecord
              ? `Water ${waterRecord.status}: KSh ${waterRecord.balance.toLocaleString()} of KSh ${waterRecord.amount.toLocaleString()}`
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

// (All dashboard data is now computed from live stores - see lines 230+)

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
  const { profile, sessionStartTime, lastActivity } = useAuthStore();
  const { tenants, rentRecords, getTenantOutstanding, getTenantRentHistory, getRentForPeriod } = useBillingStore();
  const { properties } = usePropertyStore();
  const { units } = useUnitStore();
  const { tickets } = useMaintenanceStore();

  const navigate = useNavigate();
  const { success, info } = useToast();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Admin';

  const [showPayModal, setShowPayModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef    = useRef<HTMLDivElement>(null);

  // Computed data
  const hasData = properties.length > 0 || tenants.length > 0;

  const currentMonthRecs = rentRecords.filter(r => r.period_key === CURRENT_PERIOD_KEY);
  const totalRentDue = currentMonthRecs.reduce((sum, r) => sum + r.rent_due, 0);
  const totalRentPaid = currentMonthRecs.reduce((sum, r) => sum + r.amount_paid, 0);
  const pendingRent = totalRentDue - totalRentPaid;

  const COLLECTION_PIE = totalRentDue > 0 
    ? [ { name: 'Collected', value: Math.round((totalRentPaid/totalRentDue)*100) }, { name: 'Pending', value: Math.round((pendingRent/totalRentDue)*100) } ]
    : [ { name: 'Pending', value: 100 } ];

  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;
  const occupancyPercentage = units.length > 0 ? Math.round((activeTenantsCount / units.length) * 100) : 0;

  const OVERDUE_TENANTS = tenants.map(t => {
    const outstanding = getTenantOutstanding(t.id);
    let daysOverdue = 0;
    if (outstanding > 0) {
      const history = getTenantRentHistory(t.id);
      const oldestUnpaid = history.filter(r => r.balance > 0).sort((a, b) => a.period_key.localeCompare(b.period_key))[0];
      if (oldestUnpaid) {
        const [y, m] = oldestUnpaid.period_key.split('-').map(Number);
        const dueDate = new Date(y, m - 1, 5); // 5th of that month
        const today = new Date();
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        daysOverdue = Math.max(0, diffDays);
      }
    }
    return { ...t, amount: outstanding, name: `${t.first_name} ${t.last_name}`, initials: `${t.first_name?.[0] || ''}${t.last_name?.[0] || ''}`, days: daysOverdue, color: '#ef4444' };
  }).filter(t => t.amount > 0).sort((a,b) => b.amount - a.amount).slice(0, 3);

  const pendingTickets = tickets.filter(t => t.status !== 'resolved');
  
  const TASKS = pendingTickets.slice(0,3).map(t => ({
    icon: Wrench, label: `${t.title} – ${t.unit}`, date: t.date, color: t.priority === 'High' ? '#ef4444' : '#f59e0b'
  }));

  // All-time collected revenue (not just current month)
  const allTimeCollected = rentRecords.reduce((sum, r) => sum + r.amount_paid, 0);
  const revMillions = allTimeCollected / 1_000_000;

  const currentMonthNum = new Date().getMonth();
  const createdThisMonth = properties.filter(p => {
    try { return new Date(p.created_at || '').getMonth() === currentMonthNum; } catch { return false; }
  }).length;

  // Weekly collection from actual rent_transactions
  const COLLECTION_DATA = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const todayDay = today.getDay(); // 0 = Sun
    const allTxns = rentRecords.flatMap(r => r.transactions ?? []);

    return days.map((day, i) => {
      const diff = i - todayDay;
      const d = new Date(today);
      d.setDate(today.getDate() + diff);
      const dateStr = d.toISOString().split('T')[0];
      const total = allTxns
        .filter(t => t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      return { day, amount: Math.round(total / 1000), isToday: i === todayDay };
    });
  }, [rentRecords]);

  const weeklyCollected = COLLECTION_DATA.reduce((s, d) => s + d.amount, 0);
  const weeklyTotal = currentMonthRecs.reduce((s, r) => s + r.rent_due, 0) / 1000;
  const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyCollected / weeklyTotal) * 100) : 0;

  // Animated counters
  const props24  = useCounter(properties.length);
  const rev18    = useCounter(revMillions * 10, 1400, 300);
  const occ88    = useCounter(occupancyPercentage);
  const issues12 = useCounter(pendingTickets.length);

  // Timer state based on active session
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSec, setTimerSec] = useState(0);
  
  useEffect(() => {
    if (!timerRunning || !sessionStartTime) return;
    
    // Initial calculation
    setTimerSec(Math.floor((Date.now() - sessionStartTime) / 1000));
    
    const id = setInterval(() => {
      setTimerSec(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, sessionStartTime]);

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const currentDayOfWeek = new Date().getDay(); // 0 is Sunday, 6 is Saturday


  const periods = getAvailablePeriods();

  const revenueTrend = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return periods.slice(0, 6).reverse().map(p => {
      const recs = getRentForPeriod(p.key);
      const collected = recs.reduce((sum, r) => sum + r.amount_paid, 0);
      const { month } = parsePeriodKey(p.key);
      return { month: monthNames[month - 1], value: collected / 1000 };
    });
  }, [periods, getRentForPeriod]);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div ref={headerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {greeting}
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
            <TrendingUp size={12} /> +{createdThisMonth} this month
          </div>
        </div>

        <div className="card-organic relative overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => navigate('/payments')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#10b981" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Monthly Expected</div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: 'var(--text-main)' }}>
            {(() => {
              const expected = tenants.filter(t => t.status === 'active').reduce((s, t) => s + t.rent_amount, 0);
              return expected >= 1_000_000
                ? `${(expected / 1_000_000).toFixed(1)}M`
                : expected >= 1_000
                ? `${Math.round(expected / 1_000)}K`
                : expected.toLocaleString();
            })()}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#f0fdf4', color: '#10b981', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
            <TrendingUp size={12} /> Collected: KSh {totalRentPaid.toLocaleString()}
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
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{activeTenantsCount} / {units.length} units filled</div>
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
            <span style={{ color: '#ef4444' }}>{pendingTickets.length} maintenance</span>
            <span style={{ color: 'var(--text-muted)' }}> · {OVERDUE_TENANTS.length} overdue rent</span>
          </div>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="card-organic gsap-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Collection</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>This week</p>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>
              {totalRentDue > 0 ? Math.round((totalRentPaid / totalRentDue) * 100) : weeklyPct}%
            </span>
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
                  <Cell key={i} fill={i === currentDayOfWeek ? '#171717' : '#e5e7eb'} />
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
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: '#f0fdf4', padding: '4px 10px', borderRadius: 8 }}>Live Data</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenueTrend} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
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
            {TASKS.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', background: 'var(--surface-hover)', borderRadius: 12 }}>
                <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Inbox zero</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No pending tasks for today.</div>
              </div>
            ) : TASKS.map((task, i) => (
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
            {OVERDUE_TENANTS.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', background: 'var(--surface-hover)', borderRadius: 12 }}>
                <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>All caught up!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No overdue rent at the moment.</div>
              </div>
            ) : OVERDUE_TENANTS.map((t, i) => (
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
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
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
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{COLLECTION_PIE[0]?.value || 0}%</div>
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
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{lastActivity || 'Dashboard view'}</div>
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
