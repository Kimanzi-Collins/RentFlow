import React, { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Droplets, Plus, Download, ChevronDown, Edit3, Check,
  AlertCircle, ArrowRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF, downloadReceipt, downloadWaterInvoice } from '@/lib/export';
import {
  useBillingStore,
  getAvailablePeriods,
  parsePeriodKey,
  makePeriodLabel,
  CURRENT_PERIOD_KEY,
} from '@/stores/billingStore';
import type { TenantConfig, WaterReading } from '@/stores/billingStore';

// ─── Record reading modal ─────────────────────────────────────────────────────

interface RecordModalProps {
  tenant: TenantConfig;
  year: number;
  month: number;
  existing?: WaterReading;
  onClose: () => void;
}

const RecordModal: React.FC<RecordModalProps> = ({ tenant, year, month, existing, onClose }) => {
  const { recordWaterReading, getLastWaterReading } = useBillingStore();
  const { success, error: toastErr } = useToast();

  const lastReading = getLastWaterReading(tenant.id);
  const [overridePrev, setOverridePrev] = useState<number | null>(null);
  const prevReading = overridePrev !== null ? overridePrev : (existing?.prev_reading ?? lastReading?.curr_reading ?? tenant.initial_water_reading);

  const [curr, setCurr]   = useState(existing ? String(existing.curr_reading) : '');
  const [rate, setRate]   = useState(String(existing?.rate ?? tenant.water_rate));
  const [err, setErr]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const consumed    = Math.max(0, Number(curr) - prevReading);
  const totalBill   = consumed * Number(rate);
  const showPreview = Number(curr) > prevReading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!curr) { setErr('Current reading is required.'); return; }
    if (Number(curr) < prevReading) { setErr(`Current reading (${curr}) cannot be less than previous (${prevReading}).`); return; }
    if (!rate || Number(rate) <= 0) { setErr('Rate per unit must be greater than 0.'); return; }
    setErr('');
    setIsSubmitting(true);
    
    try {
      const res: any = await recordWaterReading(tenant.id, tenant.unit, year, month, Number(curr), Number(rate), overridePrev !== null ? overridePrev : undefined);
      if (res && res.error) {
        setErr(res.error);
        return;
      }
      
      success('Reading recorded', `${tenant.first_name} – Unit ${tenant.unit}: ${consumed} m³ × KSh ${rate} = KSh ${totalBill.toLocaleString()}`);
      
      // Auto-download the small invoice slip
      downloadWaterInvoice(
        tenant,
        makePeriodLabel(year, month),
        prevReading,
        Number(curr),
        consumed,
        Number(rate),
        totalBill
      );

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}

      <div style={{ display: 'flex', gap: 12, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px' }}>
        <Droplets size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{tenant.first_name} {tenant.last_name} — Unit {tenant.unit}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{tenant.property}</div>
        </div>
      </div>

      <div className="modal-form-grid">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="modal-label" style={{ marginBottom: 0 }}>Previous (m³)</label>
            {overridePrev === null && (
              <button type="button" onClick={() => setOverridePrev(0)} style={{ fontSize: 11, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Reset Meter</button>
            )}
            {overridePrev !== null && (
              <button type="button" onClick={() => setOverridePrev(null)} style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Undo Reset</button>
            )}
          </div>
          <input className="modal-input" type="number" step="0.1" value={prevReading} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div>
          <label className="modal-label">Current Reading (m³) *</label>
          <input className="modal-input" type="number" step="0.1" min={prevReading} placeholder="e.g. 1284" value={curr}
            onChange={e => setCurr(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="modal-label">Rate per m³ (KES)</label>
          <input className="modal-input" type="number" min="1" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div>
          <label className="modal-label">Period</label>
          <input className="modal-input" value={makePeriodLabel(year, month)} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
      </div>

      {showPreview && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
            <span>Units consumed</span><span style={{ fontWeight: 600 }}>{consumed.toLocaleString()} m³</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
            <span>Rate</span><span style={{ fontWeight: 600 }}>KSh {Number(rate).toLocaleString()} / m³</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#111827', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <span>Water Bill</span><span>KSh {totalBill.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Recording...' : (existing ? 'Update Reading' : 'Record Reading')}
        </button>
      </div>
    </form>
  );
};

// ─── Pay water bill form ──────────────────────────────────────────────────────

const WATER_METHODS = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque'];

const WaterPayForm: React.FC<{
  reading: WaterReading & { tenant: TenantConfig };
  onClose: () => void;
}> = ({ reading, onClose }) => {
  const { recordWaterPayment } = useBillingStore();
  const { success } = useToast();
  const [amount, setAmount] = useState(String(reading.balance));
  const [method, setMethod] = useState('M-PESA');
  const [err, setErr]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) { setErr('Enter a valid amount.'); return; }
    if (n > reading.balance) { setErr(`Amount exceeds outstanding balance of KSh ${reading.balance.toLocaleString()}.`); return; }
    setErr('');
    setIsSubmitting(true);
    try {
      const res = await recordWaterPayment(reading.id, n);
      if (res?.error) { setErr(res.error); return; }
      success('Water payment recorded', `KSh ${n.toLocaleString()} — Unit ${reading.unit}`);

      const { rentRecords, waterReadings } = useBillingStore.getState();
      const updatedRent = rentRecords.find(r => r.tenant_id === reading.tenant_id && r.period_key === reading.period_key);
      const updatedWater = waterReadings.find(r => r.id === reading.id);
      
      const isRentPaid = !updatedRent || updatedRent.status === 'paid';
      const isWaterPaid = updatedWater?.status === 'paid';
      
      if (isRentPaid && isWaterPaid && updatedWater) {
        const periodName = updatedWater.period;
        const rentTotal = updatedRent ? updatedRent.amount_paid : 0;
        const waterTotal = updatedWater.amount_paid;
        downloadReceipt(reading.tenant, periodName, rentTotal, waterTotal, method, updatedWater);
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

      {/* Bill summary */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
          <span>Period</span>
          <span style={{ fontWeight: 600 }}>{reading.period}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
          <span>Total bill</span>
          <span style={{ fontWeight: 600 }}>KSh {reading.amount.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
          <span>Already paid</span>
          <span style={{ fontWeight: 600, color: reading.amount_paid > 0 ? '#059669' : '#6b7280' }}>KSh {reading.amount_paid.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#111827', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <span>Outstanding balance</span>
          <span style={{ color: '#dc2626' }}>KSh {reading.balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="modal-form-grid">
        <div>
          <label className="modal-label">Amount to Pay (KES) *</label>
          <input className="modal-input" type="number" min="1" max={reading.balance}
            aria-label="Amount to pay in KES" placeholder={`Max KSh ${reading.balance.toLocaleString()}`}
            value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="modal-label">Payment Method</label>
          <select aria-label="Payment method" className="modal-input" value={method} onChange={e => setMethod(e.target.value)}>
            {WATER_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export const WaterBilling: React.FC = () => {
  const {
    tenants, getWaterForPeriod, recordWaterReading,
    updateTenant, recordWaterPayment,
  } = useBillingStore();

  const periods = getAvailablePeriods();
  const [selectedPeriod, setSelectedPeriod] = useState(CURRENT_PERIOD_KEY);
  const [showPeriodDrop, setPeriodDrop]     = useState(false);
  const [recordModal, setRecordModal]   = useState<{ tenant: TenantConfig; existing?: WaterReading } | null>(null);
  const [payWaterModal, setPayWaterModal] = useState<(WaterReading & { tenant: TenantConfig }) | null>(null);
  const [editRateFor, setEditRateFor]   = useState<string | null>(null);
  const [tempRate, setTempRate]             = useState('');
  const periodDropRef = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const { success }   = useToast();

  const { year, month } = parsePeriodKey(selectedPeriod);
  const selectedLabel   = periods.find(p => p.key === selectedPeriod)?.label ?? '';

  const readings   = getWaterForPeriod(selectedPeriod);
  const activeTenants = tenants.filter(t => t.status === 'active');

  // Close period dropdown on outside click
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

  // Summary stats
  const totalBilled   = readings.reduce((s, r) => s + r.amount, 0);
  const totalConsumed = readings.reduce((s, r) => s + r.units_consumed, 0);
  const recorded      = readings.length;
  const pending       = activeTenants.length - recorded;

  function handleExport() {
    if (!readings.length) { return; }
    const rows: Record<string, unknown>[] = readings.map(r => ({
      Period: r.period, Unit: r.unit, Tenant: `${r.tenant.first_name} ${r.tenant.last_name}`,
      'Prev Reading': r.prev_reading, 'Curr Reading': r.curr_reading,
      'Units (m³)': r.units_consumed, 'Rate (KES/m³)': r.rate,
      'Amount (KES)': r.amount.toLocaleString(), Status: r.status,
    }));

    const totalUnits = readings.reduce((sum, r) => sum + r.units_consumed, 0);
    const totalAmount = readings.reduce((sum, r) => sum + r.amount, 0);

    rows.push({
      Period: '', Unit: '', Tenant: 'TOTAL',
      'Prev Reading': '', 'Curr Reading': '',
      'Units (m³)': totalUnits, 'Rate (KES/m³)': '',
      'Amount (KES)': totalAmount.toLocaleString(), Status: '',
    });

    downloadPDF(`water-billing-${selectedPeriod}.pdf`, rows);
  }

  function handleDownloadReceipt(reading: WaterReading & { tenant: TenantConfig }) {
    const { rentRecords } = useBillingStore.getState();
    const updatedRent = rentRecords.find(r => r.tenant_id === reading.tenant_id && r.period_key === reading.period_key);
    
    const rentTotal = updatedRent ? updatedRent.amount_paid : 0;
    const waterTotal = reading.amount_paid;
    // We can default method to 'System' since water readings don't have transaction breakdown in UI directly
    downloadReceipt(reading.tenant, reading.period, rentTotal, waterTotal, 'System', reading);
  }

  async function saveRate(tenantId: string) {
    const parsed = parseFloat(tempRate);
    if (!parsed || parsed <= 0) return;
    
    const res: any = await updateTenant(tenantId, { water_rate: parsed });
    if (res && res.error) {
      errorToast('Failed to update rate', res.error);
      return;
    }
    
    success('Rate updated', `New rate: KSh ${parsed}/m³`);
    setEditRateFor(null);
  }

  const getReading = (tenantId: number) => readings.find(r => r.tenant_id === tenantId);

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Water Billing</h1>
          <p className="page-subtitle">Track monthly water consumption and generate bills per unit.</p>
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
                    {p.label}
                    {selectedPeriod === p.key && <Check size={13} color="#10b981" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="btn-icon" onClick={handleExport} title="Download PDF">
            <Download size={17} />
          </button>

          <button type="button" className="btn-organic btn-primary"
            onClick={() => { const first = activeTenants[0]; if (first) setRecordModal({ tenant: first }); }}>
            <Plus size={15} /> Record Reading
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gsap-item">
        {[
          { label: 'Total Billed',       value: `KSh ${totalBilled.toLocaleString()}`,  icon: <Droplets size={18} color="#4d7cff" />, bg: '#eff6ff' },
          { label: 'Total Consumed',     value: `${totalConsumed.toLocaleString()} m³`, icon: <Droplets size={18} color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Readings Recorded',  value: `${recorded} / ${activeTenants.length}`, icon: <Check size={18} color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Pending',            value: pending,                                 icon: <AlertCircle size={18} color={pending ? '#d97706' : '#10b981'} />, bg: pending ? '#fffbeb' : '#ecfdf5' },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Readings table */}
      <div className="card-organic gsap-item" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Unit Readings — {selectedLabel}</h3>
          {pending > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: 99 }}>
              {pending} reading{pending > 1 ? 's' : ''} outstanding
            </span>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-organic w-full" style={{ margin: '0 24px', width: 'calc(100% - 48px)' }}>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Prev</th>
                <th>Curr</th>
                <th>Consumed</th>
                <th>Rate</th>
                <th>Bill (KES)</th>
                <th>Paid (KES)</th>
                <th>Balance (KES)</th>
                <th>Status</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {activeTenants.map(tenant => {
                const r = getReading(tenant.id);
                const lastR = useBillingStore.getState().getLastWaterReading(tenant.id);
                const prevDisplay = r?.prev_reading ?? lastR?.curr_reading ?? tenant.initial_water_reading;

                return (
                  <tr key={tenant.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{tenant.first_name} {tenant.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tenant.property}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{tenant.unit}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                      {prevDisplay.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: r ? 700 : 400, color: r ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {r ? r.curr_reading.toLocaleString() : '—'}
                    </td>
                    <td style={{ fontWeight: r ? 700 : 400 }}>
                      {r ? r.units_consumed.toLocaleString() : '—'}
                    </td>
                    <td>
                      {editRateFor === tenant.id ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <input type="number" value={tempRate} onChange={e => setTempRate(e.target.value)}
                            style={{ width: 70, padding: '4px 8px', border: '1.5px solid #171717', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} autoFocus />
                          <button type="button" onClick={() => saveRate(tenant.id)} style={{ background: '#171717', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Save</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => { setEditRateFor(tenant.id); setTempRate(String(tenant.water_rate)); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}>
                          {tenant.water_rate} <Edit3 size={11} color="#9ca3af" />
                        </button>
                      )}
                    </td>
                    <td style={{ fontWeight: 800 }}>
                      {r ? `KSh ${r.amount.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontWeight: 600, color: r?.amount_paid ? '#059669' : 'var(--text-muted)' }}>
                      {r ? `KSh ${r.amount_paid.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontWeight: 800, color: r?.balance ? '#dc2626' : '#059669' }}>
                      {r ? `KSh ${r.balance.toLocaleString()}` : '—'}
                    </td>
                    <td>
                      {r ? (
                        <span className={`badge ${r.status === 'paid' ? 'badge-success' : (r.status === 'partial' ? 'badge-info' : 'badge-warning')}`}>
                          <span className="badge-dot" />
                          {r.status === 'paid' ? 'Paid' : (r.status === 'partial' ? 'Partial' : 'Outstanding')}
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <span className="badge-dot" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" className="btn-organic btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => setRecordModal({ tenant, existing: r })}>
                          {r ? 'Edit' : 'Record'}
                        </button>
                        {r && r.status !== 'paid' && r.balance > 0 && (
                          <button type="button" className="btn-organic btn-primary"
                            style={{ padding: '6px 12px', fontSize: 12 }}
                            onClick={() => setPayWaterModal({ ...r, tenant })}>
                            Pay
                          </button>
                        )}
                        {r && r.amount_paid > 0 && (
                          <button type="button" className="btn-organic btn-secondary"
                            style={{ padding: '6px 12px', fontSize: 12 }}
                            onClick={() => handleDownloadReceipt({ ...r, tenant })}>
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* History link hint */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <ArrowRight size={13} />
          Full reading history is available on each tenant's detail page.
        </div>
      </div>

      {/* Record Reading Modal */}
      {recordModal && (
        <Modal
          isOpen
          onClose={() => setRecordModal(null)}
          title="Record Water Reading"
          description={`${recordModal.existing ? 'Update' : 'Enter'} the meter reading for ${recordModal.tenant.first_name} ${recordModal.tenant.last_name}`}
        >
          {/* Tenant quick-selector */}
          <div style={{ marginBottom: 16 }}>
            <label className="modal-label">Select Tenant</label>
            <select aria-label="Select tenant" className="modal-input"
              value={recordModal.tenant.id}
              onChange={e => {
                const t = activeTenants.find(x => x.id === e.target.value);
                if (t) setRecordModal({ tenant: t, existing: getReading(t.id) });
              }}>
              {activeTenants.map(t => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — {t.unit}</option>
              ))}
            </select>
          </div>
          <RecordModal
            key={`${recordModal.tenant.id}-${selectedPeriod}`}
            tenant={recordModal.tenant}
            year={year} month={month}
            existing={recordModal.existing}
            onClose={() => setRecordModal(null)}
          />
        </Modal>
      )}

      {/* Pay Water Bill Modal */}
      {payWaterModal && (
        <Modal
          isOpen
          onClose={() => setPayWaterModal(null)}
          title="Record Water Payment"
          description={`${payWaterModal.tenant.first_name} ${payWaterModal.tenant.last_name} — Unit ${payWaterModal.unit} · ${payWaterModal.period}`}
          size="sm"
        >
          <WaterPayForm
            reading={payWaterModal}
            onClose={() => setPayWaterModal(null)}
          />
        </Modal>
      )}
    </div>
  );
};
