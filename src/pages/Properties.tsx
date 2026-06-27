import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, MapPin, Building2, MoreVertical,
  ArrowUpRight, Eye, Edit3, Trash2, Download,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF } from '@/lib/export';
import { usePropertyStore } from '@/stores/propertyStore';
import type { Property } from '@/stores/propertyStore';
import { useBillingStore, CURRENT_PERIOD_KEY } from '@/stores/billingStore';

const PROP_TYPES = ['Residential', 'Commercial', 'Industrial', 'Mixed Use'];
const FORM_INIT: Omit<Property, 'id' | 'landlord_id'> = {
  name: '', address: '', type: 'Residential', total_units: 0, occupied: 0, description: '',
};

const TYPE_COLORS: Record<string, string> = {
  Residential: '#4f46e5', Commercial: '#0891b2', Industrial: '#d97706', 'Mixed Use': '#059669',
};

export const Properties: React.FC = () => {
  const { properties, addProperty, updateProperty, removeProperty } = usePropertyStore();
  const { tenants, getRentForPeriod } = useBillingStore();
  const navigate   = useNavigate();
  const { success, error: errorToast } = useToast();

  const [searchTerm, setSearch]   = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [editProp, setEditProp]   = useState<Property | null>(null);
  const [openMenu, setOpenMenu]   = useState<string | null>(null);
  const [form, setForm]           = useState<Omit<Property, 'id' | 'landlord_id'>>(FORM_INIT);
  const [formErr, setFormErr]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll('.property-card');
      if (cards) gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );
    },
    { scope: containerRef, dependencies: [properties.length, searchTerm] }
  );

  useEffect(() => {
    const h = () => setOpenMenu(null);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Current-period rent data per property
  const periodRecords = getRentForPeriod(CURRENT_PERIOD_KEY);
  function getPropStats(prop: Property) {
    const propTenants = tenants.filter(t => t.property === prop.name && t.status === 'active');
    const ids = propTenants.map(t => t.id);
    const records = periodRecords.filter(r => ids.includes(r.tenant_id));
    const expected  = propTenants.reduce((s, t) => s + t.rent_amount, 0);
    const collected = records.reduce((s, r) => s + r.amount_paid, 0);
    return { expected, collected, tenantCount: propTenants.length };
  }

  function openAdd() {
    setEditProp(null); setForm(FORM_INIT); setFormErr(''); setShowAdd(true);
  }
  function openEdit(p: Property) {
    setEditProp(p);
    const { id, ...rest } = p;
    setForm(rest); setFormErr(''); setShowAdd(true); setOpenMenu(null);
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())    { setFormErr('Property name is required.'); return; }
    if (!form.address.trim()) { setFormErr('Address is required.'); return; }
    setFormErr('');
    setIsSubmitting(true);
    
    try {
      if (editProp) {
        const res = await updateProperty(editProp.id, form);
        if (res.error) {
          setFormErr(res.error);
          return;
        }
        success('Property updated', `${form.name} has been updated.`);
      } else {
        const res = await addProperty(form);
        if (res.error) {
          setFormErr(res.error);
          return;
        }
        success('Property added', `${form.name} added to your portfolio.`);
      }
      setShowAdd(false); setEditProp(null);
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDelete(id: string) {
    const p = properties.find(x => x.id === id);
    const res: any = await removeProperty(id);
    if (res && res.error) {
      errorToast('Failed to delete', res.error);
    } else {
      success('Property removed', `${p?.name} removed.`);
    }
    setOpenMenu(null);
  }
  function handleExport() {
    downloadPDF('properties-report.pdf', properties.map(p => {
      const stats = getPropStats(p);
      return {
        Name: p.name, Address: p.address, Type: p.type,
        'Total Units': p.total_units, Occupied: p.occupied,
        'Occupancy %': `${Math.round((p.occupied / (p.total_units || 1)) * 100)}%`,
        'Active Tenants': stats.tenantCount,
        'Expected Revenue (KES)': stats.expected.toLocaleString(),
        'Collected (KES)': stats.collected.toLocaleString(),
      };
    }));
  }

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">Manage your portfolio and view property analytics.</p>
        </div>
        <div className="page-actions">
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search properties..." value={searchTerm}
              onChange={e => setSearch(e.target.value)} className="input-organic"
              style={{ paddingLeft: 38, padding: '10px 14px 10px 38px', fontSize: 13 }} />
          </div>
          <button type="button" className="btn-icon" onClick={handleExport} title="Export PDF"><Download size={17} /></button>
          <button type="button" className="btn-organic btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Property
          </button>
        </div>
      </div>

      {/* Portfolio summary strip */}
      <div className="grid grid-cols-3 gap-4" style={{ maxWidth: 540 }}>
        {[
          { label: 'Properties',   value: properties.length },
          { label: 'Total Units',  value: properties.reduce((s, p) => s + p.total_units, 0) },
          { label: 'Occupied',     value: properties.reduce((s, p) => s + p.occupied, 0) },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(property => {
          const occ = Math.round((property.occupied / (property.total_units || 1)) * 100);
          const stats = getPropStats(property);
          const color = TYPE_COLORS[property.type] || '#4f46e5';

          return (
            <div key={property.id} className="card-organic property-card"
              style={{ display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer' }}
              onClick={() => navigate(`/properties/${property.id}`)}>

              {/* Type tag + menu */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={20} color="#fff" />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '3px 9px', borderRadius: 99 }}>
                    {property.type}
                  </span>
                </div>
                <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                  <button type="button" className="btn-icon" style={{ width: 30, height: 30, border: 'none' }}
                    onClick={() => setOpenMenu(openMenu === property.id ? null : property.id)}>
                    <MoreVertical size={14} />
                  </button>
                  {openMenu === property.id && (
                    <div className="ctx-menu">
                      <button type="button" className="ctx-menu-item" onClick={() => { navigate(`/properties/${property.id}`); setOpenMenu(null); }}><Eye size={13} /> View Profile</button>
                      <button type="button" className="ctx-menu-item" onClick={() => openEdit(property)}><Edit3 size={13} /> Edit</button>
                      <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                      <button type="button" className="ctx-menu-item danger" onClick={() => handleDelete(property.id)}><Trash2 size={13} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5 }}>{property.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                <MapPin size={13} />{property.address}
              </p>

              {/* Occupancy bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Occupancy</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{occ}%</span>
                </div>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${occ}%`, background: occ > 80 ? '#10b981' : occ > 50 ? '#f59e0b' : '#ef4444', borderRadius: 99 }} />
                </div>
              </div>

              {/* Revenue quick-stat */}
              {stats.expected > 0 && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>KSh {(stats.expected / 1000).toFixed(0)}K</div>
                  </div>
                  <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collected</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#059669', marginTop: 2 }}>KSh {(stats.collected / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Units</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{property.occupied} / {property.total_units}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: color }}>
                  View profile <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', background: '#fff', borderRadius: 20 }}>
            {searchTerm ? (
              <span style={{ color: 'var(--text-muted)' }}>No properties match "{searchTerm}"</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} color="#9ca3af" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No properties yet</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Add your first property to get started with RentFlow.</div>
                </div>
                <button type="button" onClick={() => setShowAdd(true)} className="btn-organic btn-primary" style={{ marginTop: 8 }}>+ Add Property</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditProp(null); setFormErr(''); }}
        title={editProp ? 'Edit Property' : 'Add Property'}
        description="Configure the property's details.">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formErr && <div className="modal-error">{formErr}</div>}
          <div className="modal-form-grid">
            <div><label className="modal-label">Property Name *</label><input className="modal-input" placeholder="Serra Apartments" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <label className="modal-label">Type</label>
              <select aria-label="Property type" className="modal-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {PROP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div><label className="modal-label">Address *</label><input className="modal-input" placeholder="Westlands, Nairobi" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="modal-form-grid">
            <div><label className="modal-label">Total Units</label><input className="modal-input" type="number" min="0" value={form.total_units || ''} onChange={e => setForm(f => ({ ...f, total_units: Number(e.target.value) }))} /></div>
            <div><label className="modal-label">Occupied Units</label><input className="modal-input" type="number" min="0" value={form.occupied || ''} onChange={e => setForm(f => ({ ...f, occupied: Number(e.target.value) }))} /></div>
          </div>
          <div><label className="modal-label">Description (optional)</label><textarea className="modal-input" rows={2} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
          <div className="modal-form-actions">
            <button type="button" className="modal-btn-cancel" onClick={() => setShowAdd(false)} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editProp ? 'Save Changes' : 'Add Property')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
