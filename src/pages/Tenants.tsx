import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Mail, Phone, MoreVertical,
  Eye, Edit3, Trash2, Download, MessageSquare, ArrowUpRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF } from '@/lib/export';
import { useBillingStore } from '@/stores/billingStore';
import { usePropertyStore } from '@/stores/propertyStore';
import { useUnitStore } from '@/stores/unitStore';
import type { TenantConfig } from '@/stores/billingStore';

// Avatar colour palette
const AVATAR_COLORS = ['#4f46e5', '#0891b2', '#d97706', '#10b981', '#ef4444', '#8b5cf6'];
const getColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const FORM_INIT: Omit<TenantConfig, 'id'> = {
  first_name: '', last_name: '', email: '', phone: '', id_number: '',
  unit: '', property: '', status: 'active',
  rent_amount: 0, water_rate: 150, initial_water_reading: 0, move_in_date: '',
};

export const Tenants: React.FC = () => {
  const { tenants, addTenant, updateTenant, removeTenant, getTenantOutstanding } = useBillingStore();
  const { properties } = usePropertyStore();
  const { units } = useUnitStore();
  const navigate = useNavigate();
  const { success } = useToast();

  const [searchTerm, setSearch] = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [openMenu, setMenu]     = useState<number | null>(null);
  const [form, setForm]         = useState<Omit<TenantConfig, 'id'>>(FORM_INIT);
  const [formErr, setFormErr]   = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = containerRef.current?.querySelectorAll('tbody tr');
      if (rows) gsap.fromTo(rows,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.38, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: containerRef, dependencies: [tenants.length, searchTerm] }
  );

  useEffect(() => {
    const h = () => setMenu(null);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = tenants.filter(t =>
    [t.first_name, t.last_name, t.email, t.unit, t.phone].some(v =>
      v.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function openAdd() {
    setEditId(null);
    setForm(FORM_INIT);
    setFormErr('');
    setShowAdd(true);
  }

  function openEdit(t: TenantConfig) {
    setEditId(t.id);
    const { id, ...rest } = t;
    setForm(rest);
    setFormErr('');
    setShowAdd(true);
    setMenu(null);
  }

  // When a unit is selected from the dropdown, auto-fill property + rent
  function handleUnitSelect(unitNumber: string) {
    const u = units.find(x => x.unit_number === unitNumber);
    setForm(f => ({
      ...f,
      unit: unitNumber,
      property: u?.property || f.property,
      rent_amount: u?.rent_amount || f.rent_amount,
    }));
  }

  // When property changes, reset unit selection
  function handlePropertyChange(propName: string) {
    setForm(f => ({ ...f, property: propName, unit: '' }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) { setFormErr('Full name is required.'); return; }
    if (!form.email.trim()) { setFormErr('Email is required.'); return; }
    if (!form.unit.trim())  { setFormErr('Unit is required.'); return; }
    setFormErr('');

    if (editId !== null) {
      updateTenant(editId, form);
      success('Tenant updated', `${form.first_name} ${form.last_name} updated.`);
    } else {
      const newId = Math.max(0, ...tenants.map(t => t.id)) + 1;
      addTenant({ ...form, id: newId });
      success('Tenant added', `${form.first_name} ${form.last_name} has been added.`);
    }
    setShowAdd(false);
    setEditId(null);
  }

  function handleDelete(id: number) {
    const t = tenants.find(x => x.id === id);
    removeTenant(id);
    success('Tenant removed', `${t?.first_name} ${t?.last_name} removed.`);
    setMenu(null);
  }

  function handleExport() {
    downloadPDF('tenants-report.pdf', tenants.map(t => ({
      Name: `${t.first_name} ${t.last_name}`, Email: t.email, Phone: t.phone,
      Unit: t.unit, Property: t.property, Status: t.status,
      'Rent (KES)': t.rent_amount.toLocaleString(),
      'Outstanding (KES)': getTenantOutstanding(t.id).toLocaleString(),
    })));
  }

  const activeTenants   = tenants.filter(t => t.status === 'active').length;
  const inactiveTenants = tenants.filter(t => t.status === 'inactive').length;

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">Manage tenant records, rent, and billing history.</p>
        </div>
        <div className="page-actions">
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search tenants..." value={searchTerm}
              onChange={e => setSearch(e.target.value)} className="input-organic"
              style={{ paddingLeft: 38, padding: '10px 14px 10px 38px', fontSize: 13 }} />
          </div>
          <button type="button" className="btn-icon" onClick={handleExport} title="Export PDF"><Download size={17} /></button>
          <button type="button" className="btn-organic btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',    value: tenants.length,  color: '#4f46e5' },
          { label: 'Active',   value: activeTenants,   color: '#10b981' },
          { label: 'Inactive', value: inactiveTenants, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 6, height: 30, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
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
                <th>Tenant</th>
                <th>Contact</th>
                <th>Unit</th>
                <th>Monthly Rent</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tenant => {
                const outstanding = getTenantOutstanding(tenant.id);
                return (
                  <tr key={tenant.id} style={{ position: 'relative', zIndex: openMenu === tenant.id ? 50 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(tenant.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {tenant.first_name[0]}{tenant.last_name[0]}
                        </div>
                        <div>
                          <button type="button" onClick={() => navigate(`/tenants/${tenant.id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{tenant.first_name} {tenant.last_name}</span>
                            <ArrowUpRight size={12} color="#9ca3af" />
                          </button>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tenant.property || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}><Mail size={11} />{tenant.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}><Phone size={11} />{tenant.phone || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{tenant.unit || '—'}</td>
                    <td style={{ fontWeight: 700 }}>KSh {tenant.rent_amount.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: outstanding > 0 ? '#dc2626' : '#059669' }}>
                        KSh {outstanding.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        <span className="badge-dot" />
                        {tenant.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button type="button" className="btn-icon" style={{ width: 30, height: 30, border: 'none' }}
                          onClick={() => setMenu(openMenu === tenant.id ? null : tenant.id)}>
                          <MoreVertical size={14} />
                        </button>
                        {openMenu === tenant.id && (
                          <div className="ctx-menu">
                            <button type="button" className="ctx-menu-item" onClick={() => { navigate(`/tenants/${tenant.id}`); setMenu(null); }}>
                              <Eye size={13} /> View History
                            </button>
                            <button type="button" className="ctx-menu-item" onClick={() => { success('SMS sent', `Message sent to ${tenant.first_name}`); setMenu(null); }}>
                              <MessageSquare size={13} /> Send SMS
                            </button>
                            <button type="button" className="ctx-menu-item" onClick={() => openEdit(tenant)}>
                              <Edit3 size={13} /> Edit
                            </button>
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                            <button type="button" className="ctx-menu-item danger" onClick={() => handleDelete(tenant.id)}>
                              <Trash2 size={13} /> Remove
                            </button>
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
              {searchTerm ? (
                <span style={{ color: 'var(--text-muted)' }}>No tenants match "{searchTerm}"</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="#9ca3af" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No tenants yet</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Add your first tenant to start tracking rent.</div>
                  </div>
                  <button type="button" onClick={openAdd} className="btn-organic btn-primary" style={{ marginTop: 8 }}>+ Add Tenant</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}
        title={editId !== null ? 'Edit Tenant' : 'Add Tenant'}
        description="Fill in tenant details and initial billing settings.">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formErr && <div className="modal-error">{formErr}</div>}

          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Personal Details</div>
          <div className="modal-form-grid">
            <div><label className="modal-label">First Name *</label><input className="modal-input" placeholder="James" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
            <div><label className="modal-label">Last Name *</label><input className="modal-input" placeholder="Mwangi" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
            <div><label className="modal-label">Email *</label><input className="modal-input" type="email" placeholder="james@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="modal-label">Phone</label><input className="modal-input" placeholder="0712 345 678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="modal-label">ID Number</label><input className="modal-input" placeholder="12345678" value={form.id_number} onChange={e => setForm(f => ({ ...f, id_number: e.target.value }))} /></div>
            <div><label className="modal-label" htmlFor="t-movein">Move-in Date</label><input id="t-movein" aria-label="Move-in date" title="Move-in date" className="modal-input" type="date" value={form.move_in_date} onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))} /></div>
          </div>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Unit & Billing</div>
          <div className="modal-form-grid">
            <div>
              <label className="modal-label">Property *</label>
              <select aria-label="Property" className="modal-input" value={form.property}
                onChange={e => handlePropertyChange(e.target.value)}>
                <option value="">Select property…</option>
                {properties.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Unit *</label>
              <select aria-label="Unit" className="modal-input" value={form.unit}
                onChange={e => handleUnitSelect(e.target.value)}>
                <option value="">Select unit…</option>
                {units
                  .filter(u => !form.property || u.property === form.property)
                  .map(u => (
                    <option key={u.id} value={u.unit_number}
                      disabled={u.status === 'occupied' && u.unit_number !== form.unit}>
                      {u.unit_number}{u.status === 'occupied' ? ` (Occupied${u.tenant ? ' – ' + u.tenant : ''})` : ` – ${u.status.charAt(0).toUpperCase() + u.status.slice(1)}`}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="modal-label">Monthly Rent (KES)</label>
              <input className="modal-input" type="number" min="0" placeholder="Auto-filled from unit"
                value={form.rent_amount || ''} onChange={e => setForm(f => ({ ...f, rent_amount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="modal-label">Water Rate (KES/m³)</label>
              <input className="modal-input" type="number" min="0" placeholder="150"
                value={form.water_rate || ''} onChange={e => setForm(f => ({ ...f, water_rate: Number(e.target.value) }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="modal-label">Initial Water Reading (m³)</label>
              <input className="modal-input" type="number" min="0" placeholder="Meter reading at move-in"
                value={form.initial_water_reading || ''} onChange={e => setForm(f => ({ ...f, initial_water_reading: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="modal-form-actions">
            <button type="button" className="modal-btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="modal-btn-submit">{editId !== null ? 'Save Changes' : 'Add Tenant'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
