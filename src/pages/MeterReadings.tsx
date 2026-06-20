import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Droplets, Zap, Plus, Search, ArrowRight, BarChart3, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Modal from '@/components/ui/Modal';
import { downloadPDF } from '@/lib/export';

// ── Types ──────────────────────────────────────────────────────────────────────
type MeterType = 'Water' | 'Electricity';

interface MockReading {
  id: string;
  period: string;
  unit: string;
  property: string;
  type: MeterType;
  prev: number;
  curr: number;
  units: number;
  amount: number;
  tenant: string;
  rate: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_READINGS: MockReading[] = [
  { id: '1', period: 'May 2025', unit: 'A-101', property: 'Sunset',       type: 'Water',       prev: 1240, curr: 1285, units: 45,  rate: 150, amount: 6750,  tenant: 'Grace Wanjiku' },
  { id: '2', period: 'May 2025', unit: 'A-102', property: 'Sunset',       type: 'Water',       prev: 2100, curr: 2165, units: 65,  rate: 150, amount: 9750,  tenant: 'John Kamau' },
  { id: '3', period: 'May 2025', unit: 'B-201', property: 'Green Valley', type: 'Water',       prev: 890,  curr: 940,  units: 50,  rate: 150, amount: 6000,  tenant: 'Sarah Otieno' },
  { id: '4', period: 'Apr 2025', unit: 'A-101', property: 'Sunset',       type: 'Water',       prev: 1200, curr: 1240, units: 40,  rate: 150, amount: 6000,  tenant: 'Grace Wanjiku' },
  { id: '5', period: 'Apr 2025', unit: 'A-102', property: 'Sunset',       type: 'Electricity', prev: 3400, curr: 3520, units: 120, rate: 40,  amount: 4800,  tenant: 'John Kamau' },
  { id: '6', period: 'Apr 2025', unit: 'B-202', property: 'Green Valley', type: 'Water',       prev: 760,  curr: 800,  units: 40,  rate: 150, amount: 4800,  tenant: 'Mike Njoroge' },
];

const UNIT_OPTIONS = [
  { value: 'A-101', label: 'A-101 – Sunset Apartments',       lastWater: 1285, lastElec: 0    },
  { value: 'A-102', label: 'A-102 – Sunset Apartments',       lastWater: 2165, lastElec: 3520 },
  { value: 'A-103', label: 'A-103 – Sunset Apartments',       lastWater: 0,    lastElec: 0    },
  { value: 'B-201', label: 'B-201 – Green Valley Estate',     lastWater: 940,  lastElec: 0    },
  { value: 'B-202', label: 'B-202 – Green Valley Estate',     lastWater: 800,  lastElec: 0    },
  { value: 'B-203', label: 'B-203 – Green Valley Estate',     lastWater: 0,    lastElec: 0    },
];

const DEFAULT_RATES: Record<MeterType, number> = { Water: 150, Electricity: 40 };

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function periodFromDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Record Reading Form ────────────────────────────────────────────────────────
interface ReadingFormFields {
  unit: string;
  type: MeterType;
  prev: string;
  curr: string;
  rate: string;
  date: string;
}

interface ReadingFormProps {
  onSubmit: (data: MockReading) => void;
  onCancel: () => void;
}

function RecordReadingForm({ onSubmit, onCancel }: ReadingFormProps) {
  const [form, setForm] = useState<ReadingFormFields>({
    unit: UNIT_OPTIONS[0].value,
    type: 'Water',
    prev: String(UNIT_OPTIONS[0].lastWater),
    curr: '',
    rate: String(DEFAULT_RATES.Water),
    date: todayISO(),
  });
  const [error, setError] = useState('');

  const consumed   = Math.max(0, Number(form.curr) - Number(form.prev));
  const totalBill  = consumed * Number(form.rate);
  const showCalc   = Number(form.curr) > 0 && Number(form.curr) > Number(form.prev);

  function handleUnitChange(val: string) {
    const opt = UNIT_OPTIONS.find(u => u.value === val) ?? UNIT_OPTIONS[0];
    const lastPrev = form.type === 'Water' ? opt.lastWater : opt.lastElec;
    setForm(f => ({ ...f, unit: val, prev: String(lastPrev) }));
  }

  function handleTypeChange(val: MeterType) {
    const opt = UNIT_OPTIONS.find(u => u.value === form.unit) ?? UNIT_OPTIONS[0];
    const lastPrev = val === 'Water' ? opt.lastWater : opt.lastElec;
    setForm(f => ({ ...f, type: val, prev: String(lastPrev), rate: String(DEFAULT_RATES[val]) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.curr) { setError('Current reading is required.'); return; }
    if (Number(form.curr) < Number(form.prev)) { setError('Current reading cannot be less than previous reading.'); return; }
    if (!form.rate || Number(form.rate) <= 0) { setError('Rate per unit is required.'); return; }
    setError('');
    const units  = Number(form.curr) - Number(form.prev);
    const amount = units * Number(form.rate);
    const opt    = UNIT_OPTIONS.find(u => u.value === form.unit) ?? UNIT_OPTIONS[0];
    onSubmit({
      id:       String(Date.now()),
      period:   periodFromDate(form.date),
      unit:     form.unit,
      property: opt.label.split('–')[1]?.trim() ?? '',
      type:     form.type,
      prev:     Number(form.prev),
      curr:     Number(form.curr),
      units,
      amount,
      rate:     Number(form.rate),
      tenant:   '—',
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form-col">
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid-2">
        <div>
          <label htmlFor="mr-unit" className="label-light">Unit</label>
          <select id="mr-unit" aria-label="Unit" className="input-light"
            value={form.unit} onChange={e => handleUnitChange(e.target.value)}>
            {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="mr-type" className="label-light">Reading Type</label>
          <select id="mr-type" aria-label="Reading type" className="input-light"
            value={form.type} onChange={e => handleTypeChange(e.target.value as MeterType)}>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
          </select>
        </div>

        <div>
          <label htmlFor="mr-prev" className="label-light">Previous Reading</label>
          <input id="mr-prev" aria-label="Previous meter reading" className="input-light"
            type="number" min="0" value={form.prev}
            onChange={e => setForm(f => ({ ...f, prev: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="mr-curr" className="label-light">Current Reading *</label>
          <input id="mr-curr" aria-label="Current meter reading" className="input-light"
            type="number" min="0" placeholder="Enter current reading" value={form.curr}
            onChange={e => setForm(f => ({ ...f, curr: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="mr-rate" className="label-light">Rate per Unit (KES)</label>
          <input id="mr-rate" aria-label="Rate per unit in KES" className="input-light"
            type="number" min="0" value={form.rate}
            onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="mr-date" className="label-light">Reading Date</label>
          <input id="mr-date" aria-label="Reading date" className="input-light"
            type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>

      {/* Live calculation preview */}
      {showCalc && (
        <div className="mr-calc-preview">
          <div className="mr-calc-row">
            <span>Units consumed</span>
            <span>{consumed} units</span>
          </div>
          <div className="mr-calc-row">
            <span>Rate</span>
            <span>KES {Number(form.rate).toLocaleString()} / unit</span>
          </div>
          <div className="mr-calc-total">
            <span>Total Bill</span>
            <span>KES {totalBill.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="prop-form-actions">
        <button type="button" className="prop-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="prop-form-submit">Save Reading</button>
      </div>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const MeterReadings: React.FC = () => {
  useAuthStore();
  const [readings, setReadings]       = useState<MockReading[]>(INITIAL_READINGS);
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showModal, setShowModal]     = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.mr-header-anim',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.1 }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    gsap.fromTo('.mr-row',
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.38, ease: 'power2.out', stagger: 0.06 }
    );
  }, { scope: containerRef, dependencies: [readings.length] });

  const months = ['all', ...Array.from(new Set(readings.map(r => r.period)))];

  const filtered = readings.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.unit.toLowerCase().includes(q) || r.tenant.toLowerCase().includes(q) || r.property.toLowerCase().includes(q);
    const matchType   = typeFilter  === 'all' || r.type.toLowerCase() === typeFilter;
    const matchMonth  = monthFilter === 'all' || r.period === monthFilter;
    return matchSearch && matchType && matchMonth;
  });

  const totalWater = readings.filter(r => r.type === 'Water').reduce((s, r) => s + r.amount, 0);
  const totalElec  = readings.filter(r => r.type === 'Electricity').reduce((s, r) => s + r.amount, 0);
  const avgConsump = readings.length
    ? Math.round(readings.reduce((s, r) => s + r.units, 0) / readings.length)
    : 0;

  function handleAdd(data: MockReading) {
    setReadings(prev => [data, ...prev]);
    setShowModal(false);
  }

  function handleExport() {
    downloadPDF('meter-readings.csv', readings.map(r => ({
      Period:      r.period,
      Unit:        r.unit,
      Property:    r.property,
      Type:        r.type,
      'Prev Reading': r.prev,
      'Curr Reading': r.curr,
      'Units Consumed': r.units,
      'Rate (KES)': r.rate,
      'Amount (KES)': r.amount,
      Tenant:      r.tenant,
    })));
  }

  return (
    <div className="page-root" ref={containerRef}>

      {/* Header */}
      <div className="page-header mr-header-anim">
        <div>
          <p className="mr-section-label">Utilities</p>
          <h1 className="page-title">Meter Readings</h1>
          <p className="mr-subtitle">Track water &amp; electricity consumption per unit</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-outline" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
          <button type="button" className="btn-mint" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Record Reading
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="pay-summary-grid mr-header-anim">
        <div className="white-card pay-summary-card">
          <div className="pay-summary-row">
            <span className="pay-summary-label">Total Water Billed</span>
            <div className="icon-badge icon-badge-blue">
              <Droplets size={15} color="#4d7cff" />
            </div>
          </div>
          <div className="pay-summary-value">{totalWater.toLocaleString()}</div>
          <div className="pay-summary-sub">KES this period</div>
        </div>

        <div className="white-card pay-summary-card">
          <div className="pay-summary-row">
            <span className="pay-summary-label">Total Electricity Billed</span>
            <div className="icon-badge icon-badge-amber">
              <Zap size={15} color="#f59e0b" />
            </div>
          </div>
          <div className="pay-summary-value">{totalElec.toLocaleString()}</div>
          <div className="pay-summary-sub">KES this period</div>
        </div>

        <div className="white-card pay-summary-card">
          <div className="pay-summary-row">
            <span className="pay-summary-label">Avg Consumption</span>
            <div className="icon-badge icon-badge-green">
              <BarChart3 size={15} color="#00b87a" />
            </div>
          </div>
          <div className="pay-summary-value pay-summary-green">{avgConsump}</div>
          <div className="pay-summary-sub">Units per reading</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="white-card filter-bar mr-header-anim">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="text"
            aria-label="Search meter readings"
            className="input-light filter-search"
            placeholder="Search unit, tenant or property..."
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
          {(['all', 'water', 'electricity'] as const).map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? 'pill pill-active' : 'pill'}
            >
              {t === 'all' ? 'All' : t === 'water' ? '💧 Water' : '⚡ Electricity'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="light-table-wrap">
        {/* Table header */}
        <div className="mr-table-head">
          <span>Tenant</span>
          <span>Unit</span>
          <span>Period</span>
          <span>Type</span>
          <span>Reading (prev → curr)</span>
          <span>Consumed</span>
          <span>Billed (KES)</span>
        </div>

        {filtered.length === 0 ? (
          <div className="td-empty">No readings match your filters</div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="mr-table-row mr-row">
              <div>
                <div className="mr-tenant-name">{r.tenant}</div>
                <div className="mr-property-text">{r.property}</div>
              </div>

              <span className="mr-unit-text">{r.unit}</span>
              <span className="mr-period-text">{r.period}</span>

              <div>
                {r.type === 'Water' ? (
                  <span className="meter-water"><Droplets size={14} /> W</span>
                ) : (
                  <span className="meter-elec"><Zap size={14} /> E</span>
                )}
              </div>

              <div className="mr-reading-wrap">
                <span className="mr-reading-prev">{r.prev.toLocaleString()}</span>
                <ArrowRight size={12} color="#9ca3af" />
                <span className="mr-reading-curr">{r.curr.toLocaleString()}</span>
              </div>

              <span className="chip-consumed">{r.units} units</span>

              <div className="mr-amount-cell">{r.amount.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Meter Reading"
        description="Enter the current meter reading. The bill will be calculated automatically."
        size="md"
      >
        <RecordReadingForm
          onSubmit={handleAdd}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};
