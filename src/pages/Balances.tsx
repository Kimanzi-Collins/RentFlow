import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Wallet, Search, ChevronRight, Download, FileText, Droplets, Home,
  AlertTriangle, CheckCircle2, Users, ArrowUpRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF, downloadBalanceReminders, downloadReceipt } from '@/lib/export';
import { computeAllBalances, formatKES } from '@/lib/balances';
import type { TenantBalance, PeriodBalance, BalanceStatus } from '@/lib/balances';
import { useBillingStore, getAvailablePeriods, parsePeriodKey, CURRENT_PERIOD_KEY } from '@/stores/billingStore';

// ─── Small helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<BalanceStatus, { cls: string; label: string }> = {
  paid:    { cls: 'badge-success', label: 'Paid'    },
  partial: { cls: 'badge-info',    label: 'Partial' },
  unpaid:  { cls: 'badge-danger',  label: 'Unpaid'  },
};

const STATE_BADGE = {
  cleared: { cls: 'badge-success', label: 'Cleared' },
  due:     { cls: 'badge-warning', label: 'Due'     },
  overdue: { cls: 'badge-danger',  label: 'Overdue' },
} as const;

const owe = (n: number) => (n > 0 ? '#dc2626' : '#059669');

const REMINDER_INSTRUCTIONS_KEY = 'rentflow-reminder-instructions';

// ─── Reminder form ────────────────────────────────────────────────────────────

