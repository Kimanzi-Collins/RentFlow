import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import { Plus, Search, Edit, Trash2, Home, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { downloadPDF } from '@/lib/export';
import type { UnitWithTenant } from '@/types';

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_UNITS: UnitWithTenant[] = [
  {
    id: '1', property_id: '1', unit_number: 'A-101', bedrooms: 1, bathrooms: 1,
    rent_amount: 18000, deposit_amount: 18000, status: 'occupied', amenities: [],
    created_at: new Date().toISOString(),
    tenant: { id: 't1', property_id: '1', unit_id: '1', full_name: 'Grace Wanjiku', email: 'grace@example.com', phone: '0712345678', status: 'active', balance: 0, total_paid: 0, created_at: new Date().toISOString() } as any,
    property: { id: '1', name: 'Sunset Apartments' } as any,
  },
  {
    id: '2', property_id: '1', unit_number: 'A-102', bedrooms: 2, bathrooms: 1,
    rent_amount: 25000, deposit_amount: 25000, status: 'occupied', amenities: [],
    created_at: new Date().toISOString(),
    tenant: { id: 't2', property_id: '1', unit_id: '2', full_name: 'John Kamau', email: 'john@example.com', phone: '0798765432', status: 'active', balance: 0, total_paid: 0, created_at: new Date().toISOString() } as any,
    property: { id: '1', name: 'Sunset Apartments' } as any,
  },
  {
    id: '3', property_id: '1', unit_number: 'A-103', bedrooms: 0, bathrooms: 1,
    rent_amount: 12000, deposit_amount: 12000, status: 'vacant', amenities: [],
    created_at: new Date().toISOString(),
    property: { id: '1', name: 'Sunset Apartments' } as any,
  },
  {
    id: '4', property_id: '2', unit_number: 'B-201', bedrooms: 3, bathrooms: 2,
    rent_amount: 45000, deposit_amount: 45000, status: 'occupied', amenities: [],
    created_at: new Date().toISOString(),
    tenant: { id: 't3', property_id: '2', unit_id: '4', full_name: 'Sarah Otieno', email: 'sarah@example.com', phone: '0722000111', status: 'active', balance: 0, total_paid: 0, created_at: new Date().toISOString() } as any,
    property: { id: '2', name: 'Green Valley Estate' } as any,
  },
  {
    id: '5', property_id: '2', unit_number: 'B-202', bedrooms: 2, bathrooms: 1,
    rent_amount: 28000, deposit_amount: 28000, status: 'occupied', amenities: [],
    created_at: new Date().toISOString(),
    tenant: { id: 't4', property_id: '2', unit_id: '5', full_name: 'Mike Njoroge', email: 'mike@example.com', phone: '0733999888', status: 'active', balance: 0, total_paid: 0, created_at: new Date().toISOString() } as any,
    property: { id: '2', name: 'Green Valley Estate' } as any,
  },
  {
    id: '6', property_id: '2', unit_number: 'B-203', bedrooms: 1, bathrooms: 1,
    rent_amount: 18000, deposit_amount: 18000, status: 'vacant', amenities: [],
    created_at: new Date().toISOString(),
    property: { id: '2', name: 'Green Valley Estate' } as any,
  },
];

const PROPERTY_OPTIONS = [
  { value: '',  label: 'All Properties' },
  { value: '1', label: 'Sunset Apartments' },
  { value: '2', label: 'Green Valley Estate' },
  { value: '3', label: 'City View Tower' },
  { value: '4', label: 'Riverside Villas' },
];

const STATUS_PILLS = [
  { value: '',         label: 'All' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant',   label: 'Vacant' },
];

const UNIT_TYPES = ['Studio', '1BR', '2BR', '3BR'] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────
function unitTypeLabel(bedrooms: number): string {
  if (bedrooms === 0) return 'Studio';
  if (bedrooms === 1) return '1BR';
  if (bedrooms === 2) return '2BR';
  if (bedrooms === 3) return '3BR';
  return `${bedrooms}BR`;
}

function bedroomsFromType(type: string): number {
  if (type === 'Studio') return 0;
  if (type === '1BR') return 1;
  if (type === '2BR') return 2;
  if (type === '3BR') return 3;
  return 0;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Unit Form ──────────────────────────────────────────────────────────────────
interface UnitFormFields {
  unit_number: string;
  property_id: string;
  unit_type: string;
  rent_amount: string;
  status: 'occupied' | 'vacant';
}

interface UnitFormProps {
  initial?: Partial<UnitWithTenant>;
  onSubmit: (data: UnitWithTenant) => void;
  onCancel: () => void;
}

function UnitForm({ initial, onSubmit, onCancel }: UnitFormProps) {
  const [form, setForm] = useState<UnitFormFields>({
    unit_number: initial?.unit_number ?? '',
    property_id: initial?.property_id ?? '1',
    unit_type: unitTypeLabel(initial?.bedrooms ?? 0),
    rent_amount: initial?.rent_amount ? String(initial.rent_amount) : '',
    status: (initial?.status === 'occupied' || initial?.status === 'vacant')
      ? initial.status : 'vacant',
  });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.unit_number.trim()) { setError('Unit number is required.'); return; }
    if (!form.rent_amount || Number(form.rent_amount) <= 0) { setError('A valid rent amount is required.'); return; }
    setError('');
    const propOption = PROPERTY_OPTIONS.find(p => p.value === form.property_id);
    onSubmit({
      id: initial?.id ?? String(Date.now()),
      property_id: form.property_id,
      unit_number: form.unit_number.trim(),
      bedrooms: bedroomsFromType(form.unit_type),
      bathrooms: 1,
      rent_amount: Number(form.rent_amount),
      deposit_amount: Number(form.rent_amount),
      status: form.status,
      amenities: [],
      created_at: initial?.created_at ?? new Date().toISOString(),
      property: { id: form.property_id, name: propOption?.label ?? '' } as any,
      tenant: initial?.tenant,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form-col">
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid-2">
        <div className="form-full">
          <label htmlFor="unit-number" className="label-light">Unit Number *</label>
          <input
            id="unit-number"
            aria-label="Unit Number"
            className="input-light"
            placeholder="e.g. A-101"
            value={form.unit_number}
            onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="unit-property" className="label-light">Property</label>
          <select
            id="unit-property"
            aria-label="Property"
            className="input-light"
            value={form.property_id}
            onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
          >
            {PROPERTY_OPTIONS.filter(p => p.value).map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="unit-type" className="label-light">Type</label>
          <select
            id="unit-type"
            aria-label="Unit Type"
            className="input-light"
            value={form.unit_type}
            onChange={e => setForm(f => ({ ...f, unit_type: e.target.value }))}
          >
            {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="unit-rent" className="label-light">Rent Amount (KES) *</label>
          <input
            id="unit-rent"
            aria-label="Rent Amount in KES"
            className="input-light"
            type="number"
            placeholder="18000"
            min="0"
            value={form.rent_amount}
            onChange={e => setForm(f => ({ ...f, rent_amount: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="unit-status" className="label-light">Status</label>
          <select
            id="unit-status"
            aria-label="Unit Status"
            className="input-light"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as 'occupied' | 'vacant' }))}
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      <div className="prop-form-actions">
        <button type="button" className="prop-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="prop-form-submit">
          {initial?.id ? 'Save Changes' : 'Add Unit'}
        </button>
      </div>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const Units: React.FC = () => {
  const { profile } = useAuthStore();
  const isLandlord = profile?.role === 'landlord';

  const [units, setUnits]                   = useState<UnitWithTenant[]>(INITIAL_UNITS);
  const [search, setSearch]                 = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [editTarget, setEditTarget]         = useState<UnitWithTenant | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useGSAP(() => {
    if (tableBodyRef.current) {
      const rows = tableBodyRef.current.querySelectorAll('tr');
      gsap.fromTo(rows,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, { scope: containerRef });

  const filtered = units.filter(u => {
    const q = search.toLowerCase();
    const matchSearch   = u.unit_number.toLowerCase().includes(q) ||
                          (u.tenant?.full_name ?? '').toLowerCase().includes(q) ||
                          (u.property?.name ?? '').toLowerCase().includes(q);
    const matchProperty = !propertyFilter || u.property_id === propertyFilter;
    const matchStatus   = !statusFilter   || u.status === statusFilter;
    return matchSearch && matchProperty && matchStatus;
  });

  const totalUnits    = units.length;
  const occupiedCount = units.filter(u => u.status === 'occupied').length;
  const vacantCount   = units.filter(u => u.status === 'vacant').length;

  function handleAdd(data: UnitWithTenant) {
    setUnits(prev => [...prev, data]);
    setShowModal(false);
  }

  function handleEdit(data: UnitWithTenant) {
    setUnits(prev => prev.map(u => u.id === data.id ? data : u));
    setEditTarget(null);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this unit? This cannot be undone.')) {
      setUnits(prev => prev.filter(u => u.id !== id));
    }
  }

  function handleExport() {
    downloadPDF('units.csv', units.map(u => ({
      'Unit #': u.unit_number,
      Property: u.property?.name ?? '',
      Type: unitTypeLabel(u.bedrooms),
      'Rent (KES)': u.rent_amount,
      Status: u.status,
      Tenant: u.tenant?.full_name ?? '',
    })));
  }

  const statCards = [
    { label: 'Total Units', value: totalUnits,    sub: 'across all properties',                                             iconCls: 'stat-icon-blue',  valCls: 'stat-value-blue',  iconColor: '#4d7cff' },
    { label: 'Occupied',    value: occupiedCount, sub: `${totalUnits ? Math.round((occupiedCount/totalUnits)*100) : 0}% occupancy`, iconCls: 'stat-icon-green', valCls: 'stat-value-green', iconColor: '#1c1c1c' },
    { label: 'Vacant',      value: vacantCount,   sub: `${totalUnits ? Math.round((vacantCount/totalUnits)*100) : 0}% available`,   iconCls: 'stat-icon-amber', valCls: 'stat-value-amber', iconColor: '#f59e0b' },
  ];

  return (
    <div ref={containerRef} className="page-root">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">Units</h1>
        <div className="page-actions">
          <button type="button" className="btn-outline" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
          {isLandlord && (
            <button
              type="button"
              className="btn-mint"
              onClick={() => { setEditTarget(null); setShowModal(true); }}
            >
              <Plus size={16} /> Add Unit
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid-3">
        {statCards.map(s => (
          <div key={s.label} className="white-card stat-card">
            <div className={`stat-icon-wrap ${s.iconCls}`}>
              <Home size={20} color={s.iconColor} />
            </div>
            <div>
              <p className={`stat-value ${s.valCls}`}>{s.value}</p>
              <p className="label-light">{s.label}</p>
              <p className="stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="white-card filter-bar">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="text"
            aria-label="Search units"
            className="input-light filter-search"
            placeholder="Search units or tenants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          aria-label="Filter by property"
          className="input-light filter-select"
          value={propertyFilter}
          onChange={e => setPropertyFilter(e.target.value)}
        >
          {PROPERTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="filter-pills">
          {STATUS_PILLS.map(o => (
            <button
              type="button"
              key={o.value}
              onClick={() => setStatusFilter(o.value)}
              className={statusFilter === o.value ? 'pill pill-active' : 'pill'}
            >
              {o.label}
            </button>
          ))}
        </div>

        <span className="filter-count">
          {filtered.length} {filtered.length === 1 ? 'unit' : 'units'}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="light-table-wrap">
        <div className="table-scroll">
          <table className="light-table">
            <thead>
              <tr>
                {['Unit #', 'Property', 'Type', 'Rent (KES)', 'Status', 'Tenant', 'Actions'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody ref={tableBodyRef}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td-empty">
                    <Home size={32} color="#d1d5db" style={{ margin: '0 auto 10px', display: 'block' }} />
                    No units match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(unit => {
                  const isOccupied = unit.status === 'occupied';
                  return (
                    <tr key={unit.id}>
                      <td><span className="td-unit-number">{unit.unit_number}</span></td>

                      <td><span className="td-secondary">{unit.property?.name ?? '—'}</span></td>

                      <td><span className="chip-neutral">{unitTypeLabel(unit.bedrooms)}</span></td>

                      <td><span className="td-money">{formatCurrency(unit.rent_amount)}</span></td>

                      <td>
                        <span className={isOccupied ? 'badge-occupied' : 'badge-vacant'}>
                          {isOccupied ? 'Occupied' : 'Vacant'}
                        </span>
                      </td>

                      <td>
                        {unit.tenant ? (
                          <div className="tenant-avatar">
                            <div className="avatar-circle">
                              {getInitials(unit.tenant.full_name)}
                            </div>
                            <span className="td-primary">{unit.tenant.full_name}</span>
                          </div>
                        ) : (
                          <span className="td-secondary">—</span>
                        )}
                      </td>

                      <td>
                        <div className="td-actions">
                          <button
                            type="button"
                            title="Edit unit"
                            className="btn-icon-light"
                            onClick={() => { setEditTarget(unit); setShowModal(true); }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            title="Delete unit"
                            className="btn-icon-danger"
                            onClick={() => handleDelete(unit.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Unit' : 'Add Unit'}
        description={editTarget ? 'Update unit details below.' : 'Enter the details for the new unit.'}
        size="md"
      >
        <UnitForm
          initial={editTarget ?? undefined}
          onSubmit={editTarget ? handleEdit : handleAdd}
          onCancel={() => { setShowModal(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
};
