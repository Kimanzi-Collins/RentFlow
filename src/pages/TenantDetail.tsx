import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  ArrowLeft, CreditCard, Droplets, Edit3, Download, FileText,
  CheckCircle2, AlertCircle, Clock, ArrowRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadTenantStatement, downloadReceipt } from '@/lib/export';
import {
  useBillingStore,
  getAvailablePeriods,
  parsePeriodKey,
  CURRENT_PERIOD_KEY,
} from '@/stores/billingStore';
import type { RentRecord } from '@/stores/billingStore';

// ─── Pay modal (inline — uses existing record or creates one) ─────────────────

const METHODS = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque'];

const PayModal: React.FC<{
  tenantId: string; record: RentRecord; onClose: () => void;
}> = ({ tenantId, record, onClose }) => {
  const { recordPayment } = useBillingStore();
  const { success } = useToast();
  const [amount, setAmount] = useState(String(record.balance));
  const [method, setMethod] = useState('M-PESA');
  const [note, setNote]     = useState('');
  const [err, setErr]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0)      { setErr('Enter a valid amount.'); return; }
    if (n > record.balance) { setErr(`Exceeds outstanding balance of KSh ${record.balance.toLocaleString()}.`); return; }
    setErr('');
    
    setIsSubmitting(true);
    try {
      const res: any = await recordPayment(tenantId, record.period_key, n, method, note || undefined);
      if (res && res.error) {
        setErr(res.error);
        return;
      }
      
      success('Payment recorded', `KSh ${n.toLocaleString()} applied to ${record.period}`);

      const { rentRecords, waterReadings, tenants } = useBillingStore.getState();
      const tenant = tenants.find(t => t.id === tenantId);
      const updatedRent = rentRecords.find(r => r.id === record.id);
      const updatedWater = waterReadings.find(r => r.tenant_id === tenantId && r.period_key === record.period_key);
      
      const isRentPaid = updatedRent?.status === 'paid';
      const isWaterPaid = !updatedWater || updatedWater.status === 'paid';
      
      if (isRentPaid && isWaterPaid && updatedRent && tenant) {
        const periodName = updatedRent.period;
        const rentTotal = updatedRent.amount_paid;
        const waterTotal = updatedWater ? updatedWater.amount_paid : 0;
        downloadReceipt(tenant, periodName, rentTotal, waterTotal, method, updatedWater);
        success('Receipt generated', 'Rent and water fully paid for this period.');
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{record.period}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          Rent due: KSh {record.rent_due.toLocaleString()} · Paid: KSh {record.amount_paid.toLocaleString()} · Balance: KSh {record.balance.toLocaleString()}
        </div>
      </div>
      <div className="modal-form-grid">
        <div>
          <label className="modal-label">Amount (KES) *</label>
          <input className="modal-input" type="number" min="1" max={record.balance} value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="modal-label">Payment Method</label>
          <select aria-label="Payment method" className="modal-input" value={method} onChange={e => setMethod(e.target.value)}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="modal-label">Note (optional)</label>
        <input className="modal-input" placeholder="e.g. Partial, balance on 25th" value={note} onChange={e => setNote(e.target.value)} />
      </div>
      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};

// ─── Edit rent modal ──────────────────────────────────────────────────────────

const EditRentModal: React.FC<{
  tenantId: string; currentRent: number; onClose: () => void;
}> = ({ tenantId, currentRent, onClose }) => {
  const { updateTenant } = useBillingStore();
  const { success } = useToast();
  const [rent, setRent] = useState(String(currentRent));
  const [err, setErr]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(rent);
    if (!n || n <= 0) { setErr('Enter a valid rent amount.'); return; }
    setErr('');
    setIsSubmitting(true);
    try {
      await updateTenant(tenantId, { rent_amount: n });
      success('Rent updated', `New monthly rent: KSh ${n.toLocaleString()}`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}
      <div>
        <label className="modal-label">Monthly Rent (KES)</label>
        <input className="modal-input" type="number" min="1" value={rent} onChange={e => setRent(e.target.value)} autoFocus />
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
        This will apply to future billing periods. Existing rent records are not affected.
      </p>
      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Rent'}
        </button>
      </div>
    </form>
  );
};

// ─── Edit water rate modal ────────────────────────────────────────────────────

const EditWaterRateModal: React.FC<{
  tenantId: string; currentRate: number; onClose: () => void;
}> = ({ tenantId, currentRate, onClose }) => {
  const { updateTenant } = useBillingStore();
  const { success } = useToast();
  const [rate, setRate] = useState(String(currentRate));
  const [err, setErr]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(rate);
    if (!n || n <= 0) { setErr('Enter a valid rate.'); return; }
    setErr('');
    setIsSubmitting(true);
    try {
      await updateTenant(tenantId, { water_rate: n });
      success('Water rate updated', `New rate: KSh ${n}/m³`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}
      <div>
        <label className="modal-label">Rate per m³ (KES)</label>
        <input className="modal-input" type="number" step="0.1" min="1" value={rate} onChange={e => setRate(e.target.value)} autoFocus />
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
        This sets the default rate for future water readings. You can still override per reading in Water Billing.
      </p>
      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Rate'}
        </button>
      </div>
    </form>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const {
    tenants, getTenantRentHistory, getTenantWaterHistory,
    getTenantOutstanding, ensureRentRecord,
  } = useBillingStore();

  const tenantId = id ?? '';
  const tenant = tenants.find(t => t.id === tenantId);

  const [tab, setTab]               = useState<'rent' | 'water'>('rent');
  const [payModal, setPayModal]     = useState<RentRecord | null>(null);
  const [editRent, setEditRent]     = useState(false);
  const [editWater, setEditWater]   = useState(false);

  useGSAP(() => {
    gsap.fromTo('.detail-row',
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
    );
  }, { dependencies: [tab, tenantId] });

  if (!tenant) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Tenant not found.</p>
        <button type="button" className="btn-organic btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/tenants')}>
          Back to Tenants
        </button>
      </div>
    );
  }

  const rentHistory  = getTenantRentHistory(tenantId);
  const waterHistory = getTenantWaterHistory(tenantId);
  const outstanding  = getTenantOutstanding(tenantId);
  const waterOutstanding = waterHistory
    .filter(r => r.status !== 'paid')
    .reduce((s, r) => s + r.balance, 0);
  const initials     = `${tenant.first_name?.[0] || ''}${tenant.last_name?.[0] || ''}`.toUpperCase();

  // Chart data (last 6 months, oldest first)
  const rentChartData = rentHistory.slice(0, 6).reverse().map(r => ({
    month: r.period.replace(/\s+\d{4}$/, '').slice(0, 3),
    due:   r.rent_due,
    paid:  r.amount_paid,
  }));
  const waterChartData = waterHistory.slice(0, 6).reverse().map(r => ({
    month:    r.period.replace(/\s+\d{4}$/, '').slice(0, 3),
    consumed: r.units_consumed,
    bill:     r.amount,
  }));

  function handleDownloadStatement() {
    downloadTenantStatement(tenant, rentHistory, waterHistory);
  }
  function handleExportRent() {
    downloadTenantStatement(tenant, rentHistory, []);
  }
  function handleExportWater() {
    downloadTenantStatement(tenant, [], waterHistory);
  }

  function handleDownloadReceipt(record: RentRecord) {
    if (!tenant) return;
    const wRecord = waterHistory.find(w => w.period_key === record.period_key);
    const method = record.transactions.length > 0 ? record.transactions[record.transactions.length - 1].method : 'System';
    const rentPaid = record.amount_paid;
    const waterPaid = wRecord ? wRecord.amount_paid : 0;
    downloadReceipt(tenant, record.period, rentPaid, waterPaid, method, wRecord);
  }

  // Ensure rent records exist for all available periods when user views rent tab
  function handleRentTabClick() {
    const periods = getAvailablePeriods();
    periods.forEach(p => {
      const { year, month } = parsePeriodKey(p.key);
      ensureRentRecord(tenantId, year, month);
    });
    setTab('rent');
  }

  const RENT_STATUS = {
    paid:    { icon: <CheckCircle2 size={14} color="#059669" />, color: '#059669', bg: '#ecfdf5', label: 'Paid'    },
    partial: { icon: <Clock size={14} color="#2563eb" />,        color: '#2563eb', bg: '#eff6ff', label: 'Partial' },
    unpaid:  { icon: <AlertCircle size={14} color="#dc2626" />,  color: '#dc2626', bg: '#fef2f2', label: 'Unpaid'  },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>

      {/* Back link */}
      <button type="button" onClick={() => navigate('/tenants')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit', padding: 0, alignSelf: 'flex-start' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={14} /> Tenants
      </button>

      {/* Tenant header card */}
      <div className="card-organic" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#171717', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {tenant.first_name} {tenant.last_name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Unit {tenant.unit} · {tenant.property}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                KSh {tenant.rent_amount.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/month</span>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Water rate: KSh {tenant.water_rate}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/m³</span>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Since {new Date(tenant.move_in_date).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          {/* Outstanding balances */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{
              background: outstanding > 0 ? '#fef2f2' : '#ecfdf5',
              color: outstanding > 0 ? '#dc2626' : '#059669',
              borderRadius: 12, padding: '10px 16px', textAlign: 'right',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Rent Outstanding</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>KSh {outstanding.toLocaleString()}</div>
            </div>
            {waterHistory.length > 0 && (
              <div style={{
                background: waterOutstanding > 0 ? '#fffbeb' : '#ecfdf5',
                color: waterOutstanding > 0 ? '#d97706' : '#059669',
                borderRadius: 12, padding: '10px 16px', textAlign: 'right',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Water Outstanding</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>KSh {waterOutstanding.toLocaleString()}</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-icon" onClick={handleDownloadStatement} title="Download full statement" style={{ width: 36, height: 36 }}>
              <FileText size={16} />
            </button>
            <button type="button" className="btn-organic btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => setEditWater(true)}>
              <Droplets size={14} /> Water Rate
            </button>
            <button type="button" className="btn-organic btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => setEditRent(true)}>
              <Edit3 size={14} /> Adjust Rent
            </button>
            {outstanding > 0 && rentHistory.filter(r => r.status !== 'paid')[0] && (
              <button type="button" className="btn-organic btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}
                onClick={() => setPayModal(rentHistory.filter(r => r.status !== 'paid')[0])}>
                <CreditCard size={14} /> Record Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      {(rentChartData.length > 0 || waterChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {rentChartData.length > 0 && (
            <div className="card-organic">
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Rent Payment Trend</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Due vs. paid (KES) — last 6 months</p>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={rentChartData} barSize={12} barGap={3} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontFamily: 'var(--font-main)', fontSize: 12 }}
                    formatter={(v: number, name: string) => [`KSh ${v.toLocaleString()}`, name === 'due' ? 'Rent Due' : 'Paid']}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  />
                  <Bar dataKey="due"  fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#e5e7eb', display: 'inline-block' }} />Due</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#171717', display: 'inline-block' }} />Paid</span>
              </div>
            </div>
          )}
          {waterChartData.length > 0 && (
            <div className="card-organic">
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Water Consumption</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>m³ consumed — last 6 months</p>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={waterChartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4d7cff" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4d7cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontFamily: 'var(--font-main)', fontSize: 12 }}
                    formatter={(v: number, name: string) => [name === 'consumed' ? `${v} m³` : `KSh ${v.toLocaleString()}`, name === 'consumed' ? 'Consumed' : 'Bill']}
                  />
                  <Area type="monotone" dataKey="consumed" stroke="#4d7cff" strokeWidth={2} fill="url(#waterGrad)" dot={{ fill: '#4d7cff', r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 4, alignSelf: 'flex-start' }}>
        {[
          { key: 'rent',  label: 'Rent History',  icon: <CreditCard size={14} />, onClick: handleRentTabClick },
          { key: 'water', label: 'Water Billing', icon: <Droplets size={14} />,  onClick: () => setTab('water') },
        ].map(t => (
          <button key={t.key} type="button" onClick={t.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              background: tab === t.key ? '#171717' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Rent History Tab ── */}
      {tab === 'rent' && (
        <div className="card-organic" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Payment History</h3>
            <button type="button" className="btn-icon" onClick={handleExportRent} title="Download PDF" style={{ width: 34, height: 34 }}>
              <Download size={15} />
            </button>
          </div>
          <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
            <table className="table-organic w-full">
              <thead>
                <tr>
                  <th>Period</th>
                  <th style={{ textAlign: 'right' }}>Rent Due</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                  <th>Status</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rentHistory.map(record => {
                  const rs = RENT_STATUS[record.status];
                  return (
                    <tr key={record.id} className="detail-row">
                      <td style={{ fontWeight: 600 }}>{record.period}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>KSh {record.rent_due.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: record.amount_paid > 0 ? '#059669' : 'var(--text-muted)' }}>
                        KSh {record.amount_paid.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: record.balance > 0 ? '#dc2626' : '#059669' }}>
                        KSh {record.balance.toLocaleString()}
                      </td>
                      <td>
                        <span className="badge" style={{ background: rs.bg, color: rs.color }}>
                          {rs.icon} <span style={{ marginLeft: 4 }}>{rs.label}</span>
                        </span>
                      </td>
                      <td>
                        {record.status !== 'paid' && (
                          <button type="button" className="btn-organic btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}
                            onClick={() => setPayModal(record)}>
                            Pay
                          </button>
                        )}
                        {record.amount_paid > 0 && (
                          <button type="button" className="btn-organic btn-secondary" style={{ padding: '5px 12px', fontSize: 12, marginLeft: record.status !== 'paid' ? 6 : 0 }}
                            onClick={() => handleDownloadReceipt(record)}>
                            Receipt
                          </button>
                        )}
                        {record.transactions.length > 0 && (
                          <details style={{ marginTop: record.status !== 'paid' ? 6 : 0 }}>
                            <summary style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ArrowRight size={10} /> {record.transactions.length} transaction{record.transactions.length > 1 ? 's' : ''}
                            </summary>
                            {record.transactions.map(txn => (
                              <div key={txn.id} style={{ marginTop: 6, padding: '6px 10px', background: '#f9fafb', borderRadius: 8, fontSize: 12 }}>
                                <span style={{ fontWeight: 700 }}>KSh {txn.amount.toLocaleString()}</span>
                                <span style={{ color: 'var(--text-muted)' }}> via {txn.method} · {txn.date}</span>
                                {txn.note && <span style={{ color: 'var(--text-muted)' }}> · {txn.note}</span>}
                              </div>
                            ))}
                          </details>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rentHistory.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No rent records yet.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Water History Tab ── */}
      {tab === 'water' && (
        <div className="card-organic" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Water Billing History</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Initial reading: <strong>{tenant.initial_water_reading.toLocaleString()} m³</strong>
              </span>
              <button type="button" className="btn-icon" onClick={handleExportWater} title="Download PDF" style={{ width: 34, height: 34 }}>
                <Download size={15} />
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
            <table className="table-organic w-full">
              <thead>
                <tr>
                  <th>Period</th>
                  <th style={{ textAlign: 'right' }}>Prev (m³)</th>
                  <th style={{ textAlign: 'right' }}>Curr (m³)</th>
                  <th style={{ textAlign: 'right' }}>Consumed</th>
                  <th style={{ textAlign: 'right' }}>Bill (KES)</th>
                  <th style={{ textAlign: 'right' }}>Paid (KES)</th>
                  <th style={{ textAlign: 'right' }}>Balance (KES)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {waterHistory.map(r => (
                  <tr key={r.id} className="detail-row">
                    <td style={{ fontWeight: 600 }}>{r.period}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>{r.prev_reading.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.curr_reading.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.units_consumed.toLocaleString()} m³</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>KSh {r.amount.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: r.amount_paid > 0 ? '#059669' : 'var(--text-muted)' }}>
                      KSh {r.amount_paid.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: r.balance > 0 ? '#dc2626' : '#059669' }}>
                      KSh {r.balance.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'paid' ? 'badge-success' : (r.status === 'partial' ? 'badge-info' : 'badge-warning')}`}>
                        <span className="badge-dot" />
                        {r.status === 'paid' ? 'Paid' : (r.status === 'partial' ? 'Partial' : 'Outstanding')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {waterHistory.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No water readings recorded yet. Go to{' '}
                <button type="button" onClick={() => navigate('/water')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 700, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Water Billing
                </button>{' '}
                to record the first reading.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)}
        title="Record Payment" description={payModal ? `Apply payment to ${payModal.period}` : ''}>
        {payModal && (
          <PayModal tenantId={tenantId} record={payModal} onClose={() => setPayModal(null)} />
        )}
      </Modal>

      <Modal isOpen={editRent} onClose={() => setEditRent(false)}
        title="Adjust Monthly Rent" description={`Current rent: KSh ${tenant.rent_amount.toLocaleString()}/month`}>
        <EditRentModal tenantId={tenantId} currentRent={tenant.rent_amount} onClose={() => setEditRent(false)} />
      </Modal>

      <Modal isOpen={editWater} onClose={() => setEditWater(false)}
        title="Adjust Water Rate" description={`Current rate: KSh ${tenant.water_rate}/m³`}>
        <EditWaterRateModal tenantId={tenantId} currentRate={tenant.water_rate} onClose={() => setEditWater(false)} />
      </Modal>
    </div>
  );
};