interface ReminderFormProps {
  balances: TenantBalance[];
  properties: string[];
  initialTenantId: string | null;
  onClose: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ balances, properties, initialTenantId, onClose }) => {
  const { success } = useToast();
  const [scope, setScope]       = useState<'all' | 'one'>(initialTenantId ? 'one' : 'all');
  const [tenantId, setTenantId] = useState(initialTenantId ?? balances.find(b => b.total > 0)?.tenant.id ?? '');
  const [property, setProperty] = useState('');
  const [includeRent, setRent]   = useState(true);
  const [includeWater, setWater] = useState(true);
  const [payBy, setPayBy]       = useState('');
  const [instructions, setInstructions] = useState(() => {
    try { return localStorage.getItem(REMINDER_INSTRUCTIONS_KEY) ?? ''; } catch { return ''; }
  });
  const [note, setNote] = useState('');
  const [err, setErr]   = useState('');

  // Which tenants will get a page, given the chosen scope and what is being included
  const targets = useMemo(() => {
    const owes = (b: TenantBalance) => (includeRent ? b.rentBalance : 0) + (includeWater ? b.waterBalance : 0) > 0;
    const pool = scope === 'one'
      ? balances.filter(b => b.tenant.id === tenantId)
      : balances.filter(b => !property || b.tenant.property === property);
    return pool.filter(owes);
  }, [balances, scope, tenantId, property, includeRent, includeWater]);

  const targetTotal = targets.reduce(
    (s, b) => s + (includeRent ? b.rentBalance : 0) + (includeWater ? b.waterBalance : 0), 0,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!includeRent && !includeWater) { setErr('Include rent, water, or both.'); return; }
    if (!targets.length) { setErr('Nobody has an outstanding balance for this selection.'); return; }
    setErr('');
    try {
      const count = downloadBalanceReminders(targets, {
        includeRent, includeWater,
        payBy: payBy || undefined,
        paymentInstructions: instructions,
        note,
      });
      try { localStorage.setItem(REMINDER_INSTRUCTIONS_KEY, instructions.slice(0, 300)); } catch { /* storage unavailable */ }
      success('Reminder PDF ready', `${count} reminder${count === 1 ? '' : 's'} generated.`);
      onClose();
    } catch (ex) {
      console.error('Failed to generate reminder PDF', ex);
      setErr('Could not generate the PDF. Please try again.');
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}

      <div>
        <label className="modal-label">Who is this for?</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {([
            { key: 'all', label: 'All tenants owing', desc: 'One page per tenant' },
            { key: 'one', label: 'One tenant',        desc: 'A single reminder'   },
          ] as const).map(o => (
            <button key={o.key} type="button" onClick={() => setScope(o.key)}
              style={{
                padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: `2px solid ${scope === o.key ? '#171717' : '#e5e7eb'}`,
                background: scope === o.key ? '#171717' : '#f9fafb',
                color: scope === o.key ? '#fff' : '#374151', transition: 'all 0.18s',
              }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{o.label}</div>
              <div style={{ fontSize: 11, marginTop: 2, color: scope === o.key ? 'rgba(255,255,255,0.65)' : '#6b7280' }}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {scope === 'one' ? (
        <div>
          <label className="modal-label">Tenant</label>
          <select aria-label="Tenant" className="modal-input" value={tenantId} onChange={e => setTenantId(e.target.value)}>
            {balances.map(b => (
              <option key={b.tenant.id} value={b.tenant.id}>
                {b.tenant.first_name} {b.tenant.last_name} — {b.tenant.unit}{b.total > 0 ? ` (owes ${formatKES(b.total)})` : ' (no balance)'}
              </option>
            ))}
          </select>
        </div>
      ) : properties.length > 1 && (
        <div>
          <label className="modal-label">Property</label>
          <select aria-label="Property" className="modal-input" value={property} onChange={e => setProperty(e.target.value)}>
            <option value="">All properties</option>
            {properties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="modal-label">Include</label>
        <div style={{ display: 'flex', gap: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeRent} onChange={e => setRent(e.target.checked)} style={{ accentColor: '#171717' }} /> Rent
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeWater} onChange={e => setWater(e.target.checked)} style={{ accentColor: '#171717' }} /> Water
          </label>
        </div>
      </div>

      <div className="modal-form-grid">
        <div>
          <label className="modal-label">Pay by (optional)</label>
          <input className="modal-input" type="date" min={today} value={payBy} onChange={e => setPayBy(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="modal-label">How to pay (optional)</label>
        <input className="modal-input" maxLength={300} placeholder="e.g. M-PESA Paybill 123456, Account: your unit number"
          value={instructions} onChange={e => setInstructions(e.target.value)} />
      </div>

      <div>
        <label className="modal-label">Note (optional)</label>
        <input className="modal-input" maxLength={300} placeholder="e.g. Kindly clear before the 5th to avoid penalties"
          value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
        <span>{targets.length} reminder{targets.length === 1 ? '' : 's'} will be generated</span>
        <span style={{ fontWeight: 800, color: owe(targetTotal) }}>{formatKES(targetTotal)}</span>
      </div>

      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={!targets.length}>
          Download PDF
        </button>
      </div>
    </form>
  );
};

// ─── Clear balance (record a payment against one specific balance) ───────────

const PAY_METHODS = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque'];

interface PayItem { key: string; kind: 'rent' | 'water'; period_key: string; period: string; balance: number }

/** Every individual unpaid rent / water balance for a tenant, oldest month first. */
function payItems(b: TenantBalance): PayItem[] {
  const items: PayItem[] = [];
  for (const p of [...b.unpaidPeriods].reverse()) {
    if (p.rent && p.rent.balance > 0)   items.push({ key: `rent:${p.period_key}`,  kind: 'rent',  period_key: p.period_key, period: p.period, balance: p.rent.balance });
    if (p.water && p.water.balance > 0) items.push({ key: `water:${p.period_key}`, kind: 'water', period_key: p.period_key, period: p.period, balance: p.water.balance });
  }
  return items;
}

const ClearBalanceForm: React.FC<{ balance: TenantBalance; initialKey: string | null; onClose: () => void }> = ({ balance, initialKey, onClose }) => {
  const { recordPayment, recordWaterPayment, ensureRentRecord } = useBillingStore();
  const { success } = useToast();
  const tenant = balance.tenant;
  const items = useMemo(() => payItems(balance), [balance]);

  const [key, setKey]       = useState(items.find(i => i.key === initialKey)?.key ?? items[0]?.key ?? '');
  const [method, setMethod] = useState('M-PESA');
  const [note, setNote]     = useState('');
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);
  const item = items.find(i => i.key === key);
  const [amount, setAmount] = useState(item ? String(item.balance) : '');

  function pick(k: string) {
    setKey(k);
    const it = items.find(i => i.key === k);
    setAmount(it ? String(it.balance) : '');
    setErr('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) { setErr('Enter a valid amount.'); return; }
    if (n > item.balance + 0.005) { setErr(`Amount exceeds the balance of ${formatKES(item.balance)}.`); return; }
    setErr('');
    setBusy(true);
    try {
      type Res = { error?: string } | undefined;
      let res: Res;
      if (item.kind === 'rent') {
        // Months that were never billed have no record yet: create it first
        const { year, month } = parsePeriodKey(item.period_key);
        await ensureRentRecord(tenant.id, year, month);
        res = (await recordPayment(tenant.id, item.period_key, n, method, note || undefined)) as unknown as Res;
      } else {
        const reading = useBillingStore.getState().waterReadings.find(r => r.tenant_id === tenant.id && r.period_key === item.period_key);
        if (!reading) { setErr('Water reading not found for that month.'); return; }
        res = (await recordWaterPayment(reading.id, n)) as unknown as Res;
      }
      if (res?.error) { setErr(res.error); return; }
      success(`${item.kind === 'water' ? 'Water' : 'Rent'} payment recorded`, `${formatKES(n)} — ${tenant.first_name} ${tenant.last_name}, ${item.period}`);

      // Same rule as the other payment screens: once rent and water for the month are both settled, hand over a receipt
      const { rentRecords, waterReadings } = useBillingStore.getState();
      const rent  = rentRecords.find(r => r.tenant_id === tenant.id && r.period_key === item.period_key);
      const water = waterReadings.find(r => r.tenant_id === tenant.id && r.period_key === item.period_key);
      if (rent?.status === 'paid' && water?.status === 'paid') {
        downloadReceipt(tenant, rent.period, rent.amount_paid, water.amount_paid, method, water, { rent: 0, water: 0 });
        success('Receipt generated', 'Rent and water fully paid for this month.');
      }
      onClose();
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    return <div style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>This tenant has no outstanding balance.</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {err && <div className="modal-error">{err}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{tenant.first_name} {tenant.last_name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Unit {tenant.unit} · {tenant.property}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>TOTAL OWED</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>{formatKES(balance.total)}</div>
        </div>
      </div>

      <div>
        <label className="modal-label">Balance to clear</label>
        <select aria-label="Balance to clear" className="modal-input" value={key} onChange={e => pick(e.target.value)}>
          {items.map(i => (
            <option key={i.key} value={i.key}>{i.kind === 'water' ? 'Water' : 'Rent'} — {i.period} ({formatKES(i.balance)} owed)</option>
          ))}
        </select>
      </div>

      <div className="modal-form-grid">
        <div>
          <label className="modal-label">Amount paid (KES) *</label>
          <input className="modal-input" type="number" min="1" step="any" max={item?.balance} value={amount}
            onChange={e => setAmount(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="modal-label">Payment method</label>
          <select aria-label="Payment method" className="modal-input" value={method} onChange={e => setMethod(e.target.value)}>
            {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {item?.kind === 'rent' && (
        <div>
          <label className="modal-label">Note (optional)</label>
          <input className="modal-input" maxLength={200} placeholder="e.g. Partial, balance on Friday" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      )}

      {item && Number(amount) > 0 && Number(amount) <= item.balance && (
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          Balance after this payment: <strong style={{ color: owe(item.balance - Number(amount)) }}>{formatKES(Math.max(0, item.balance - Number(amount)))}</strong>
        </div>
      )}

      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="submit" className="modal-btn-submit" disabled={busy}>{busy ? 'Recording...' : 'Record Payment'}</button>
      </div>
    </form>
  );
};

// ─── Expanded month-by-month breakdown ────────────────────────────────────────

const Breakdown: React.FC<{ periods: PeriodBalance[]; showSettled: boolean; onPay: (key: string) => void }> = ({ periods, showSettled, onPay }) => {
  const rows = showSettled ? periods : periods.filter(p => p.balance > 0);

  if (!rows.length) {
    return (
      <div style={{ padding: '14px 24px', fontSize: 13, color: 'var(--text-muted)' }}>
        No unpaid months. Tick “Show settled months” to see the full history.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ color: 'var(--text-muted)', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>Month</th>
            <th style={{ padding: '8px 12px' }}>Rent due</th>
            <th style={{ padding: '8px 12px' }}>Rent paid</th>
            <th style={{ padding: '8px 12px' }}>Rent balance</th>
            <th style={{ padding: '8px 12px' }}>Water bill</th>
            <th style={{ padding: '8px 12px' }}>Water paid</th>
            <th style={{ padding: '8px 12px' }}>Water balance</th>
            <th style={{ padding: '8px 12px' }}>Month balance</th>
            <th style={{ textAlign: 'center', padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}><span className="sr-only">Pay</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => {
            const badge = STATUS_BADGE[p.status];
            const settled = p.balance <= 0;
            return (
              <tr key={p.period_key} style={{ borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'right', opacity: settled ? 0.6 : 1 }}>
                <td style={{ textAlign: 'left', padding: '9px 12px', fontWeight: 700 }}>
                  {p.period}
                  {p.rent?.unbilled && <span title="No rent record exists for this month yet; counted as unpaid." style={{ marginLeft: 6, fontSize: 10, color: '#d97706', fontWeight: 700 }}>UNBILLED</span>}
                </td>
                <td style={{ padding: '9px 12px' }}>{p.rent ? formatKES(p.rent.due) : '—'}</td>
                <td style={{ padding: '9px 12px', color: p.rent?.paid ? '#059669' : undefined }}>{p.rent ? formatKES(p.rent.paid) : '—'}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: p.rent ? owe(p.rent.balance) : undefined }}>{p.rent ? formatKES(p.rent.balance) : '—'}</td>
                <td style={{ padding: '9px 12px' }} title={p.water ? `${p.water.prev} → ${p.water.curr} m³ (${p.water.consumed} m³ × KSh ${p.water.rate})` : undefined}>
                  {p.water ? formatKES(p.water.billed) : '—'}
                </td>
                <td style={{ padding: '9px 12px', color: p.water?.paid ? '#059669' : undefined }}>{p.water ? formatKES(p.water.paid) : '—'}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: p.water ? owe(p.water.balance) : undefined }}>{p.water ? formatKES(p.water.balance) : '—'}</td>
                <td style={{ padding: '9px 12px', fontWeight: 800, color: owe(p.balance) }}>{formatKES(p.balance)}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                  <span className={`badge ${badge.cls}`}><span className="badge-dot" />{badge.label}</span>
                </td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  {p.water && p.water.balance > 0 && (
                    <button type="button" className="btn-organic btn-secondary" style={{ padding: '4px 10px', fontSize: 11, minHeight: 0, marginRight: 4 }}
                      onClick={() => onPay(`water:${p.period_key}`)}>Pay water</button>
                  )}
                  {p.rent && p.rent.balance > 0 && (
                    <button type="button" className="btn-organic btn-secondary" style={{ padding: '4px 10px', fontSize: 11, minHeight: 0 }}
                      onClick={() => onPay(`rent:${p.period_key}`)}>Pay rent</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const Balances: React.FC = () => {
  const { tenants, rentRecords, waterReadings } = useBillingStore();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch]         = useState('');
  const [property, setProperty]     = useState('');
  const [filter, setFilter]         = useState<'all' | 'owing' | 'cleared'>('owing');
  const [showSettled, setShowSettled] = useState(false);
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());
  const [reminder, setReminder]     = useState<{ tenantId: string | null } | null>(null);
  const [payFor, setPayFor]         = useState<{ tenantId: string; itemKey: string | null } | null>(null);

  const periods = useMemo(() => getAvailablePeriods(), []);

  const allBalances = useMemo(
    () => computeAllBalances(tenants, rentRecords, waterReadings, periods, CURRENT_PERIOD_KEY),
    [tenants, rentRecords, waterReadings, periods],
  );

  // Former tenants only matter while they still owe money
  const relevant = useMemo(
    () => allBalances.filter(b => b.tenant.status === 'active' || b.total > 0),
    [allBalances],
  );

  const propertyNames = useMemo(
    () => Array.from(new Set(relevant.map(b => b.tenant.property))).sort(),
    [relevant],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return relevant.filter(b => {
      const t = b.tenant;
      if (property && t.property !== property) return false;
      if (filter === 'owing' && b.total <= 0) return false;
      if (filter === 'cleared' && b.total > 0) return false;
      if (!q) return true;
      return `${t.first_name} ${t.last_name} ${t.unit} ${t.property} ${t.phone}`.toLowerCase().includes(q);
    });
  }, [relevant, search, property, filter]);

  // KPIs reflect the property filter but not the search box or status chips
  const scoped = relevant.filter(b => !property || b.tenant.property === property);
  const totalRent  = scoped.reduce((s, b) => s + b.rentBalance, 0);
  const totalWater = scoped.reduce((s, b) => s + b.waterBalance, 0);
  const totalAll   = totalRent + totalWater;
  const owingCount = scoped.filter(b => b.total > 0).length;

  useGSAP(() => {
    const items = containerRef.current?.querySelectorAll('.gsap-item');
    if (items) gsap.fromTo(items, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' });
  }, { scope: containerRef, dependencies: [] });

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (!visible.length) return;
    const rows: Record<string, unknown>[] = visible.map(b => ({
      Tenant: `${b.tenant.first_name} ${b.tenant.last_name}`,
      Unit: b.tenant.unit,
      Property: b.tenant.property,
      'Rent Balance (KES)': b.rentBalance.toLocaleString(),
      'Water Balance (KES)': b.waterBalance.toLocaleString(),
      'Total Balance (KES)': b.total.toLocaleString(),
      Status: STATE_BADGE[b.state].label,
    }));
    rows.push({
      Tenant: 'TOTAL', Unit: '', Property: '',
      'Rent Balance (KES)': visible.reduce((s, b) => s + b.rentBalance, 0).toLocaleString(),
      'Water Balance (KES)': visible.reduce((s, b) => s + b.waterBalance, 0).toLocaleString(),
      'Total Balance (KES)': visible.reduce((s, b) => s + b.total, 0).toLocaleString(),
      Status: '',
    });
    downloadPDF('tenant-balances.pdf', rows);
  }

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Balances</h1>
          <p className="page-subtitle">What every tenant owes in rent and water, month by month.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-icon" onClick={handleExport} title="Download balances summary (PDF)" aria-label="Download balances summary">
            <Download size={17} />
          </button>
          <button type="button" className="btn-organic btn-primary" onClick={() => setReminder({ tenantId: null })}>
            <FileText size={15} /> Balance Reminder
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gsap-item">
        {[
          { label: 'Total Outstanding', value: formatKES(totalAll),   icon: <Wallet size={18} color={totalAll > 0 ? '#dc2626' : '#059669'} />, bg: totalAll > 0 ? '#fef2f2' : '#ecfdf5' },
          { label: 'Rent Outstanding',  value: formatKES(totalRent),  icon: <Home size={18} color="#4f46e5" />,   bg: '#eff6ff' },
          { label: 'Water Outstanding', value: formatKES(totalWater), icon: <Droplets size={18} color="#0891b2" />, bg: '#ecfeff' },
          { label: 'Tenants Owing',     value: `${owingCount} / ${scoped.length}`, icon: <Users size={18} color={owingCount ? '#d97706' : '#059669'} />, bg: owingCount ? '#fffbeb' : '#ecfdf5' },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="card-organic gsap-item" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search name, unit, property..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-organic" aria-label="Search tenants"
              style={{ paddingLeft: 38, width: '100%' }} />
          </div>

          {propertyNames.length > 1 && (
            <select aria-label="Filter by property" className="modal-input" style={{ width: 'auto', minWidth: 160 }}
              value={property} onChange={e => setProperty(e.target.value)}>
              <option value="">All properties</option>
              {propertyNames.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            {([['owing', 'Owing'], ['cleared', 'Cleared'], ['all', 'All']] as const).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setFilter(key)}
                style={{
                  padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: filter === key ? '#171717' : '#fff', color: filter === key ? '#fff' : '#374151',
                }}>
                {label}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}>
            <input type="checkbox" checked={showSettled} onChange={e => setShowSettled(e.target.checked)} style={{ accentColor: '#171717' }} />
            Show settled months
          </label>
        </div>

        <div style={{ overflowX: 'auto', padding: '0 24px 8px' }}>
          <table className="table-organic w-full">
            <thead>
              <tr>
                <th style={{ width: 36 }}><span className="sr-only">Expand</span></th>
                <th>Tenant</th>
                <th className="bal-col-sm">Unit</th>
                <th className="bal-col-sm" style={{ textAlign: 'right' }}>Rent</th>
                <th className="bal-col-sm" style={{ textAlign: 'right' }}>Water</th>
                <th style={{ textAlign: 'right' }}>Total balance</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(b => {
                const t = b.tenant;
                const open = expanded.has(t.id);
                const badge = STATE_BADGE[b.state];
                return (
                  <React.Fragment key={t.id}>
                    <tr onClick={() => toggle(t.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <button type="button" aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${t.first_name} ${t.last_name}`}
                          onClick={e => { e.stopPropagation(); toggle(t.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, color: '#6b7280' }}>
                          <ChevronRight size={16} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {t.first_name} {t.last_name}
                          {t.status !== 'active' && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 99 }}>FORMER</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.property} · Unit {t.unit}</div>
                      </td>
                      <td className="bal-col-sm" style={{ fontWeight: 700 }}>{t.unit}</td>
                      <td className="bal-col-sm" style={{ textAlign: 'right', fontWeight: 600, color: owe(b.rentBalance) }}>{formatKES(b.rentBalance)}</td>
                      <td className="bal-col-sm" style={{ textAlign: 'right', fontWeight: 600, color: owe(b.waterBalance) }}>{formatKES(b.waterBalance)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: owe(b.total) }}>{formatKES(b.total)}</td>
                      <td>
                        <span className={`badge ${badge.cls}`}><span className="badge-dot" />{badge.label}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {b.total > 0 && (
                            <button type="button" className="btn-organic btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={e => { e.stopPropagation(); setPayFor({ tenantId: t.id, itemKey: null }); }}>
                              Clear balance
                            </button>
                          )}
                          {b.total > 0 && (
                            <button type="button" className="btn-organic btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={e => { e.stopPropagation(); setReminder({ tenantId: t.id }); }}>
                              <FileText size={12} /> Reminder
                            </button>
                          )}
                          <button type="button" aria-label={`Open ${t.first_name} ${t.last_name}`} className="btn-icon"
                            style={{ width: 32, height: 32 }}
                            onClick={e => { e.stopPropagation(); navigate(`/tenants/${t.id}`); }}>
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, background: '#fafafa' }}>
                          <Breakdown periods={b.periods} showSettled={showSettled} onPay={k => setPayFor({ tenantId: t.id, itemKey: k })} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {!visible.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    {relevant.length === 0
                      ? 'No tenants yet.'
                      : filter === 'owing' && !search && !property
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 600 }}><CheckCircle2 size={16} /> Everyone is fully paid up.</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} /> No tenants match these filters.</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {payFor && (() => {
        const target = relevant.find(b => b.tenant.id === payFor.tenantId);
        return target ? (
          <Modal isOpen onClose={() => setPayFor(null)} title="Clear Balance" description="Record a payment against a specific unpaid rent or water balance.">
            <ClearBalanceForm balance={target} initialKey={payFor.itemKey} onClose={() => setPayFor(null)} />
          </Modal>
        ) : null;
      })()}

      {reminder && (
        <Modal
          isOpen
          onClose={() => setReminder(null)}
          title="Balance Reminder"
          description="Generate a printable PDF reminder showing the unpaid rent and water months."
        >
          <ReminderForm
            balances={relevant}
            properties={propertyNames}
            initialTenantId={reminder.tenantId}
            onClose={() => setReminder(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Balances;
