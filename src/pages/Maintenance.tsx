import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Plus, Search, Filter, Download, Wrench, Clock, CheckCircle2, AlertCircle, MoreVertical, Eye, Edit3, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { downloadPDF } from '@/lib/export';
import { useBillingStore } from '@/stores/billingStore';
import { useMaintenanceStore, Ticket } from '@/stores/maintenanceStore';

import { usePropertyStore } from '@/stores/propertyStore';
import { useUnitStore } from '@/stores/unitStore';

const PRIORITIES = ['High', 'Medium', 'Low'];

const STATUS_CHART = [
  { label: 'Pending',     value: 0, fill: '#f59e0b' },
  { label: 'In Progress', value: 0, fill: '#4f46e5' },
  { label: 'Resolved',    value: 0, fill: '#10b981' },
];

export const Maintenance: React.FC = () => {
  const { tenants } = useBillingStore();
  const { tickets: storeTickets, addTicket, updateTicket, deleteTicket } = useMaintenanceStore();
  const { properties } = usePropertyStore();
  const { units } = useUnitStore();

  // Create derived options dynamically
  const liveProperties = properties.map(p => p.name);
  const liveUnits = units.map(u => ({
    value: u.id,
    label: `${u.unit_number} — ${u.property}`
  }));
  
  const allUnits = liveUnits.length > 0 ? liveUnits : [{ value: '', label: 'No units available' }];

  const FORM_INIT  = { title: '', unit: '', property: liveProperties[0] || '', priority: 'Medium' as const, description: '', assignee: '' };

  const [tickets, setTickets]     = useState<Ticket[]>([]);

  useEffect(() => {
    setTickets(storeTickets);
  }, [storeTickets]);

  const [searchTerm, setSearch]   = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [prioFilter, setPrio]     = useState('all');
  const [showFilter, setFilter]   = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [viewTicket, setView]     = useState<Ticket | null>(null);
  const [openMenu, setMenu]       = useState<string | null>(null);
  const [form, setForm]           = useState(FORM_INIT);
  const [formErr, setFormErr]     = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef    = useRef<HTMLDivElement>(null);
  const { success, error: errorToast } = useToast();

  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll('.gsap-item');
      if (items) gsap.fromTo(items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: containerRef }
  );

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilter(false);
      setMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.unit.toLowerCase().includes(q) || t.property.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPrio   = prioFilter === 'all' || t.priority.toLowerCase() === prioFilter;
    return matchSearch && matchStatus && matchPrio;
  });

  const chartData = STATUS_CHART.map(d => ({
    ...d,
    value: tickets.filter(t => t.status === (d.label === 'In Progress' ? 'in-progress' : d.label.toLowerCase())).length,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormErr('Issue description is required.'); return; }
    if (!form.unit.trim())  { setFormErr('Unit is required.'); return; }
    setFormErr('');
    
    const next: any = {
      ...form,
      status: 'pending',
    };
    
    const res = await addTicket(next);
    if (res.error) {
      setFormErr(res.error);
      return;
    }
    
    success('Ticket created', `${form.title}`);
    setForm(FORM_INIT);
    setShowAdd(false);
  }

  async function handleResolve(id: string) {
    const res = await updateTicket(id, { status: 'resolved' });
    if (res && res.error) { errorToast('Failed to resolve', res.error); return; }
    success('Ticket resolved', 'Status updated to Resolved.');
    setMenu(null);
  }

  async function handleDelete(id: string) {
    const res = await deleteTicket(id);
    if (res && res.error) { errorToast('Failed to delete', res.error); return; }
    success('Ticket deleted', 'Maintenance ticket removed.');
    setMenu(null);
  }

  function handleExport() {
    downloadPDF('maintenance-report.pdf', tickets.map(t => ({
      'Ticket ID': `#TKT-${String(t.id).slice(-4)}`, Title: t.title,
      Unit: t.unit, Property: t.property, Priority: t.priority,
      Status: t.status, Date: t.date, Assignee: t.assignee,
    })));
  }

  const pending    = tickets.filter(t => t.status === 'pending').length;
  const inProgress = tickets.filter(t => t.status === 'in-progress').length;
  const resolved   = tickets.filter(t => t.status === 'resolved').length;

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    pending:     { bg: '#fffbeb', color: '#d97706', label: 'Pending'     },
    'in-progress': { bg: '#eff6ff', color: '#2563eb', label: 'In Progress' },
    resolved:    { bg: '#ecfdf5', color: '#059669', label: 'Resolved'    },
  };

  const PRIO_STYLE: Record<string, { color: string }> = {
    High:   { color: '#dc2626' },
    Medium: { color: '#d97706' },
    Low:    { color: '#059669' },
  };

  return (
    <div ref={containerRef} className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">Track and resolve all property repair requests.</p>
        </div>
        <div className="page-actions">
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search tickets..." value={searchTerm} onChange={e => setSearch(e.target.value)} className="input-organic" style={{ paddingLeft: 38, padding: '10px 14px 10px 38px', fontSize: 13 }} />
          </div>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button type="button" className="btn-icon" onClick={() => setFilter(v => !v)} title="Filter">
              <Filter size={17} />
            </button>
            {showFilter && (
              <div className="filter-popover" style={{ minWidth: 220 }}>
                <div className="filter-section-label">Status</div>
                <div className="filter-pill-row">
                  {['all', 'pending', 'in-progress', 'resolved'].map(s => (
                    <button type="button" key={s} onClick={() => { setStatus(s); setFilter(false); }} className={`filter-chip ${statusFilter === s ? 'active' : ''}`}>
                      {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="filter-section-label">Priority</div>
                <div className="filter-pill-row">
                  {['all', 'high', 'medium', 'low'].map(p => (
                    <button type="button" key={p} onClick={() => { setPrio(p); setFilter(false); }} className={`filter-chip ${prioFilter === p ? 'active' : ''}`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="button" className="btn-icon" onClick={handleExport} title="Export PDF"><Download size={17} /></button>
          <button type="button" className="btn-organic btn-primary" onClick={() => { setForm(FORM_INIT); setShowAdd(true); }}>
            <Plus size={15} /> New Ticket
          </button>
        </div>
      </div>

      {/* Stats + Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 gsap-item">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Tickets', value: tickets.length, icon: Wrench,       bg: '#f5f5f5',  color: '#171717' },
              { label: 'Pending',       value: pending,        icon: Clock,        bg: '#fffbeb',  color: '#d97706' },
              { label: 'Resolved',      value: resolved,       icon: CheckCircle2, bg: '#ecfdf5',  color: '#059669' },
            ].map(s => (
              <div key={s.label} className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Chart */}
        <div className="card-organic gsap-item">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} barSize={28} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'var(--font-main)', fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontFamily: 'var(--font-main)', fontSize: 12 }}
                cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card-organic gsap-item" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>All Tickets</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} of {tickets.length}</span>
        </div>
        <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
          <table className="table-organic w-full">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Unit</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Date</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => {
                const ss = STATUS_STYLE[ticket.status];
                const ps = PRIO_STYLE[ticket.priority];
                return (
                  <tr key={ticket.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{ticket.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>#{`TKT-${String(ticket.id).slice(-4)}`} · {ticket.property}</div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>{ticket.unit}</td>
                    <td>
                      <span style={{ color: ps.color, fontWeight: 700, fontSize: 13 }}>{ticket.priority}</span>
                    </td>
                    <td style={{ fontSize: 13, color: ticket.assignee === 'Unassigned' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 500 }}>{ticket.assignee}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{ticket.date}</td>
                    <td>
                      <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                        <span className="badge-dot" />
                        {ss.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <button type="button" className="btn-icon" style={{ width: 30, height: 30, border: 'none' }} onClick={() => setMenu(openMenu === ticket.id ? null : ticket.id)}>
                          <MoreVertical size={14} />
                        </button>
                        {openMenu === ticket.id && (
                          <div className="ctx-menu">
                            <button type="button" className="ctx-menu-item" onClick={() => { setView(ticket); setMenu(null); }}><Eye size={13} /> View Details</button>
                            {ticket.status !== 'resolved' && (
                              <button type="button" className="ctx-menu-item" onClick={() => handleResolve(ticket.id)}><CheckCircle2 size={13} /> Mark Resolved</button>
                            )}
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                            <button type="button" className="ctx-menu-item danger" onClick={() => handleDelete(ticket.id)}><Trash2 size={13} /> Delete</button>
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
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No tickets match your filters.</div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setFormErr(''); }} title="New Maintenance Ticket" description="Log a repair or maintenance request.">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formErr && <div className="modal-error">{formErr}</div>}
          <div>
            <label className="modal-label">Issue Description *</label>
            <input className="modal-input" placeholder="e.g. Leaking sink in kitchen" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="modal-form-grid">
            <div>
              <label className="modal-label">Unit *</label>
              <select aria-label="Unit" className="modal-input" value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                <option value="">Select a unit…</option>
                {allUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Property</label>
              <select aria-label="Property" className="modal-input" value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))}>
                {liveProperties.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Priority</label>
              <select aria-label="Priority" className="modal-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'High' | 'Medium' | 'Low' }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Assignee</label>
              <input className="modal-input" placeholder="e.g. John Plumber" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="modal-label">Details</label>
            <textarea className="modal-input" rows={3} placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-form-actions">
            <button type="button" className="modal-btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="modal-btn-submit">Create Ticket</button>
          </div>
        </form>
      </Modal>

      {/* View Ticket Modal */}
      <Modal isOpen={!!viewTicket} onClose={() => setView(null)} title={viewTicket?.title || ''} description={`#TKT-${String(viewTicket?.id || '').slice(-4)} · ${viewTicket?.property}`} size="sm">
        {viewTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Unit',        value: viewTicket.unit },
              { label: 'Priority',    value: viewTicket.priority },
              { label: 'Status',      value: STATUS_STYLE[viewTicket.status].label },
              { label: 'Date',        value: viewTicket.date },
              { label: 'Assignee',    value: viewTicket.assignee },
              { label: 'Description', value: viewTicket.description },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{row.value}</span>
              </div>
            ))}
            <div className="modal-form-actions" style={{ marginTop: 8 }}>
              <button type="button" className="modal-btn-cancel" onClick={() => setView(null)}>Close</button>
              {viewTicket.status !== 'resolved' && (
                <button type="button" className="modal-btn-submit" onClick={() => { handleResolve(viewTicket.id); setView(null); }}>Mark Resolved</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
