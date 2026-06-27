import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Plus, Search, Filter, Home, CheckCircle2, AlertCircle,
  Download, MoreVertical, Eye, Edit3, Trash2,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF } from '@/lib/export';
import { useUnitStore } from '@/stores/unitStore';
import type { Unit } from '@/stores/unitStore';
import { usePropertyStore } from '@/stores/propertyStore';

const UNIT_TYPES  = ['Residential', 'Commercial', 'Industrial', 'Studio', 'Penthouse'];
const STATUS_OPTS = ['vacant', 'occupied', 'maintenance'] as const;

const FORM_INIT: Omit<Unit, 'id' | 'property' | 'type' | 'tenant'> = {
  unit_number: '', property_id: '', rent_amount: 0, status: 'vacant', bedrooms: 1,
};

const STATUS_STYLE = {
  occupied:    { bg: '#ecfdf5', color: '#059669', label: 'Occupied'    },
  vacant:      { bg: '#fffbeb', color: '#d97706', label: 'Vacant'      },
  maintenance: { bg: '#fef2f2', color: '#dc2626', label: 'Maintenance' },
};

export const Units: React.FC = () => {
  const { units, addUnit, updateUnit, removeUnit, fetchUnits } = useUnitStore();
  const { properties, fetchProperties } = usePropertyStore();
  const { success, error: errorToast } = useToast();

  const [searchTerm, setSearch]   = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [showFilter, setFilter]   = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [editUnit, setEdit]       = useState<Unit | null>(null);
  const [openMenu, setMenu]       = useState<string | null>(null);
  const [form, setForm]           = useState<Omit<Unit, 'id' | 'property' | 'type' | 'tenant'>>(FORM_INIT);
  const [formErr, setFormErr]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProperties();
    fetchUnits();
  }, []);

  useGSAP(
    () => {
      const rows = containerRef.current?.querySelectorAll('tbody tr');
      if (rows) gsap.fromTo(rows,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.38, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: containerRef, dependencies: [units.length, statusFilter, searchTerm] }
  );

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilter(false);
      setMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = units.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || u.unit_number.toLowerCase().includes(q) || u.property.toLowerCase().includes(q) || (u.tenant || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() {
    setEdit(null);
    setForm({ ...FORM_INIT, property_id: properties[0]?.id || '' });
    setFormErr('');
    setShowAdd(true);
  }

  function openEdit(u: Unit) {
    setEdit(u);
    const { id, property, type, tenant, ...rest } = u;
    setForm(rest);
    setFormErr('');
    setShowAdd(true);
    setMenu(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.unit_number.trim())  { setFormErr('Unit number is required.'); return; }
    if (!form.property_id.trim())  { setFormErr('Property is required.'); return; }
    if (!form.rent_amount || form.rent_amount <= 0) { setFormErr('Valid rent amount is required.'); return; }
    setFormErr('');

    setIsSubmitting(true);
    try {
      if (editUnit) {
        const res = await updateUnit(editUnit.id, form);
        if (res.error) { setFormErr(res.error); return; }
        success('Unit updated', `Unit ${form.unit_number} updated.`);
      } else {
        const res = await addUnit(form);
        if (res.error) { setFormErr(res.error); return; }
        success('Unit added', `Unit ${form.unit_number} added.`);
      }
      setShowAdd(false);
      setEdit(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this unit?')) {
      const res: any = await removeUnit(id);
      if (res && res.error) {
        errorToast('Failed to delete', res.error);
      } else {
        success('Unit deleted', 'The unit has been permanently removed.');
      }
      setMenu(null);
    }
  }

  function handleExport() {
    downloadPDF('units-report.pdf', units.map(u => ({
      'Unit #': u.unit_number, Property: u.property, Type: u.type,
      'Rent (KES)': u.rent_amount.toLocaleString(), Status: u.status, Tenant: u.tenant || '—',
    })));
  }

  const occupied    = units.filter(u => u.status === 'occupied').length;
  const vacant      = units.filter(u => u.status === 'vacant').length;

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Units</h1>
          <p className="page-subtitle">Manage all residential and commercial units.</p>
        </div>
        <div className="page-actions">
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search units..." value={searchTerm}
              onChange={e => setSearch(e.target.value)} className="input-organic"
              style={{ paddingLeft: 38, padding: '10px 14px 10px 38px', fontSize: 13 }} />
          </div>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button type="button" className="btn-icon" onClick={() => setFilter(v => !v)} title="Filter">
              <Filter size={17} />
            </button>
            {showFilter && (
              <div className="filter-popover">
                <div className="filter-section-label">Status</div>
                <div className="filter-pill-row">
                  {['all', 'occupied', 'vacant', 'maintenance'].map(s => (
                    <button type="button" key={s} onClick={() => { setStatus(s); setFilter(false); }}
                      className={`filter-chip ${statusFilter === s ? 'active' : ''}`}>
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="button" className="btn-icon" onClick={handleExport} title="Export PDF"><Download size={17} /></button>
          <button type="button" className="btn-organic btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Unit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4" style={{ maxWidth: 520 }}>
        {[
          { label: 'Total',    value: units.length, icon: Home,         bg: '#f5f5f5', color: '#171717' },
          { label: 'Occupied', value: occupied,      icon: CheckCircle2, bg: '#ecfdf5', color: '#059669' },
          { label: 'Vacant',   value: vacant,        icon: AlertCircle,  bg: '#fffbeb', color: '#d97706' },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={19} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-organic" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
          <table className="table-organic w-full">
            <thead>
              <tr>
                <th>Unit #</th>
                <th>Property</th>
                <th>Type</th>
                <th>Tenant</th>
                <th>Rent (KES)</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(unit => {
                const ss = STATUS_STYLE[unit.status];
                return (
                  <tr key={unit.id} style={{ position: 'relative', zIndex: openMenu === unit.id ? 50 : 1 }}>
                    <td style={{ fontWeight: 700 }}>{unit.unit_number}</td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>{unit.property}</td>
                    <td><span style={{ background: 'var(--surface-hover)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{unit.type}</span></td>
                    <td style={{ fontSize: 13, color: unit.tenant ? 'var(--text-main)' : 'var(--text-muted)' }}>{unit.tenant || '—'}</td>
                    <td style={{ fontWeight: 700 }}>KSh {unit.rent_amount.toLocaleString()}</td>
                    <td>
                      <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                        <span className="badge-dot" />{ss.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <button type="button" className="btn-icon" style={{ width: 30, height: 30, border: 'none' }}
                          onClick={() => setMenu(openMenu === unit.id ? null : unit.id)}>
                          <MoreVertical size={14} />
                        </button>
                        {openMenu === unit.id && (
                          <div className="ctx-menu">
                            <button type="button" className="ctx-menu-item" onClick={() => openEdit(unit)}><Edit3 size={13} /> Edit Unit</button>
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                            <button type="button" className="ctx-menu-item danger" onClick={() => handleDelete(unit.id)}><Trash2 size={13} /> Delete Unit</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', borderRadius: 20 }}>
              {searchTerm || statusFilter !== 'all' ? (
                <span style={{ color: 'var(--text-muted)' }}>No units match your filters.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Home size={24} color="#9ca3af" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No units yet</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Add your first unit to a property.</div>
                  </div>
                  <button type="button" onClick={openAdd} className="btn-organic btn-primary" style={{ marginTop: 8 }}>+ Add Unit</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEdit(null); setFormErr(''); }}
        title={editUnit ? 'Edit Unit' : 'Add Unit'}
        description="Configure the unit details.">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formErr && <div className="modal-error">{formErr}</div>}
          <div className="modal-form-grid">
            <div>
              <label className="modal-label">Unit Number *</label>
              <input className="modal-input" placeholder="e.g. A-101" value={form.unit_number}
                onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} />
            </div>
            <div>
              <label className="modal-label">Property *</label>
              <select aria-label="Property" className="modal-input" value={form.property_id}
                onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}>
                <option value="">Select property…</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Bedrooms</label>
              <input type="number" className="modal-input" value={form.bedrooms}
                onChange={e => setForm(f => ({ ...f, bedrooms: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="modal-label">Status</label>
              <select aria-label="Status" className="modal-input" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Unit['status'] }))}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Monthly Rent (KES) *</label>
              <input className="modal-input" type="number" min="0" placeholder="e.g. 35000"
                value={form.rent_amount || ''} onChange={e => setForm(f => ({ ...f, rent_amount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="modal-label">Current Tenant</label>
              <input className="modal-input" value={form.tenant || 'None'} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Tenant is automatically assigned when a lease is created" />
            </div>
          </div>
          <div className="modal-form-actions">
            <button type="button" className="modal-btn-cancel" onClick={() => { setShowAdd(false); setEdit(null); }} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editUnit ? 'Save Changes' : 'Add Unit')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
