import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Search, Plus, CreditCard, TrendingDown, CheckCircle2, Receipt, Clock, Download,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Modal from '@/components/ui/Modal';
import { downloadPDF } from '@/lib/export';

// ── Types ──────────────────────────────────────────────────────────────────────
type PayStatus = 'paid' | 'overdue' | 'pending';
type PayMethod = 'MPESA' | 'Bank' | 'Cash';

interface MockPayment {
  id: string;
  period: string;
  tenant: string;
  unit: string;
  amount: number;
  method: PayMethod;
  status: PayStatus;
  reference: string;
  date: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_PAYMENTS: MockPayment[] = [
  { id: '1', period: 'May 2025', tenant: 'Grace Wanjiku',  unit: 'A-101', amount: 18000, method: 'MPESA', status: 'paid',    reference: 'M-PESA Ref: ABC123', date: '2025-05-03' },
  { id: '2', period: 'May 2025', tenant: 'John Kamau',     unit: 'A-102', amount: 25000, method: 'MPESA', status: 'paid',    reference: 'M-PESA Ref: DEF456', date: '2025-05-04' },
  { id: '3', period: 'May 2025', tenant: 'Sarah Otieno',   unit: 'B-201', amount: 45000, method: 'Bank',  status: 'paid',    reference: 'Bank Ref: GHI789',   date: '2025-05-02' },
  { id: '4', period: 'May 2025', tenant: 'Mike Njoroge',   unit: 'B-202', amount: 28000, method: 'MPESA', status: 'overdue', reference: '5 days late',         date: '2025-05-10' },
  { id: '5', period: 'May 2025', tenant: 'Peter Ochieng',  unit: 'A-104', amount: 20000, method: 'MPESA', status: 'pending', reference: 'Due in 3 days',       date: '2025-05-15' },
  { id: '6', period: 'Apr 2025', tenant: 'Grace Wanjiku',  unit: 'A-101', amount: 18000, method: 'MPESA', status: 'paid',    reference: 'M-PESA Ref: JKL012', date: '2025-04-03' },
  { id: '7', period: 'Apr 2025', tenant: 'John Kamau',     unit: 'A-102', amount: 25000, method: 'MPESA', status: 'paid',    reference: 'M-PESA Ref: MNO345', date: '2025-04-04' },
  { id: '8', period: 'Apr 2025', tenant: 'Mike Njoroge',   unit: 'B-202', amount: 28000, method: 'Bank',  status: 'paid',    reference: 'Bank Ref: PQR678',   date: '2025-04-05' },
];

const MOCK_TENANTS = [
  { id: 't1', name: 'Grace Wanjiku',  unit: 'A-101', rent: 18000 },
  { id: 't2', name: 'John Kamau',     unit: 'A-102', rent: 25000 },
  { id: 't3', name: 'Sarah Otieno',   unit: 'B-201', rent: 45000 },
  { id: 't4', name: 'Mike Njoroge',   unit: 'B-202', rent: 28000 },
  { id: 't5', name: 'Peter Ochieng',  unit: 'A-104', rent: 20000 },
];

const SUMMARY = { expected: 136000, collected: 88000, overdue: 28000 };

// ── Helpers ────────────────────────────────────────────────────────────────────
function statusBadgeClass(status: PayStatus): string {
  if (status === 'paid')    return 'badge-paid';
  if (status === 'overdue') return 'badge-overdue';
  return 'badge-pending';
}

function methodBadgeClass(method: PayMethod): string {
  if (method === 'MPESA') return 'method-mpesa';
  if (method === 'Bank')  return 'method-bank';
  return 'method-cash';
}

function methodIcon(method: PayMethod): string {
  if (method === 'MPESA') return '📱';
  if (method === 'Bank')  return '🏦';
  return '💵';
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Record Payment Form ────────────────────────────────────────────────────────
interface RecordFormFields {
  tenantId: string;
  unit: string;
  amount: string;
  method: PayMethod;
  mpesaRef: string;
  bankRef: string;
  date: string;
}

interface RecordFormProps {
  onSubmit: (data: MockPayment) => void;
  onCancel: () => void;
}

function RecordPaymentForm({ onSubmit, onCancel }: RecordFormProps) {
  const [form, setForm] = useState<RecordFormFields>({
    tenantId: MOCK_TENANTS[0].id,
    unit:     MOCK_TENANTS[0].unit,
    amount:   String(MOCK_TENANTS[0].rent),
    method:   'MPESA',
    mpesaRef: '',
    bankRef:  '',
    date:     todayISO(),
  });
  const [error, setError] = useState('');

  const selectedTenant = MOCK_TENANTS.find(t => t.id === form.tenantId) ?? MOCK_TENANTS[0];

  function handleTenantChange(id: string) {
    const t = MOCK_TENANTS.find(x => x.id === id) ?? MOCK_TENANTS[0];
    setForm(f => ({ ...f, tenantId: id, unit: t.unit, amount: String(t.rent) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount is required.'); return; }
    if (form.method === 'MPESA' && !form.mpesaRef.trim()) { setError('M-PESA reference is required.'); return; }
    if (form.method === 'Bank'  && !form.bankRef.trim())  { setError('Bank reference is required.'); return; }
    setError('');
    const period = new Date(form.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const ref    = form.method === 'MPESA' ? `M-PESA Ref: ${form.mpesaRef}` :
                   form.method === 'Bank'  ? `Bank Ref: ${form.bankRef}`     : 'Cash';
    onSubmit({
      id:        String(Date.now()),
      period,
      tenant:    selectedTenant.name,
      unit:      form.unit,
      amount:    Number(form.amount),
      method:    form.method,
      status:    'paid',
      reference: ref,
      date:      form.date,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form-col">
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid-2">
        <div className="form-full">
          <label htmlFor="pay-tenant" className="label-light">Tenant</label>
          <select id="pay-tenant" aria-label="Tenant" className="input-light"
            value={form.tenantId} onChange={e => handleTenantChange(e.target.value)}>
            {MOCK_TENANTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="pay-unit" className="label-light">Unit</label>
          <input id="pay-unit" aria-label="Unit" className="input-light"
            value={form.unit} readOnly />
        </div>

        <div>
          <label htmlFor="pay-amount" className="label-light">Amount (KES) *</label>
          <input id="pay-amount" aria-label="Payment amount in KES" className="input-light"
            type="number" min="0" placeholder="0" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="pay-method" className="label-light">Payment Method</label>
          <select id="pay-method" aria-label="Payment method" className="input-light"
            value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value as PayMethod }))}>
            <option value="MPESA">M-PESA</option>
            <option value="Bank">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {form.method === 'MPESA' && (
          <div className="form-full">
            <label htmlFor="pay-mpesa-ref" className="label-light">M-PESA Reference *</label>
            <input id="pay-mpesa-ref" aria-label="M-PESA reference code" className="input-light"
              placeholder="e.g. QHG7X3YZLP" value={form.mpesaRef}
              onChange={e => setForm(f => ({ ...f, mpesaRef: e.target.value }))} />
          </div>
        )}

        {form.method === 'Bank' && (
          <div className="form-full">
            <label htmlFor="pay-bank-ref" className="label-light">Bank Reference *</label>
            <input id="pay-bank-ref" aria-label="Bank reference number" className="input-light"
              placeholder="e.g. TXN-2025-001" value={form.bankRef}
              onChange={e => setForm(f => ({ ...f, bankRef: e.target.value }))} />
          </div>
        )}

        <div className="form-full">
          <label htmlFor="pay-date" className="label-light">Payment Date</label>
          <input id="pay-date" aria-label="Payment date" className="input-light"
            type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>

      <div className="prop-form-actions">
        <button type="button" className="prop-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="prop-form-submit">
          <CheckCircle2 size={15} /> Confirm Payment
        </button>
      </div>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const Payments: React.FC = () => {
  useAuthStore();
  const [payments, setPayments]       = useState<MockPayment[]>(INITIAL_PAYMENTS);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showModal, setShowModal]     = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.pay-header-anim',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.1 }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    gsap.fromTo('.pay-row',
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 }
    );
  }, { scope: containerRef, dependencies: [payments.length] });

  const months = ['all', ...Array.from(new Set(payments.map(p => p.period)))];

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch  = !q || p.tenant.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q);
    const matchStatus  = statusFilter === 'all' || p.status === statusFilter;
    const matchMonth   = monthFilter  === 'all' || p.period === monthFilter;
    return matchSearch && matchStatus && matchMonth;
  });

  const collectionPct = Math.round((SUMMARY.collected / SUMMARY.expected) * 100);

  function handleAddPayment(data: MockPayment) {
    setPayments(prev => [data, ...prev]);
    setShowModal(false);
  }

  function handleExport() {
    downloadPDF('payments.csv', payments.map(p => ({
      Period:      p.period,
      Tenant:      p.tenant,
      Unit:        p.unit,
      'Amount (KES)': p.amount,
      Method:      p.method,
      Status:      p.status,
      Reference:   p.reference,
      Date:        p.date,
    })));
  }

  return (
    <div className="page-root" ref={containerRef}>

      {/* Header */}
      <div className="page-header pay-header-anim">
        <div>
          <p className="pay-section-label">Finance</p>
          <h1 className="page-title">Payments</h1>
          <p className="pay-subtitle">Rent collection &amp; transaction history</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-outline" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
          <button type="button" className="btn-mint" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="pay-summary-grid pay-header-anim">
        {/* Expected */}
        <div className="white-card pay-summary-card">
          <div className="pay-summary-row">
            <span className="pay-summary-label">Total Expected</span>
            <div className="icon-badge icon-badge-blue">
              <CreditCard size={15} color="#4d7cff" />
            </div>
          </div>
          <div className="pay-summary-value">{SUMMARY.expected.toLocaleString()}</div>
          <div className="pay-summary-sub">KES · This month</div>
        </div>

        {/* Collected */}
        <div className="white-card pay-summary-card">
          <div className="pay-summary-row">
            <span className="pay-summary-label">Collected</span>
            <div className="icon-badge icon-badge-green">
              <CheckCircle2 size={15} color="#00b87a" />
            </div>
          </div>
          <div className="pay-summary-value pay-summary-green">{SUMMARY.collected.toLocaleString()}</div>
          <div className="pay-progress-row">
            <div className="pay-progress-bar">
              <div
                className="pay-progress-fill"
                style={{ ['--fill-pct' as string]: `${collectionPct}%` } as React.CSSProperties}
              />
            </div>
            <span className="pay-progress-pct">{collectionPct}%</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="white-card pay-summary-card">
          <div className="pay-summary-row">
            <span className="pay-summary-label">Overdue</span>
            <div className="icon-badge icon-badge-red">
              <TrendingDown size={15} color="#dc2626" />
            </div>
          </div>
          <div className="pay-summary-value pay-summary-red">{SUMMARY.overdue.toLocaleString()}</div>
          <div className="pay-summary-sub">KES · Requires follow-up</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="white-card filter-bar pay-header-anim">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="text"
            aria-label="Search payments"
            className="input-light filter-search"
            placeholder="Search tenant or unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          aria-label="Filter by month"
          className="input-light filter-select"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
        >
          {months.map(m => <option key={m} value={m}>{m === 'all' ? 'All Months' : m}</option>)}
        </select>

        <div className="filter-pills">
          {(['all', 'paid', 'pending', 'overdue'] as const).map(s => (
            <button
              type="button"
              key={s}
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'pill pill-active' : 'pill'}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="light-table-wrap">
        {/* Table header */}
        <div className="pay-table-head">
          <span>Tenant</span>
          <span>Unit</span>
          <span>Period</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="td-empty">No payments match your filters</div>
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              className={`pay-table-row pay-row${p.status === 'overdue' ? ' pay-row-overdue' : ''}`}
            >
              <div>
                <div className="pay-tenant-name">{p.tenant}</div>
                <div className="pay-reference">{p.reference}</div>
              </div>

              <span className="pay-unit-text">{p.unit}</span>
              <span className="pay-period-text">{p.period}</span>
              <span className="pay-amount-text">KES {p.amount.toLocaleString()}</span>

              <span className={methodBadgeClass(p.method)}>
                {methodIcon(p.method)} {p.method}
              </span>

              <span className={statusBadgeClass(p.status)}>
                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </span>

              <div className="pay-actions-cell">
                <button type="button" className="btn-icon-light" title="View receipt">
                  <Receipt size={14} />
                </button>
                {(p.status === 'pending' || p.status === 'overdue') && (
                  <button
                    type="button"
                    className="btn-mint"
                    onClick={() => setShowModal(true)}
                    title="Record payment"
                  >
                    <Clock size={12} /> Record
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Payment"
        description="Fill in the payment details below."
        size="md"
      >
        <RecordPaymentForm
          onSubmit={handleAddPayment}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};
