import React, { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Download, ChevronDown, Check, TrendingUp, DollarSign,
  AlertTriangle, CreditCard, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF, downloadReceipt } from '@/lib/export';
import {
  useBillingStore,
  getAvailablePeriods,
  parsePeriodKey,
  CURRENT_PERIOD_KEY,
} from '@/stores/billingStore';
import type { TenantConfig, RentRecord } from '@/stores/billingStore';

// ─── Revenue trend (static for now, will be dynamic with Supabase) ──────────

// Revenue trend will be computed dynamically inside the component

// ─── Payment modal ────────────────────────────────────────────────────────────

const METHODS = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque'];

interface PayModalProps {
  tenant: TenantConfig;
  record: RentRecord | null;
  initialPeriodKey: string;
  onClose: () => void;
}

const PayModal: React.FC<PayModalProps> = ({ tenant, record, initialPeriodKey, onClose }) => {
  const { recordPayment, recordWaterPayment, waterReadings, rentRecords, ensureRentRecord } = useBillingStore();
  const { success } = useToast();
  const periods = getAvailablePeriods();

  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriodKey);
  const [payType, setPayType] = useState<'rent' | 'water'>('rent');
  const [method, setMethod]   = useState('M-PESA');
  const [note, setNote]       = useState('');
  const [err, setErr]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute balances fresh every render so switching period/type always shows correct amounts
  const periodRecord   = rentRecords.find(r => r.tenant_id === tenant.id && r.period_key === selectedPeriod) ?? record;
  const rentBalance    = periodRecord ? periodRecord.balance : tenant.rent_amount;
  // All outstanding water readings for this tenant (across all periods)
  const outstandingWater = waterReadings.filter(r => r.tenant_id === tenant.id && r.status === 'outstanding');
  const waterReading   = waterReadings.find(r => r.tenant_id === tenant.id && r.period_key === selectedPeriod);
  const periodWaterBal = waterReading?.balance ?? 0;
  const totalWaterBal  = outstandingWater.reduce((s, r) => s + r.balance, 0);

  const [amount, setAmount] = useState(String(rentBalance > 0 ? rentBalance : ''));

  // Recompute amount whenever tenant / period / type changes — compute fresh inside effect
  React.useEffect(() => {
    const rRec  = rentRecords.find(r => r.tenant_id === tenant.id && r.period_key === selectedPeriod) ?? record;
    const rBal  = rRec ? rRec.balance : tenant.rent_amount;
    const wRec  = waterReadings.find(r => r.tenant_id === tenant.id && r.period_key === selectedPeriod);
    const wBal  = wRec?.balance ?? 0;
    const bal   = payType === 'rent' ? rBal : wBal;
    setAmount(String(bal > 0 ? bal : ''));
    setErr('');
  }, [payType, selectedPeriod, tenant.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) { setErr('Enter a valid amount.'); return; }

    
    setIsSubmitting(true);
    try {
      if (payType === 'rent') {
        const { year, month } = parsePeriodKey(selectedPeriod);
        await ensureRentRecord(tenant.id, year, month);
        if (n > rentBalance) { setErr(`Amount exceeds rent balance of KSh ${rentBalance.toLocaleString()}.`); return; }
        setErr('');
        const res: any = await recordPayment(tenant.id, selectedPeriod, n, method, note || undefined);
        if (res && res.error) { setErr(res.error); return; }
        success('Rent payment recorded', `KSh ${n.toLocaleString()} — ${tenant.first_name} ${tenant.last_name}`);
      } else {
        if (!waterReading) { setErr('No water reading found for this period. Select the correct month.'); return; }
        if (waterReading.status === 'paid') { setErr('Water bill for this period is already fully paid.'); return; }
        if (n > periodWaterBal) { setErr(`Amount exceeds water balance of KSh ${periodWaterBal.toLocaleString()}.`); return; }
        setErr('');
        const res = await recordWaterPayment(waterReading.id, n);
        if (res?.error) { setErr(res.error); return; }
        success('Water payment recorded', `KSh ${n.toLocaleString()} — Unit ${tenant.unit}`);
      }

      // Check if both rent and water are fully paid for this period after payment
      const { rentRecords, waterReadings } = useBillingStore.getState();
      const updatedRent = rentRecords.find(r => r.tenant_id === tenant.id && r.period_key === selectedPeriod);
      const updatedWater = waterReadings.find(r => r.tenant_id === tenant.id && r.period_key === selectedPeriod);
      
      const isRentPaid = updatedRent?.status === 'paid';
      const hasWaterRecord = !!updatedWater;
      const isWaterPaid = updatedWater?.status === 'paid';
      
      if (isRentPaid && hasWaterRecord && isWaterPaid && updatedRent) {
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

      {/* Tenant summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {(tenant.first_name?.[0] || '') + (tenant.last_name?.[0] || '')}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{tenant.first_name} {tenant.last_name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Unit {tenant.unit}</div>
        </div>
      </div>

      {/* Billing period selector */}
      <div>
        <label className="modal-label">Billing Month</label>
        <select aria-label="Billing month" className="modal-input" value={selectedPeriod}
          onChange={e => setSelectedPeriod(e.target.value)}>
          {periods.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {/* Payment type selector */}
      <div>
        <label className="modal-label">Payment Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {([
            { key: 'rent',  label: '🏠 Rent',  desc: `KSh ${rentBalance.toLocaleString()} outstanding`  },
            { key: 'water', label: '💧 Water', desc: waterReading ? (waterReading.status === 'paid' ? '✓ Paid' : `KSh ${periodWaterBal.toLocaleString()} outstanding`) : totalWaterBal > 0 ? `KSh ${totalWaterBal.toLocaleString()} across all periods` : 'No outstanding water bills' },
          ] as const).map(t => (
            <button key={t.key} type="button" onClick={() => setPayType(t.key)}
              style={{
                padding: '10px 14px', borderRadius: 10,
                border: `2px solid ${payType === t.key ? '#171717' : '#e5e7eb'}`,
                background: payType === t.key ? '#171717' : '#f9fafb',
                color: payType === t.key ? '#ffffff' : '#374151',
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.18s',
              }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: payType === t.key ? 'rgba(255,255,255,0.65)' : '#6b7280', marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="modal-form-grid">
        <div>
          <label className="modal-label">{payType === 'rent' ? 'Amount (KES) *' : 'Bill Amount (KES)'}</label>
          <input
            className="modal-input"
            type="number" min="1"
            max={payType === 'rent' ? rentBalance : waterBalance}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            readOnly={payType === 'water'}
            style={payType === 'water' ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          />
        </div>
        <div>
          <label className="modal-label">Payment Method</label>
          <select aria-label="Payment method" className="modal-input" value={method} onChange={e => setMethod(e.target.value)}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {payType === 'rent' && (
        <div>
          <label className="modal-label">Note (optional)</label>
          <input className="modal-input" placeholder="e.g. Partial, balance on Friday" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      )}

      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const Payments: React.FC = () => {
  const {
    tenants, rentRecords,
    getRentForPeriod, ensureRentRecord,
  } = useBillingStore();
  const navigate = useNavigate();
  const { success } = useToast();

  const periods = getAvailablePeriods();
  const [selectedPeriod, setSelectedPeriod] = useState(CURRENT_PERIOD_KEY);
  const [showPeriodDrop, setPeriodDrop]     = useState(false);
  const [payModal, setPayModal]             = useState<{ tenant: TenantConfig; record: RentRecord | null } | null>(null);
  const periodDropRef = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  const { year, month }  = parsePeriodKey(selectedPeriod);
  const selectedLabel    = periods.find(p => p.key === selectedPeriod)?.label ?? '';
  const activeTenants    = tenants.filter(t => t.status === 'active');
  const periodRecords    = getRentForPeriod(selectedPeriod);

  // Build the full table: one row per active tenant whose move-in is on/before the selected period
  const rows = activeTenants
    .filter(tenant => {
      if (!tenant.move_in_date) return true;
      return tenant.move_in_date.slice(0, 7) <= selectedPeriod;
    })
    .map(tenant => {
    const record = periodRecords.find(r => r.tenant_id === tenant.id) ?? null;
    const rentDue = record?.rent_due ?? tenant.rent_amount;
    const paid    = record?.amount_paid ?? 0;
    const balance = record?.balance ?? rentDue;
    const status  = record?.status ?? 'unpaid';
    return { tenant, record, rentDue, paid, balance, status };
  });

  const totalExpected  = rows.reduce((s, r) => s + r.rentDue, 0);
  const totalCollected = rows.reduce((s, r) => s + r.paid, 0);
  const totalBalance   = rows.reduce((s, r) => s + r.balance, 0);
  const collectionPct  = totalExpected ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Sort: unpaid/partial first, then paid
  const sortedRows = [...rows].sort((a, b) => {
    const order = { unpaid: 0, partial: 1, paid: 2 };
    return order[a.status] - order[b.status];
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueTrendData = React.useMemo(() => {
    return periods.slice(0, 6).reverse().map(p => {
      const recs = getRentForPeriod(p.key);
      const expected = tenants.reduce((s, t) => {
        const rec = recs.find(r => r.tenant_id === t.id);
        if (rec) return s + rec.rent_due;
        return s + (t.status === 'active' ? t.rent_amount : 0);
      }, 0);
      const collected = recs.reduce((s, r) => s + r.amount_paid, 0);
      const { month } = parsePeriodKey(p.key);
      return { month: monthNames[month - 1], expected, collected };
    });
  }, [periods, tenants, getRentForPeriod]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (periodDropRef.current && !periodDropRef.current.contains(e.target as Node)) setPeriodDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useGSAP(() => {
    const items = containerRef.current?.querySelectorAll('.gsap-item');
    if (items) gsap.fromTo(items, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' });
  }, { scope: containerRef, dependencies: [selectedPeriod] });

  function handleExport() {
    downloadPDF(`rent-payments-${selectedPeriod}.pdf`, sortedRows.map(r => ({
      Period: selectedLabel,
      Tenant: `${r.tenant.first_name} ${r.tenant.last_name}`,
      Unit: r.tenant.unit,
      'Rent Due (KES)': r.rentDue.toLocaleString(),
      'Paid (KES)': r.paid.toLocaleString(),
      'Balance (KES)': r.balance.toLocaleString(),
      Status: r.status,
    })));
  }

  const STATUS_STYLE = {
    paid:    { bg: '#ecfdf5', color: '#059669', label: 'Paid'     },
    partial: { bg: '#eff6ff', color: '#2563eb', label: 'Partial'  },
    unpaid:  { bg: '#fef2f2', color: '#dc2626', label: 'Unpaid'   },
  };

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Rent Payments</h1>
          <p className="page-subtitle">Monthly rent collection with balance tracking per tenant.</p>
        </div>
        <div className="page-actions">
          {/* Period selector */}
          <div ref={periodDropRef} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setPeriodDrop(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {selectedLabel} <ChevronDown size={14} style={{ transform: showPeriodDrop ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showPeriodDrop && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 180, animation: 'menuPop 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                {periods.map(p => (
                  <button key={p.key} type="button" onClick={() => { setSelectedPeriod(p.key); setPeriodDrop(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: selectedPeriod === p.key ? 700 : 500, background: selectedPeriod === p.key ? 'var(--surface-hover)' : 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {p.label} {selectedPeriod === p.key && <Check size={13} color="#10b981" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="btn-icon" onClick={handleExport} title="Download PDF">
            <Download size={17} />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gsap-item">
        {[
          { label: 'Rent Expected',  value: `KSh ${totalExpected.toLocaleString()}`,  icon: <DollarSign size={18} color="#4f46e5" />,  bg: '#eff6ff' },
          { label: 'Collected',      value: `KSh ${totalCollected.toLocaleString()}`, icon: <TrendingUp size={18} color="#059669" />,  bg: '#ecfdf5' },
          { label: 'Outstanding',    value: `KSh ${totalBalance.toLocaleString()}`,   icon: <AlertTriangle size={18} color={totalBalance > 0 ? '#d97706' : '#059669'} />, bg: totalBalance > 0 ? '#fffbeb' : '#ecfdf5' },
          { label: 'Collection Rate', value: `${collectionPct}%`,                    icon: <CreditCard size={18} color="#0891b2" />,  bg: '#eff6ff' },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="card-organic gsap-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Collection Trend — 2026</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Expected vs. collected (KES)</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}><span style={{ width: 10, height: 3, background: '#e5e7eb', borderRadius: 2, display: 'inline-block' }} />Expected</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 3, background: '#171717', borderRadius: 2, display: 'inline-block' }} />Collected</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revenueTrendData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e5e7eb" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="collGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#171717" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#171717" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontFamily: 'var(--font-main)', fontSize: 12 }} formatter={(v: number) => [`KSh ${v.toLocaleString()}`]} />
            <Area type="monotone" dataKey="expected"  stroke="#e5e7eb" strokeWidth={2} fill="url(#expGrad)"   dot={false} activeDot={{ r: 4 }} />
            <Area type="monotone" dataKey="collected" stroke="#171717" strokeWidth={2} fill="url(#collGrad2)" dot={false} activeDot={{ r: 4, fill: '#171717' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rent table */}
      <div className="card-organic gsap-item" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Tenant Rent Status — {selectedLabel}</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {rows.filter(r => r.status === 'paid').length} of {rows.length} paid
          </span>
        </div>
        <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
          <table className="table-organic w-full">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th style={{ textAlign: 'right' }}>Rent Due</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(({ tenant, record, rentDue, paid, balance, status }) => {
                const ss = STATUS_STYLE[status];
                return (
                  <tr key={tenant.id}>
                    <td>
                      <button type="button" onClick={() => navigate(`/tenants/${tenant.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#171717', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {(tenant.first_name?.[0] || '') + (tenant.last_name?.[0] || '')}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {tenant.first_name} {tenant.last_name}
                              <ArrowUpRight size={12} color="#9ca3af" />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tenant.property}</div>
                          </div>
                        </div>
                      </button>
                    </td>
                    <td style={{ fontWeight: 700 }}>{tenant.unit}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>KSh {rentDue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: paid > 0 ? '#059669' : 'var(--text-muted)' }}>KSh {paid.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: balance > 0 ? '#dc2626' : '#059669' }}>KSh {balance.toLocaleString()}</td>
                    <td>
                      <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                        <span className="badge-dot" />
                        {ss.label}
                      </span>
                    </td>
                    <td>
                      {status !== 'paid' && (
                        <button type="button" className="btn-organic btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}
                          onClick={() => setPayModal({ tenant, record })}>
                          Pay
                        </button>
                      )}
                      {status === 'paid' && (
                        <button type="button" onClick={() => navigate(`/tenants/${tenant.id}`)}
                          style={{ fontSize: 12, fontWeight: 600, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                          View ↗
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment modal */}
      {payModal && (
        <Modal
          isOpen
          onClose={() => setPayModal(null)}
          title="Record Rent Payment"
          description={`${payModal.record ? 'Add payment' : 'Record first payment'} for ${selectedLabel}`}
        >
          <PayModal
            key={`${payModal.tenant.id}-${selectedPeriod}`}
            tenant={payModal.tenant}
            record={payModal.record}
            initialPeriodKey={selectedPeriod}
            onClose={() => setPayModal(null)}
          />
        </Modal>
      )}
    </div>
  );
};
