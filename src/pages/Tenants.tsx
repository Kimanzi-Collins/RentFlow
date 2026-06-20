import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Building2, Search, Plus, Mail, Phone, Calendar, Users, Edit2, Trash2, Download,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Modal from '@/components/ui/Modal';
import { downloadPDF } from '@/lib/export';

// ── Types ──────────────────────────────────────────────────────────────────────
interface MockTenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  status: 'active' | 'pending' | 'inactive';
  leaseStart: string;
  rent: number;
  role: 'Tenant' | 'Caretaker';
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_TENANTS: MockTenant[] = [
  { id: '1', name: 'Grace Wanjiku',  email: 'grace@email.com',  phone: '+254 701 234 567', property: 'Sunset',       unit: 'A-101', status: 'active',  leaseStart: 'Jan 2024', rent: 18000, role: 'Tenant' },
  { id: '2', name: 'John Kamau',     email: 'john@email.com',   phone: '+254 702 345 678', property: 'Sunset',       unit: 'A-102', status: 'active',  leaseStart: 'Mar 2023', rent: 25000, role: 'Tenant' },
  { id: '3', name: 'Sarah Otieno',   email: 'sarah@email.com',  phone: '+254 703 456 789', property: 'Green Valley', unit: 'B-201', status: 'active',  leaseStart: 'Jun 2024', rent: 45000, role: 'Tenant' },
  { id: '4', name: 'Mike Njoroge',   email: 'mike@email.com',   phone: '+254 704 567 890', property: 'Green Valley', unit: 'B-202', status: 'active',  leaseStart: 'Feb 2024', rent: 28000, role: 'Tenant' },
  { id: '5', name: 'Peter Ochieng',  email: 'peter@email.com',  phone: '+254 705 678 901', property: 'Sunset',       unit: 'A-104', status: 'pending', leaseStart: 'Jul 2025', rent: 20000, role: 'Tenant' },
];

const PROPERTY_OPTIONS = ['Sunset', 'Green Valley', 'City View', 'Riverside'];
const GRAD_CLASSES      = ['avatar-grad-0', 'avatar-grad-1', 'avatar-grad-2', 'avatar-grad-3'];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function gradClass(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % GRAD_CLASSES.length;
  return GRAD_CLASSES[h];
}

// ── Tenant Form ────────────────────────────────────────────────────────────────
interface TenantFormFields {
  name: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  rent: string;
  leaseStart: string;
  role: 'Tenant' | 'Caretaker';
}

interface TenantFormProps {
  initial?: Partial<MockTenant>;
  onSubmit: (data: MockTenant) => void;
  onCancel: () => void;
}

function TenantForm({ initial, onSubmit, onCancel }: TenantFormProps) {
  const [form, setForm] = useState<TenantFormFields>({
    name:       initial?.name       ?? '',
    email:      initial?.email      ?? '',
    phone:      initial?.phone      ?? '',
    property:   initial?.property   ?? 'Sunset',
    unit:       initial?.unit       ?? '',
    rent:       initial?.rent       ? String(initial.rent) : '',
    leaseStart: initial?.leaseStart ?? '',
    role:       initial?.role       ?? 'Tenant',
  });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())  { setError('Full name is required.'); return; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return; }
    if (!form.unit.trim())  { setError('Unit number is required.'); return; }
    if (!form.rent || Number(form.rent) <= 0) { setError('Monthly rent is required.'); return; }
    setError('');
    onSubmit({
      id:         initial?.id ?? String(Date.now()),
      name:       form.name.trim(),
      email:      form.email.trim(),
      phone:      form.phone.trim(),
      property:   form.property,
      unit:       form.unit.trim(),
      rent:       Number(form.rent),
      leaseStart: form.leaseStart || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status:     initial?.status ?? 'active',
      role:       form.role,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form-col">
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid-2">
        <div className="form-full">
          <label htmlFor="t-name" className="label-light">Full Name *</label>
          <input id="t-name" aria-label="Full Name" className="input-light"
            placeholder="e.g. Grace Wanjiku" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="t-email" className="label-light">Email</label>
          <input id="t-email" aria-label="Email address" className="input-light"
            type="email" placeholder="tenant@email.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="t-phone" className="label-light">Phone *</label>
          <input id="t-phone" aria-label="Phone number" className="input-light"
            placeholder="+254 7XX XXX XXX" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="t-property" className="label-light">Property</label>
          <select id="t-property" aria-label="Property" className="input-light"
            value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))}>
            {PROPERTY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="t-unit" className="label-light">Unit Number *</label>
          <input id="t-unit" aria-label="Unit number" className="input-light"
            placeholder="e.g. A-101" value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="t-rent" className="label-light">Monthly Rent (KES) *</label>
          <input id="t-rent" aria-label="Monthly rent in KES" className="input-light"
            type="number" min="0" placeholder="18000" value={form.rent}
            onChange={e => setForm(f => ({ ...f, rent: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="t-lease" className="label-light">Lease Start Date</label>
          <input id="t-lease" aria-label="Lease start date" className="input-light"
            type="date" value={form.leaseStart}
            onChange={e => setForm(f => ({ ...f, leaseStart: e.target.value }))} />
        </div>

        <div>
          <label htmlFor="t-role" className="label-light">Role</label>
          <select id="t-role" aria-label="Role" className="input-light"
            value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'Tenant' | 'Caretaker' }))}>
            <option value="Tenant">Tenant</option>
            <option value="Caretaker">Caretaker</option>
          </select>
        </div>
      </div>

      <div className="prop-form-actions">
        <button type="button" className="prop-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="prop-form-submit">
          {initial?.id ? 'Save Changes' : 'Add Tenant'}
        </button>
      </div>
    </form>
  );
}

