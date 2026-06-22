import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import {
  ArrowLeft, Building2, MapPin, Home, Users, CreditCard,
  TrendingUp, AlertTriangle, Download, Edit3,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPropertyReport } from '@/lib/export';
import { usePropertyStore } from '@/stores/propertyStore';
import {
  useBillingStore,
  getAvailablePeriods,
  makePeriodKey,
  CURRENT_PERIOD_KEY,
} from '@/stores/billingStore';

// ─── Revenue data across all tracked months ───────────────────────────────────

function buildRevenueData(propName: string) {
  const { tenants, rentRecords } = useBillingStore.getState();
  const propTenantIds = tenants
    .filter(t => t.property === propName && t.status === 'active')
    .map(t => t.id);

  return getAvailablePeriods()
    .slice()                      // already most-recent-first
    .reverse()                    // oldest first for the chart
    .map(p => {
      const records  = rentRecords.filter(r => r.period_key === p.key && propTenantIds.includes(r.tenant_id));
      const expected  = records.reduce((s, r) => s + r.rent_due, 0);
      const collected = records.reduce((s, r) => s + r.amount_paid, 0);
      return {
        month: p.label.split(' ')[0].slice(0, 3), // "Jan", "Feb", …
        expected,
        collected,
      };
    });
}

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-main)', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, color: p.color }}>
          <span>{p.name === 'expected' ? 'Expected' : 'Collected'}</span>
          <span style={{ fontWeight: 700 }}>KSh {Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Edit property modal ──────────────────────────────────────────────────────

const EditModal: React.FC<{
  propId: number;
  initial: { name: string; address: string; description?: string; total_units: number; occupied: number };
  onClose: () => void;
}> = ({ propId, initial, onClose }) => {
  const { updateProperty } = usePropertyStore();
  const { success } = useToast();
  const [form, setForm] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProperty(propId, form);
    success('Property updated');
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label className="modal-label">Property Name</label><input className="modal-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div><label className="modal-label">Address</label><input className="modal-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
      <div className="modal-form-grid">
        <div><label className="modal-label">Total Units</label><input className="modal-input" type="number" min="0" value={form.total_units || ''} onChange={e => setForm(f => ({ ...f, total_units: Number(e.target.value) }))} /></div>
        <div><label className="modal-label">Occupied</label><input className="modal-input" type="number" min="0" value={form.occupied || ''} onChange={e => setForm(f => ({ ...f, occupied: Number(e.target.value) }))} /></div>
      </div>
      <div><label className="modal-label">Description</label><textarea className="modal-input" rows={2} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
      <div className="modal-form-actions">
        <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn-submit">Save Changes</button>
      </div>
    </form>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { properties } = usePropertyStore();
  const { tenants, rentRecords, getTenantOutstanding } = useBillingStore();

  const propId   = parseInt(id ?? '0', 10);
  const property = properties.find(p => p.id === propId);

  const [tab, setTab]       = useState<'tenants' | 'units'>('tenants');
  const [editOpen, setEdit] = useState(false);

  useGSAP(() => {
    gsap.fromTo('.pd-gsap',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.05 }
    );
  }, { dependencies: [propId] });

  if (!property) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Property not found.</p>
        <button type="button" className="btn-organic btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/properties')}>
          Back to Properties
        </button>
      </div>
    );
  }

  // Derived data
  const propTenants    = tenants.filter(t => t.property === property.name && t.status === 'active');
  const propTenantIds  = propTenants.map(t => t.id);
  const currentRecords = rentRecords.filter(r => r.period_key === CURRENT_PERIOD_KEY && propTenantIds.includes(r.tenant_id));

  const expectedRevenue  = propTenants.reduce((s, t) => s + t.rent_amount, 0);
  const collectedRevenue = currentRecords.reduce((s, r) => s + r.amount_paid, 0);
  const outstandingRent  = currentRecords.reduce((s, r) => s + r.balance, 0);
  const collectionPct    = expectedRevenue > 0 ? Math.round((collectedRevenue / expectedRevenue) * 100) : 0;
  const occupancyPct     = property.total_units > 0 ? Math.round((property.occupied / property.total_units) * 100) : 0;
  const vacantUnits      = property.total_units - property.occupied;

  const revenueData = buildRevenueData(property.name);

  const occupancyPie = [
    { name: 'Occupied',    value: property.occupied,               fill: '#171717' },
    { name: 'Vacant',      value: Math.max(0, vacantUnits),        fill: '#e5e7eb' },
  ];

  const TYPE_COLOR: Record<string, string> = {
    Residential: '#4f46e5', Commercial: '#0891b2', Industrial: '#d97706', 'Mixed Use': '#059669',
  };
  const propColor = TYPE_COLOR[property.type] || '#4f46e5';

  function handleExport() {
    const rows = propTenants.map(t => {
      const rec = currentRecords.find(r => r.tenant_id === t.id);
      return {
        Tenant: `${t.first_name} ${t.last_name}`,
        Unit: t.unit,
        'Rent Due (KES)': t.rent_amount.toLocaleString(),
        'Paid (KES)': (rec?.amount_paid ?? 0).toLocaleString(),
        'Balance (KES)': (rec?.balance ?? t.rent_amount).toLocaleString(),
        Status: rec?.status ?? 'unpaid',
        'Total Outstanding (KES)': getTenantOutstanding(t.id).toLocaleString(),
      };
    });
    downloadPropertyReport(property, rows);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>

      {/* Back */}
      <button type="button" onClick={() => navigate('/properties')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit', padding: 0, alignSelf: 'flex-start' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
        <ArrowLeft size={14} /> Properties
      </button>

      {/* Header card */}
      <div className="card-organic pd-gsap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: propColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{property.name}</h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: propColor, background: `${propColor}18`, padding: '3px 9px', borderRadius: 99 }}>{property.type}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} /> {property.address}
            </p>
            {property.description && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{property.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-icon" onClick={handleExport} title="Download report"><Download size={17} /></button>
          <button type="button" className="btn-organic btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setEdit(true)}>
            <Edit3 size={14} /> Edit
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pd-gsap">
        {[
          { label: 'Total Units',    value: property.total_units,                      icon: <Home size={17} color="#4f46e5" />,           bg: '#eff6ff' },
          { label: 'Active Tenants', value: propTenants.length,                        icon: <Users size={17} color="#0891b2" />,           bg: '#ecfeff' },
          { label: 'Rent Expected',  value: `KSh ${(expectedRevenue/1000).toFixed(0)}K`, icon: <CreditCard size={17} color="#d97706" />,     bg: '#fffbeb' },
          { label: 'Collected',      value: `KSh ${(collectedRevenue/1000).toFixed(0)}K (${collectionPct}%)`, icon: <TrendingUp size={17} color="#059669" />, bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pd-gsap">

        {/* Occupancy donut */}
        <div className="card-organic" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Occupancy</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{property.occupied} of {property.total_units} units filled</p>
          </div>
          <div style={{ position: 'relative', width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={occupancyPie} cx="50%" cy="50%" innerRadius={55} outerRadius={78}
                  startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                  {occupancyPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{occupancyPct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>occupancy</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {occupancyPie.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: d.name === 'Occupied' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, display: 'inline-block' }} />
                {d.value} {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly revenue bar chart */}
        <div className="card-organic lg:col-span-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Monthly Revenue</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Expected vs. collected (KES) — 2026</p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#e5e7eb', display: 'inline-block' }} />Expected</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#171717', display: 'inline-block' }} />Collected</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} barSize={14} barGap={4} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }} />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="expected"  fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" fill="#171717" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 4, alignSelf: 'flex-start' }} className="pd-gsap">
        {[
          { key: 'tenants', label: 'Tenants',     icon: <Users size={14} /> },
          { key: 'units',   label: 'Units',        icon: <Home size={14} /> },
        ].map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              background: tab === t.key ? '#171717' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tenants tab ── */}
      {tab === 'tenants' && (
        <div className="card-organic pd-gsap" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Active Tenants — Current Month</h3>
            {outstandingRent > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: 99 }}>
                KSh {outstandingRent.toLocaleString()} outstanding
              </span>
            )}
          </div>
          <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
            <table className="table-organic w-full">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th style={{ textAlign: 'right' }}>Rent</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {propTenants.map(t => {
                  const rec     = currentRecords.find(r => r.tenant_id === t.id);
                  const paid    = rec?.amount_paid ?? 0;
                  const balance = rec?.balance ?? t.rent_amount;
                  const status  = rec?.status ?? 'unpaid';
                  const SS: Record<string, { bg: string; color: string }> = {
                    paid:    { bg: '#ecfdf5', color: '#059669' },
                    partial: { bg: '#eff6ff', color: '#2563eb' },
                    unpaid:  { bg: '#fef2f2', color: '#dc2626' },
                  };
                  const ss = SS[status];
                  return (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tenants/${t.id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#171717', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {t.first_name[0]}{t.last_name[0]}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{t.first_name} {t.last_name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{t.unit}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>KSh {t.rent_amount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: paid > 0 ? '#059669' : 'var(--text-muted)' }}>KSh {paid.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: balance > 0 ? '#dc2626' : '#059669' }}>KSh {balance.toLocaleString()}</td>
                      <td>
                        <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                          <span className="badge-dot" />{status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {propTenants.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>No active tenants for this property.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Units tab (placeholder, links to /units) ── */}
      {tab === 'units' && (
        <div className="card-organic pd-gsap" style={{ padding: '32px 28px', textAlign: 'center' }}>
          <Home size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Unit Management</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            {property.occupied} occupied · {vacantUnits} vacant · {property.total_units} total
          </p>
          <button type="button" className="btn-organic btn-secondary"
            onClick={() => navigate('/units')} style={{ margin: '0 auto' }}>
            Manage Units →
          </button>
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={editOpen} onClose={() => setEdit(false)} title="Edit Property" description="Update this property's details.">
        <EditModal
          propId={property.id}
          initial={{ name: property.name, address: property.address, description: property.description, total_units: property.total_units, occupied: property.occupied }}
          onClose={() => setEdit(false)}
        />
      </Modal>
    </div>
  );
};