// ── Tenant Card ────────────────────────────────────────────────────────────────
interface TenantCardProps {
  tenant: MockTenant;
  onEdit: () => void;
  onDelete: () => void;
}

function TenantCard({ tenant, onEdit, onDelete }: TenantCardProps) {
  const statusBadge =
    tenant.status === 'active'  ? 'badge-occupied' :
    tenant.status === 'pending' ? 'badge-pending'  : 'badge-vacant';

  return (
    <div className="white-card tenant-card-light tenant-card-body">
      {/* Top: Avatar + Name + Status */}
      <div className="tenant-card-top">
        <div className={`avatar-initials ${gradClass(tenant.name)}`}>
          {getInitials(tenant.name)}
        </div>
        <div className="tenant-card-info">
          <div className="tenant-card-name-row">
            <span className="tenant-name">{tenant.name}</span>
            <span className={statusBadge}>
              {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
            </span>
          </div>
          <div className="tenant-contact-row">
            <Mail size={12} />
            <span className="tenant-email-text">{tenant.email || '—'}</span>
          </div>
          <div className="tenant-contact-row-2">
            <Phone size={12} />
            <span>{tenant.phone}</span>
          </div>
        </div>
      </div>

      <div className="tenant-divider" />

      {/* Property badge */}
      <div className="tenant-property-badge">
        <Building2 size={12} />
        {tenant.property} · {tenant.unit}
      </div>

      {/* Lease + Rent */}
      <div className="tenant-bottom-row">
        <div className="tenant-lease-label">
          <Calendar size={12} />
          Since {tenant.leaseStart}
        </div>
        <div>
          <span className="tenant-rent-value">{tenant.rent.toLocaleString()}</span>
          <span className="tenant-rent-unit">KES/mo</span>
        </div>
      </div>

      {/* Actions */}
      <div className="tenant-actions">
        <button type="button" className="btn-icon-light" title="Edit tenant" onClick={onEdit}>
          <Edit2 size={14} />
        </button>
        <button type="button" className="btn-icon-danger" title="Delete tenant" onClick={onDelete}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const Tenants: React.FC = () => {
  useAuthStore();
  const [tenants, setTenants]       = useState<MockTenant[]>(INITIAL_TENANTS);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<MockTenant | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.page-header-anim',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    gsap.fromTo('.tenant-card',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 }
    );
  }, { scope: containerRef, dependencies: [tenants.length] });

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleAdd(data: MockTenant) {
    setTenants(prev => [...prev, data]);
    setShowModal(false);
  }

  function handleEdit(data: MockTenant) {
    setTenants(prev => prev.map(t => t.id === data.id ? data : t));
    setEditTarget(null);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (window.confirm('Remove this tenant? This cannot be undone.')) {
      setTenants(prev => prev.filter(t => t.id !== id));
    }
  }

  function handleExport() {
    downloadPDF('tenants.csv', tenants.map(t => ({
      Name:          t.name,
      Email:         t.email,
      Phone:         t.phone,
      Property:      t.property,
      Unit:          t.unit,
      'Rent (KES)':  t.rent,
      Status:        t.status,
      'Lease Start': t.leaseStart,
      Role:          t.role,
    })));
  }

  return (
    <div className="page-root" ref={containerRef}>

      {/* Header */}
      <div className="page-header page-header-anim">
        <div>
          <p className="label-light page-section-label">People</p>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">
            {tenants.filter(t => t.status === 'active').length} active tenants across your properties
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-outline" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
          <button type="button" className="btn-mint" onClick={() => { setEditTarget(null); setShowModal(true); }}>
            <Plus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="white-card filter-bar page-header-anim">
        <div className="filter-search-wrap">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            aria-label="Search tenants"
            className="input-light filter-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {(['all', 'active', 'pending', 'inactive'] as const).map(s => (
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
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="white-card empty-state-card">
          <Users size={40} className="empty-state-icon" />
          <p className="empty-state-text">No tenants match your filters</p>
        </div>
      ) : (
        <div className="tenant-grid">
          {filtered.map(tenant => (
            <div key={tenant.id} className="tenant-card">
              <TenantCard
                tenant={tenant}
                onEdit={() => { setEditTarget(tenant); setShowModal(true); }}
                onDelete={() => handleDelete(tenant.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Tenant' : 'Add Tenant'}
        description={editTarget ? 'Update tenant details below.' : 'Fill in the details to add a new tenant.'}
        size="lg"
      >
        <TenantForm
          initial={editTarget ?? undefined}
          onSubmit={editTarget ? handleEdit : handleAdd}
          onCancel={() => { setShowModal(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
};
